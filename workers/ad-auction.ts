// ─── Cloudflare Worker: Ad Auction Engine ───
// Processes ad requests and runs real-time auctions across multiple networks

interface AdNetwork {
  id: string;
  name: string;
  type: 'adsense' | 'adx' | 'prebid' | 'facebook' | 'aps' | 'custom';
  priority: number;
  weight: number;
  enabled: boolean;
  config: Record<string, string>;
  ecpmFloor: number;
}

interface AuctionRequest {
  placementType: 'banner' | 'interstitial' | 'fullscreen' | 'rewarded';
  userId?: string;
  keywords?: string[];
  currentPage?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

interface BidResult {
  networkId: string;
  networkName: string;
  bid: number;
  currency: string;
  latency: number;
  status: 'won' | 'lost' | 'no_fill' | 'timeout' | 'error';
  adCode: string;
}

interface AuctionResult {
  winner: BidResult;
  waterfall: BidResult[];
  auctionId: string;
  timestamp: number;
  totalLatency: number;
}

// ─── Network Registry ───
// In production: fetched from Supabase. Here as fallback.
const DEFAULT_NETWORKS: AdNetwork[] = [
  {
    id: 'adx', name: 'Google AdX', type: 'adx', priority: 10, weight: 1.5, enabled: true,
    config: { publisher_id: 'pub-XXX', gam_network_code: 'XXXX' }, ecpmFloor: 0.50
  },
  {
    id: 'rubicon', name: 'Magnite (Rubicon)', type: 'prebid', priority: 15, weight: 1.3, enabled: true,
    config: { account_id: 'XXX', site_id: 'XXX', endpoint: 'https://fastlane.rubiconproject.com/a/api/fastlane.json' },
    ecpmFloor: 0.25
  },
  {
    id: 'index', name: 'Index Exchange', type: 'prebid', priority: 16, weight: 1.2, enabled: true,
    config: { site_id: 'XXX', endpoint: 'https://as.casalemedia.com/cygnus' }, ecpmFloor: 0.20
  },
  {
    id: 'pubmatic', name: 'PubMatic', type: 'prebid', priority: 17, weight: 1.1, enabled: true,
    config: { publisher_id: 'XXX', endpoint: 'https://hbopenbid.pubmatic.com/translator' }, ecpmFloor: 0.15
  },
  {
    id: 'openx', name: 'OpenX', type: 'prebid', priority: 18, weight: 1.0, enabled: true,
    config: { delivery_domain: 'XXX', endpoint: 'https://u.openx.net/w/1.0/arj' }, ecpmFloor: 0.10
  },
  {
    id: 'adsense', name: 'Google AdSense', type: 'adsense', priority: 20, weight: 0.8, enabled: true,
    config: { publisher_id: 'ca-pub-XXX', banner_slot: 'XXX', interstitial_slot: 'XXX' }, ecpmFloor: 0.01
  },
  {
    id: 'facebook', name: 'Facebook AN', type: 'facebook', priority: 30, weight: 0.7, enabled: true,
    config: { app_id: 'XXX', banner_placement: 'XXX', interstitial_placement: 'XXX' }, ecpmFloor: 0.01
  },
  {
    id: 'aps', name: 'Amazon Publisher Services', type: 'aps', priority: 14, weight: 1.4, enabled: true,
    config: { pub_id: 'XXX', endpoint: 'https://aax-eu.amazon-adsystem.com/e/dtb/bid' }, ecpmFloor: 0.30
  }
];

// ─── Saved in KV for performance optimization ───
interface NetworkPerformance {
  avgCPM: number;
  fillRate: number;
  avgLatency: number;
  totalAuctions: number;
  wins: number;
  lastUpdated: number;
}

// ─── Main Auction Logic ───
async function runAuction(
  request: AuctionRequest,
  networks: AdNetwork[],
  kv?: KVNamespace
): Promise<AuctionResult> {
  const auctionId = crypto.randomUUID();
  const startTime = Date.now();

  // Step 1: Filter enabled networks and sort by (historical CPM × fill rate × weight)
  const eligibleNetworks = networks
    .filter(n => n.enabled)
    .filter(n => {
      // Don't use Facebook for rewarded (known low fill)
      if (request.placementType === 'rewarded' && n.type === 'facebook') return false;
      return true;
    })
    .sort((a, b) => {
      const scoreA = a.weight * (1000 - a.priority);
      const scoreB = b.weight * (1000 - b.priority);
      return scoreB - scoreA;
    });

  // Step 2: Run parallel bids (timeout: 2 seconds)
  const bidPromises = eligibleNetworks.map(network =>
    requestBidWithTimeout(network, request, 2000)
  );

  const bidResults = await Promise.all(bidPromises);

  // Step 3: Rank by bid amount
  const validBids = bidResults
    .filter(b => b.status !== 'error' && b.status !== 'timeout')
    .sort((a, b) => b.bid - a.bid);

  // Step 4: Determine winner
  let winner: BidResult;

  if (validBids.length > 0 && validBids[0].bid > 0.01) {
    winner = { ...validBids[0], status: 'won' };
    // Mark others as lost
    for (const bid of validBids.slice(1)) {
      bid.status = 'lost';
    }
  } else {
    // No winning bid — use fallback (lowest priority network)
    const fallback = eligibleNetworks[eligibleNetworks.length - 1] || {
      id: 'internal',
      name: 'Internal Promo',
      type: 'custom' as const,
      priority: 999,
      weight: 0,
      enabled: true,
      config: {},
      ecpmFloor: 0
    };

    winner = {
      networkId: fallback.id,
      networkName: fallback.name,
      bid: 0,
      currency: 'USD',
      latency: 0,
      status: 'won',
      adCode: generateInternalAd(request.placementType)
    };

    validBids.push(winner);
  }

  const waterfall = bidResults.map(b => {
    if (b.networkId === winner.networkId) return { ...b, status: 'won' as const };
    if (b.status === 'won') return { ...b, status: 'lost' as const };
    return b;
  });

  // Step 5: Log to KV (async, don't block response)
  if (kv) {
    const logEntry = {
      auctionId,
      placementType: request.placementType,
      winner: { id: winner.networkId, name: winner.networkName, bid: winner.bid },
      waterfall: waterfall.map(w => ({ network: w.networkName, bid: w.bid, status: w.status })),
      timestamp: Date.now()
    };

    ctx?.waitUntil(
      kv.put(`auction:${auctionId}`, JSON.stringify(logEntry), { expirationTtl: 86400 })
    );
  }

  return {
    winner,
    waterfall,
    auctionId,
    timestamp: Date.now(),
    totalLatency: Date.now() - startTime
  };
}

// ─── Per-Network Bid Request ───
async function requestBidWithTimeout(
  network: AdNetwork,
  request: AuctionRequest,
  timeoutMs: number
): Promise<BidResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const cpm = await simulateBid(network, request);
    clearTimeout(timeout);

    const latency = Date.now() - startTime;

    if (cpm <= 0) {
      return {
        networkId: network.id,
        networkName: network.name,
        bid: 0,
        currency: 'USD',
        latency,
        status: 'no_fill',
        adCode: ''
      };
    }

    return {
      networkId: network.id,
      networkName: network.name,
      bid: cpm,
      currency: 'USD',
      latency,
      status: 'won', // Temporary; sorted later
      adCode: generateAdCode(network, request.placementType, cpm)
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    const isTimeout = (err as Error).name === 'AbortError';

    return {
      networkId: network.id,
      networkName: network.name,
      bid: 0,
      currency: 'USD',
      latency,
      status: isTimeout ? 'timeout' : 'error',
      adCode: ''
    };
  }
}

// ─── Simulated Bidding (Replace with real SSP calls) ───
async function simulateBid(network: AdNetwork, request: AuctionRequest): Promise<number> {
  // In production: make actual fetch() calls to each SSP's RTB endpoint
  // with proper OpenRTB 2.5 request format

  const baseCPMs: Record<string, { min: number; max: number }> = {
    adx: { min: 3.0, max: 14.0 },
    prebid: { min: 2.0, max: 10.0 },
    aps: { min: 2.5, max: 11.0 },
    adsense: { min: 0.5, max: 3.5 },
    facebook: { min: 1.0, max: 7.0 },
    custom: { min: 0.1, max: 1.0 }
  };

  const range = baseCPMs[network.type] || { min: 0.1, max: 1.0 };

  // Apply placement type multiplier
  const multiplier = request.placementType === 'rewarded' ? 3.0
    : request.placementType === 'interstitial' ? 2.0
    : request.placementType === 'fullscreen' ? 1.5
    : 1.0;

  const base = range.min + Math.random() * (range.max - range.min);
  const cpm = base * network.weight * multiplier;

  // 15% chance of no fill for lower-priority networks
  if (network.priority > 18 && Math.random() < 0.15) return 0;

  return Math.round(cpm * 100) / 100;
}

// ─── Ad Code Generators ───
function generateAdCode(network: AdNetwork, placementType: string, cpm: number): string {
  const slotId = `${network.id}-${placementType}-${Date.now()}`;

  switch (network.type) {
    case 'adsense':
      return `<ins class="adsbygoogle" style="display:block" data-ad-client="${network.config.publisher_id}" data-ad-slot="${network.config[`${placementType}_slot`] || 'FALLBACK'}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({})</script>`;

    case 'adx':
      return `<div id="div-gpt-ad-${slotId}"><script>googletag.cmd.push(function(){googletag.defineSlot('/${network.config.gam_network_code}/coin-${placementType}',[[320,50],[300,250],[728,90]],'div-gpt-ad-${slotId}').addService(googletag.pubads());googletag.enableServices();googletag.display('div-gpt-ad-${slotId}');});</script></div>`;

    case 'facebook':
      return `<div class="fb-ad" data-placementid="${network.config[`${placementType}_placement`] || 'XXX'}" data-format="${placementType === 'banner' ? '320x50' : 'fullscreen'}" data-testmode="false"></div>`;

    case 'prebid':
      return `<div id="${slotId}" class="prebid-ad" data-bidder="${network.id}" data-cpm="${cpm}" data-placement="${placementType}"></div><script>window.__pb_ads=window.__pb_ads||[];window.__pb_ads.push({id:'${slotId}',bidder:'${network.id}',cpm:${cpm},slot:'${slotId}'});</script>`;

    case 'aps':
      return `<div id="${slotId}" class="aps-ad" data-pub-id="${network.config.pub_id}" data-slot="${placementType}"></div>`;

    default:
      return generateInternalAd(placementType);
  }
}

function generateInternalAd(placementType: string): string {
  const messages: Record<string, string> = {
    banner: 'Upgrade to Premium — No Ads',
    interstitial: 'Enjoying Coin Identifier? Go Premium!',
    fullscreen: 'Discover Rare Coins — Learn More',
    rewarded: 'Unlock Premium Features Free'
  };
  return `<div style="display:flex;align-items:center;justify-content:center;padding:16px;background:linear-gradient(135deg,#1e3a5f,#0f172a);border-radius:12px;color:white;text-align:center;min-height:60px;font-family:Inter,sans-serif"><div><span style="font-size:22px">🪙</span><p style="margin:2px 0;font-weight:600;font-size:13px">${messages[placementType] || 'Coin Identifier'}</p><p style="margin:0;font-size:11px;opacity:0.7">Tap to learn more</p></div></div>`;
}

// ─── CORS Headers ───
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── Cloudflare Worker Entry Point ───
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders();

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // Route: /api/ad-auction
    if (url.pathname === '/api/ad-auction' && request.method === 'POST') {
      try {
        const body: AuctionRequest = await request.json();

        if (!body.placementType) {
          return new Response(JSON.stringify({ error: 'placementType is required' }), {
            status: 400,
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
        }

        // In production: fetch networks from Supabase
        // const { data: networks } = await supabase.from('ad_networks').select('*').eq('enabled', true);
        const networks = DEFAULT_NETWORKS;

        const result = await runAuction(body, networks, env.AD_CACHE);

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Auction failed', detail: String(err) }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }
    }

    // Route: /api/ad-config
    if (url.pathname === '/api/ad-config') {
      const config = {
        version: '2.0',
        auctionStrategy: 'waterfall_with_prebid',
        auctionTimeout: 2000,
        bannerRefreshInterval: 60000,
        interstitialCooldownMs: 120000,
        fullscreenCooldownMs: 300000,
        networks: DEFAULT_NETWORKS.map(n => ({
          id: n.id, name: n.name, type: n.type, enabled: n.enabled, priority: n.priority
        })),
        prebidConfig: {
          enabled: false,
          bidders: ['rubicon', 'indexExchange', 'pubmatic', 'openx'],
          priceGranularity: 'medium',
          userSync: { filterSettings: { iframe: { bidders: '*', filter: 'include' } } }
        }
      };

      return new Response(JSON.stringify(config), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
      });
    }

    // Route: /api/ad-report
    if (url.pathname === '/api/ad-report' && request.method === 'POST') {
      try {
        const body: { auctionId: string; networkId: string; event: string; amount?: number } = await request.json();

        // In production: INSERT into Supabase ad_performance, ad_auction_log
        console.log(`[Report] ${body.event}: network=${body.networkId}, auction=${body.auctionId}`);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      } catch {
        return new Response(JSON.stringify({ success: false }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' }
        });
      }
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
};

// Type declarations for Cloudflare Workers
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  AD_CACHE: KVNamespace;
}
declare const ctx: ExecutionContext;
declare const KVNamespace: any;