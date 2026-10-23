/**
 * ============================================================================
 * OSENI QUADRI PORTFOLIO — GOOGLE APPS SCRIPT LIVE FEED
 * ============================================================================
 * 
 * INSTRUCTIONS FOR ACTIVATION (Takes ~1 minute):
 * 1. Open your browser and go to: https://script.google.com
 * 2. Click "+ New Project" (top-left).
 * 3. Delete any code in the editor, and paste this ENTIRE code block below.
 * 4. Click the "Save" icon (floppy disk) or press Ctrl+S.
 * 5. Click the blue "Deploy" button (top-right) -> select "New deployment".
 * 6. Under "Select type" (gear icon on the left), choose "Web app".
 * 7. Set the fields:
 *    - Description: "Portfolio Live Feed"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so your website can read it)
 * 8. Click "Deploy".
 *    (Google may show an "Authorize access" dialog -> Choose your account -> Click "Advanced" -> "Go to Untitled project (unsafe)" -> "Allow").
 * 9. Copy the generated "Web app URL" (it looks like: https://script.google.com/macros/s/.../exec).
 * 10. Open "js/drive-config.js" in your website folder and paste the URL into "appsScriptUrl".
 * 
 * THAT'S IT! From then on, any new video or image you drop into your master
 * folder (or its subfolders) will appear on your website automatically!
 * ============================================================================
 */

const MASTER_FOLDER_ID = "1_NBGK91q5XWeJibvMIc8fMX0NS4qSTBG";

function doGet(e) {
  try {
    const masterFolder = DriveApp.getFolderById(MASTER_FOLDER_ID);
    const results = [];
    const seenIds = new Set();

    // Helper to process files in a given folder
    function processFolder(folder, folderCategoryName) {
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        const id = file.getId();
        if (seenIds.has(id)) continue;

        const mime = file.getMimeType();
        const isVideo = mime.startsWith('video/') || mime === 'application/mp4' || mime === 'application/x-mpegURL';
        const isImage = mime.startsWith('image/');

        // Skip non-media files (PDFs, docs, zips, etc.)
        if (!isVideo && !isImage) continue;

        seenIds.add(id);
        results.push({
          id: id,
          name: file.getName(),
          folder: folderCategoryName || folder.getName(),
          type: isVideo ? 'video' : 'image',
          mimeType: mime,
          createdTime: file.getDateCreated().toISOString(),
          lastUpdated: file.getLastUpdated().toISOString()
        });
      }
    }

    // 1. Process files in the master folder root
    processFolder(masterFolder, "General Portfolio");

    // 2. Process files in immediate subfolders (Animations, Character Designs, Cover Arts, etc.)
    const subfolders = masterFolder.getFolders();
    while (subfolders.hasNext()) {
      const sub = subfolders.next();
      processFolder(sub, sub.getName());
    }

    // Sort newest first
    results.sort(function(a, b) {
      return new Date(b.createdTime) - new Date(a.createdTime);
    });

    const responseData = {
      status: "success",
      count: results.length,
      lastSync: new Date().toISOString(),
      files: results
    };

    return ContentService
      .createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errorData = {
      status: "error",
      message: err.toString()
    };
    return ContentService
      .createTextOutput(JSON.stringify(errorData))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
