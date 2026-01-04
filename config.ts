
export const API_CONFIG = {
  // Thay đổi URL này thành địa chỉ hosting thực tế của bạn
  BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://your-hosting-domain.com',
  ENDPOINTS: {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    SYNC: '/api/sync'
  }
};

export const CONFIG = {
    APP_NAME: 'KidLingo AI Pro',
    DB_NAME: 'KidLingo_V3_Secure',
    BACKUP_FILE_NAME: 'kidlingo_backup.json',
    GOOGLE_CLIENT_ID: ''
};

export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
