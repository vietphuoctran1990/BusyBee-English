import { useEffect, useRef, useState, useCallback } from 'react';
import { LanguageType } from '../types';
import { STORAGE_KEYS } from '../utils/storageKeys';

const NOTIF_KEY = STORAGE_KEYS.NOTIF;

function scheduleReminder(hour: number, lang: LanguageType) {
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: 'SCHEDULE_REMINDER', hour, minute: 0, lang });
  } catch { /* SW not ready — ignore */ }
}

interface Options {
  enabled: boolean;       // gate everything on login
  lang: LanguageType;
  onGranted: () => void;  // surface a success toast
}

/**
 * Daily-reminder notification flow:
 *  - re-schedules the reminder on load if previously granted+enabled,
 *  - shows a soft opt-in prompt 45s into the first session (permission still
 *    "default" and the user hasn't responded before).
 */
export function useNotificationPrompt({ enabled, lang, onGranted }: Options) {
  const [showPrompt, setShowPrompt] = useState(false);
  const shownRef = useRef(false);

  // Re-schedule on load when already enabled.
  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = localStorage.getItem(NOTIF_KEY);
      if (!saved) return;
      const prefs = JSON.parse(saved);
      if (prefs.enabled && Notification.permission === 'granted') {
        navigator.serviceWorker?.ready.then(reg => {
          reg.active?.postMessage({ type: 'SCHEDULE_REMINDER', hour: prefs.hour ?? 8, minute: 0, lang });
        }).catch(() => {});
      }
    } catch { /* malformed prefs — ignore */ }
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Soft prompt after 45s on first undecided session.
  useEffect(() => {
    if (!enabled || shownRef.current) return;
    if (!('Notification' in window)) return;
    try {
      if (localStorage.getItem(NOTIF_KEY)) return; // already responded
    } catch { /* ignore */ }
    if (Notification.permission !== 'default') return;
    const timer = setTimeout(() => {
      if (!shownRef.current) {
        shownRef.current = true;
        setShowPrompt(true);
      }
    }, 45000);
    return () => clearTimeout(timer);
  }, [enabled]);

  const confirm = useCallback(async (hour: number) => {
    setShowPrompt(false);
    try {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: permission === 'granted', hour, dismissedAt: null }));
      if (permission === 'granted') {
        scheduleReminder(hour, lang);
        onGranted();
      }
    } catch { /* permission API failed — ignore */ }
  }, [lang, onGranted]);

  const dismiss = useCallback(() => {
    setShowPrompt(false);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify({ enabled: false, dismissedAt: new Date().toISOString() }));
    } catch { /* ignore */ }
  }, []);

  return { showPrompt, confirm, dismiss };
}
