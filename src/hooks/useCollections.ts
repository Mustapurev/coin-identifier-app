import { useCallback, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { db } from '../lib/db';
import { generateId } from '../lib/utils';
import type { Collection } from '../types';

export function useCollections() {
  const { user, collections, setCollections, addCollection, updateCollection, removeCollection } = useAppStore();

  const loadCollections = useCallback(async () => {
    if (!user) { setCollections([]); return; }
    const uc = await db.getCollectionsByUser(user.id);
    setCollections(uc);
  }, [user, setCollections]);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  const createCollection = useCallback(async (name: string, desc: string, isPublic = false) => {
    if (!user) throw new Error('Must be logged in');
    const c: Collection = { id: generateId(), name, description: desc, coverImageUrl: '', coinIds: [], createdAt: Date.now(), updatedAt: Date.now(), isPublic, userId: user.id };
    await db.collections.put(c);
    addCollection(c);
    return c;
  }, [user, addCollection]);

  const addCoin = useCallback(async (cid: string, coinId: string) => {
    await db.addCoinToCollection(cid, coinId);
    const c = collections.find((x) => x.id === cid);
    if (c && !c.coinIds.includes(coinId)) updateCollection(cid, { coinIds: [...c.coinIds, coinId] });
  }, [collections, updateCollection]);

  const removeCoin = useCallback(async (cid: string, coinId: string) => {
    await db.removeCoinFromCollection(cid, coinId);
    const c = collections.find((x) => x.id === cid);
    if (c) updateCollection(cid, { coinIds: c.coinIds.filter((id) => id !== coinId) });
  }, [collections, updateCollection]);

  const deleteCollection = useCallback(async (cid: string) => { await db.collections.delete(cid); removeCollection(cid); }, [removeCollection]);
  const editCollection = useCallback(async (cid: string, u: { name?: string; description?: string; isPublic?: boolean }) => { await db.collections.update(cid, u); updateCollection(cid, u); }, [updateCollection]);

  return { collections, loadCollections, createCollection, addCoin, removeCoin, deleteCollection, editCollection };
}