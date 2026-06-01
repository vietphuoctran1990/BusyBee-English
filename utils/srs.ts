import { LearningItem } from '../types';

// ── SM-2 spaced-repetition constants ─────────────────────────────────────────
export const SRS = {
  EASE_DEFAULT: 2.5,
  EASE_MAX: 3.0,
  EASE_MIN: 1.3,
  EASE_UP: 0.1,
  EASE_DOWN: 0.2,
  INTERVAL_FIRST: 1, // days after first correct answer
  INTERVAL_SECOND: 6, // days after second correct answer
  PROFICIENCY_STEP: 10,
  PROFICIENCY_MAX: 100,
  PROFICIENCY_MIN: 0,
  MS_PER_DAY: 86_400_000,
} as const;

/**
 * Apply one SM-2 review outcome to an item and return the fields to patch.
 * Shared by every practice game so the algorithm lives in exactly one place.
 */
export function applySM2(item: LearningItem, correct: boolean): Partial<LearningItem> {
  const ef = item.srsEaseFactor ?? SRS.EASE_DEFAULT;
  const interval = item.srsInterval ?? 0;
  const newInterval = correct
    ? interval === 0
      ? SRS.INTERVAL_FIRST
      : interval === 1
        ? SRS.INTERVAL_SECOND
        : Math.round(interval * ef)
    : SRS.INTERVAL_FIRST;
  return {
    srsInterval: newInterval,
    srsEaseFactor: correct
      ? Math.min(SRS.EASE_MAX, ef + SRS.EASE_UP)
      : Math.max(SRS.EASE_MIN, ef - SRS.EASE_DOWN),
    srsNextReview: Date.now() + newInterval * SRS.MS_PER_DAY,
    proficiency: correct
      ? Math.min(SRS.PROFICIENCY_MAX, (item.proficiency ?? 0) + SRS.PROFICIENCY_STEP)
      : Math.max(SRS.PROFICIENCY_MIN, (item.proficiency ?? 0) - SRS.PROFICIENCY_STEP),
    updatedAt: Date.now(),
  };
}
