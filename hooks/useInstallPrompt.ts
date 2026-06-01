
import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/storageKeys';

const DISMISS_KEY = STORAGE_KEYS.INSTALL_DISMISSED;
const DISMISS_DAYS = 14;

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      // Honor dismissal cooldown
      try {
        const last = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
        if (last && Date.now() - last < DISMISS_DAYS * 86_400_000) return;
      } catch {}
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const accept = useCallback(async () => {
    if (!deferred) return;
    try {
      deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    setShow(false);
  }, [deferred]);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShow(false);
  }, []);

  return { show, accept, dismiss };
}
