
// Offline action queue: record mutations while offline, replay when back online.
// Each action is idempotent enough that replaying once is safe.

import { LearningItem, StoryData, UserStats } from '../types';

const QUEUE_KEY = 'busybee_offline_queue_v1';

export type QueuedAction =
  | { type: 'add_item'; item: LearningItem; ts: number }
  | { type: 'update_item'; itemId: string; patch: Partial<LearningItem>; ts: number }
  | { type: 'delete_item'; itemId: string; ts: number }
  | { type: 'save_story'; story: StoryData; ts: number }
  | { type: 'delete_story'; storyId: string; ts: number }
  | { type: 'update_stats'; patch: Partial<UserStats>; ts: number };

function readQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(actions: QueuedAction[]) {
  try {
    if (actions.length === 0) localStorage.removeItem(QUEUE_KEY);
    else localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
  } catch {}
}

// Distributive Omit preserves the discriminated union so `action.type` narrows correctly.
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
type QueuedActionInput = DistributiveOmit<QueuedAction, 'ts'> & { ts?: number };

export function enqueueAction(action: QueuedActionInput) {
  const queue = readQueue();
  // Coalesce: if the same item gets updated multiple times, merge patches
  if (action.type === 'update_item') {
    const last = queue[queue.length - 1];
    if (last && last.type === 'update_item' && last.itemId === action.itemId) {
      last.patch = { ...last.patch, ...action.patch };
      last.ts = Date.now();
      writeQueue(queue);
      return;
    }
  }
  queue.push({ ...action, ts: action.ts ?? Date.now() } as QueuedAction);
  writeQueue(queue);
}

export function getQueueSize(): number {
  return readQueue().length;
}

export function clearQueue() {
  writeQueue([]);
}

export interface ReplayHandlers {
  onAddItem: (item: LearningItem) => Promise<void>;
  onUpdateItem: (id: string, patch: Partial<LearningItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSaveStory: (story: StoryData) => Promise<void>;
  onDeleteStory: (id: string) => Promise<void>;
  onUpdateStats: (patch: Partial<UserStats>) => Promise<void>;
}

export async function replayQueue(handlers: ReplayHandlers): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  let replayed = 0;
  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      switch (action.type) {
        case 'add_item':       await handlers.onAddItem(action.item); break;
        case 'update_item':    await handlers.onUpdateItem(action.itemId, action.patch); break;
        case 'delete_item':    await handlers.onDeleteItem(action.itemId); break;
        case 'save_story':     await handlers.onSaveStory(action.story); break;
        case 'delete_story':   await handlers.onDeleteStory(action.storyId); break;
        case 'update_stats':   await handlers.onUpdateStats(action.patch); break;
      }
      replayed++;
    } catch (e) {
      failed.push(action);
    }
  }

  writeQueue(failed); // keep failures for retry
  return replayed;
}
