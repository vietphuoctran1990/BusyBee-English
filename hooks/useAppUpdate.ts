import { useEffect, useRef, useState, useCallback } from 'react';

declare const __BUILD_TIME__: string | undefined;

/**
 * Detects when a newer deployment is available and exposes a way to apply it.
 * Two signals:
 *  1. A waiting service worker (the `swUpdateReady` event fired from index.html).
 *  2. version.json's buildTime differing from the build this tab is running
 *     (polled every 5 min while `enabled`).
 */
export function useAppUpdate(enabled: boolean) {
  const [updateReady, setUpdateReady] = useState(false);
  const swRegRef = useRef<ServiceWorkerRegistration | null>(null);
  const knownBuildTime = useRef<string>(typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '');

  // Waiting-SW signal from index.html.
  useEffect(() => {
    const onSwUpdate = (e: Event) => {
      swRegRef.current = (e as CustomEvent).detail as ServiceWorkerRegistration;
      setUpdateReady(true);
    };
    window.addEventListener('swUpdateReady', onSwUpdate);
    return () => window.removeEventListener('swUpdateReady', onSwUpdate);
  }, []);

  // version.json polling.
  useEffect(() => {
    if (!enabled) return;
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const data: { buildTime: string } = await res.json();
        if (data.buildTime && knownBuildTime.current && data.buildTime !== knownBuildTime.current) {
          setUpdateReady(true);
        }
      } catch {
        /* offline / transient — ignore, will retry next interval */
      }
    };
    const initial = setTimeout(checkVersion, 30_000);
    const interval = setInterval(checkVersion, 5 * 60_000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [enabled]);

  const applyUpdate = useCallback(() => {
    if (swRegRef.current?.waiting) {
      swRegRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  }, []);

  const dismissUpdate = useCallback(() => setUpdateReady(false), []);

  return { updateReady, applyUpdate, dismissUpdate };
}
