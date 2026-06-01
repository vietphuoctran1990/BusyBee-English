// Lightweight error logger. Keeps a single, greppable place for swallowed
// failures so persistence/sync bugs aren't completely silent in the field.
export function logError(context: string, err: unknown): void {
  // Always surface to console — these are real failures (DB write, cloud sync),
  // not expected control flow. Cheap enough to keep in production.
  console.warn(`[BusyBee] ${context}:`, err);
}
