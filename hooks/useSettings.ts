
import { useState, useEffect } from 'react';
import { AppSettings } from '../types';

const SETTINGS_KEY = 'kidlingo_settings_clay_v2';

const DEFAULT_SETTINGS: AppSettings = { accent: 'US', language: 'vn' };

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      return s ? JSON.parse(s) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-dark', 'true');
    } else {
      document.documentElement.removeAttribute('data-dark');
    }
  }, [settings.darkMode]);

  // Apply font size attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-font', settings.fontSize ?? 'M');
  }, [settings.fontSize]);

  return { settings, setSettings };
}
