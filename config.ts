
export const API_CONFIG = {
  BASE_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin,
  ENDPOINTS: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    SYNC: '/api/sync',
  },
};

export const CONFIG = {
  APP_NAME: 'Busy Bee English',
  DB_NAME: 'BusyBee_V3',
  BACKUP_FILE_NAME: 'busybee_backup.json',
  GOOGLE_CLIENT_ID: '',
};
