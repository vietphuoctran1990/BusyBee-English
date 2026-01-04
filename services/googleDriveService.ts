
import { CONFIG } from '../config';

// Global types for Google APIs
declare const google: any;
declare const gapi: any;

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Check if we have a valid config
export const hasGoogleConfig = (): boolean => {
    return !!CONFIG.GOOGLE_CLIENT_ID && CONFIG.GOOGLE_CLIENT_ID.length > 0;
};

export const initGoogleDrive = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const clientId = CONFIG.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
        console.warn("Google Client ID is missing in config.ts");
        resolve(false);
        return;
    }

    const gapiLoaded = () => {
      gapi.load('client', async () => {
        await gapi.client.init({
          // apiKey: '',  // Not needed for OAuth2 and can cause errors if empty
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkAuth();
      });
    };

    const gisLoaded = () => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: '', // defined later
      });
      gisInited = true;
      checkAuth();
    };

    const checkAuth = () => {
      if (gapiInited && gisInited) resolve(true);
    };
    
    // Safety timeout in case scripts fail to load (e.g. adblocker)
    setTimeout(() => {
        if (!gapiInited || !gisInited) {
            console.warn("Google Scripts failed to load or timed out");
            resolve(false);
        }
    }, 5000);

    if (typeof gapi !== 'undefined') gapiLoaded();
    else {
        setTimeout(() => { if(typeof gapi !== 'undefined') gapiLoaded() }, 1000);
    }

    if (typeof google !== 'undefined') gisLoaded();
    else {
        setTimeout(() => { if(typeof google !== 'undefined') gisLoaded() }, 1000);
    }
  });
};

export const signInToGoogle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google API not initialized");
    
    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve();
    };

    // Always request consent for the first time to ensure we get a refreshable session context if possible
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const signOutGoogle = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
};

export const isSignedIn = (): boolean => {
    return gapiInited && gapi.client.getToken() !== null;
};

const findBackupFile = async (): Promise<string | null> => {
  try {
    const response = await gapi.client.drive.files.list({
      q: `name = '${CONFIG.BACKUP_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    const files = response.result.files;
    if (files && files.length > 0) {
      return files[0].id;
    }
    return null;
  } catch (e) {
    console.error("Error finding file", e);
    return null;
  }
};

export const downloadBackup = async (): Promise<any | null> => {
  if (!isSignedIn()) return null;
  try {
    const fileId = await findBackupFile();
    if (!fileId) return null;

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return response.result; 
  } catch (e) {
    console.error("Download failed", e);
    return null;
  }
};

export const uploadBackup = async (data: any): Promise<boolean> => {
  if (!isSignedIn()) return false;
  try {
    const fileId = await findBackupFile();
    const fileContent = JSON.stringify(data);
    
    const metadata = {
      name: CONFIG.BACKUP_FILE_NAME,
      mimeType: 'application/json',
    };

    const accessToken = gapi.client.getToken().access_token;
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (fileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method: method,
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });

    return response.ok;
  } catch (e) {
    console.error("Upload failed", e);
    return false;
  }
};
