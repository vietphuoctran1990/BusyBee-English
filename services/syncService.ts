import { LearningItem, StoryData, UserStats } from '../types';

const BASE = '/api/sync';

/** Generate a 6-char alphanumeric sync code (no ambiguous chars like O/0/I/1). */
export const generateSyncCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export interface SyncData {
  items: LearningItem[];
  stories: StoryData[];
  stats: UserStats | null;
  updatedAt?: number;
}

/** Check if a sync code has data on the server */
export const checkCodeExists = async (code: string): Promise<'found' | 'not_found' | 'error'> => {
  try {
    const res = await fetch(`${BASE}?code=${code.toUpperCase()}`, { method: 'GET' });
    if (res.status === 404) return 'not_found';
    if (res.ok) return 'found';
    const body = await res.text().catch(() => '');
    console.warn('[Sync] checkCodeExists error:', res.status, body);
    return 'error';
  } catch (e) {
    console.warn('[Sync] checkCodeExists fetch failed:', e);
    return 'error';
  }
};

/** Download all data for a sync code */
export const downloadData = async (code: string): Promise<SyncData> => {
  try {
    const res = await fetch(`${BASE}?code=${code.toUpperCase()}`);
    if (res.status === 404) return { items: [], stories: [], stats: null };
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[Sync] downloadData error:', res.status, body);
      return { items: [], stories: [], stats: null };
    }
    return await res.json() as SyncData;
  } catch (e) {
    console.warn('[Sync] downloadData fetch failed:', e);
    return { items: [], stories: [], stats: null };
  }
};

/** Upload all data for a sync code */
export const uploadData = async (code: string, data: SyncData): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE}?code=${code.toUpperCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn('[Sync] uploadData error:', res.status, body);
    }
    return res.ok;
  } catch (e) {
    console.warn('[Sync] uploadData fetch failed:', e);
    return false;
  }
};
