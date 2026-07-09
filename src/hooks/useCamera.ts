import { useState, useCallback, useRef, useEffect } from 'react';
import { hasCamera } from '../lib/utils';

interface UseCameraReturn {
  stream: MediaStream | null; error: string | null; isActive: boolean;
  startCamera: () => Promise<void>; stopCamera: () => void;
  captureImage: () => Promise<Blob | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>; hasPermission: boolean;
}

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async () => {
    if (!hasCamera()) { setError('Camera not available on this device.'); return; }
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      setStream(ms); setIsActive(true); setError(null);
      if (videoRef.current) { videoRef.current.srcObject = ms; await videoRef.current.play(); }
    } catch (err: any) {
      const m = err instanceof DOMException ? (err.name === 'NotAllowedError' ? 'Camera permission denied.' : err.name === 'NotFoundError' ? 'No camera found.' : err.message) : 'Failed to access camera.';
      setError(m); setIsActive(false);
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); setIsActive(false); }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    return new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', 0.9));
  }, []);

  useEffect(() => { return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); }; }, [stream]);

  return { stream, error, isActive, startCamera, stopCamera, captureImage, videoRef, hasPermission: isActive };
}