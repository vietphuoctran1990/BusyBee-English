// Single source of truth for every localStorage key the app uses.
// Centralising these prevents the same key being re-declared (and drifting)
// across components/hooks, which would silently split or lose persisted data.
export const STORAGE_KEYS = {
  USER: 'kidlingo_user_clay_v2',
  STATS: 'kidlingo_stats_clay_v2',
  SETTINGS: 'kidlingo_settings_clay_v2',
  NOTIF: 'busybee_notif_prefs',
  SYNC: 'busybee_sync_code',
  DECKS: 'busybee_decks_v1',
  PARENT_PIN: 'busybee_parent_pin',
  FOCUS_PIN: 'busybee_focus_pin',
  INSTALL_DISMISSED: 'busybee_install_dismissed_at',
  OFFLINE_QUEUE: 'busybee_offline_queue_v1',
} as const;
