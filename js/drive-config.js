/**
 * Google Drive Automatic Portfolio Sync Configuration
 * Master Folder: 1_NBGK91q5XWeJibvMIc8fMX0NS4qSTBG
 */

export const DRIVE_CONFIG = {
  // Master Google Drive portfolio folder ID
  masterFolderId: '1_NBGK91q5XWeJibvMIc8fMX0NS4qSTBG',
  
  // Google Apps Script Web App URL (replace with your deployed URL from google_apps_script_code.js)
  // When set, the website automatically pulls newly added media files directly from Drive.
  appsScriptUrl: '',

  // Enable or disable live automatic synchronization
  autoSyncEnabled: true,

  // Cache duration in milliseconds (5 minutes = 300000ms)
  // Prevents unnecessary repeated API queries while browsing
  cacheDurationMs: 5 * 60 * 1000
};
