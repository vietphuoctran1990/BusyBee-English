import { LearningItem, StoryData, UserStats } from '../types';

const BASE = '/api/sync';

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
    return 'error';
  } catch {
    return 'error';
  }
};

/** Download all data for a sync code */
export const downloadData = async (code: string): Promise<SyncData> => {
  try {
    const res = await fetch(`${BASE}?code=${code.toUpperCase()}`);
    if (!res.ok) return { items: [], stories: [], stats: null };
    return await res.json() as SyncData;
  } catch {
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
    return res.ok;
  } catch {
    return false;
  }
};
