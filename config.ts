
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

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};
