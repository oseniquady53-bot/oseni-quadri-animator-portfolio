/**
 * Oseni Quadri Portfolio — Google Drive Automatic Live Sync Engine
 * Synchronizes new images and animation videos from Google Drive master folder
 */

import { DRIVE_CONFIG } from './drive-config.js';

class DriveSyncEngine {
  constructor() {
    this.config = DRIVE_CONFIG;
    this.cacheKey = 'quady_drive_sync_cache_v1';
  }

  /**
   * Format a raw filename from Google Drive into a clean, professional project title
   */
  formatProjectTitle(rawName, folderName = '', isVideo = true) {
    if (!rawName) return 'Untitled Animation Work';

    // 1. Remove file extensions
    let clean = rawName.replace(/\.(mp4|mov|avi|webm|mkv|jpg|jpeg|png|webp|gif)$/i, '');

    // 2. Remove video cutter / editor watermarks and file suffixes
    clean = clean.replace(/\(online-video-cutter\.com\)/gi, '')
                 .replace(/\(MUSIC VIDEO\)/gi, 'Music Video')
                 .replace(/\(2\)/g, '')
                 .replace(/\(1\)/g, '')
                 .replace(/-\s*WA\d+/gi, '')
                 .replace(/YouCut_\d+_/gi, '')
                 .replace(/IMG_\d+_/gi, '')
                 .replace(/IMG[-_]/gi, '');

    // 3. Replace underscores and hyphens with clean spaces
    clean = clean.replace(/[_\-]+/g, ' ').trim();

    // 4. If filename is mostly digits or camera timestamps, create an aesthetic label
    const words = clean.split(' ').filter(w => w.length > 0);
    const isAllDigits = words.every(w => /^\d+$/.test(w));
    if (!clean || isAllDigits) {
      const cleanFolder = (folderName || '').replace(/[-_]/g, ' ').trim();
      if (cleanFolder && cleanFolder.length > 2 && cleanFolder !== 'General Portfolio') {
        const lastDigits = clean.replace(/\D/g, '').slice(-3);
        return `${cleanFolder} Study ${lastDigits ? '#' + lastDigits : ''}`.trim();
      }
      return isVideo ? 'Original Animation Sequence' : 'Original Artwork Concept';
    }

    // 5. Title-case words nicely
    clean = words
      .map(word => {
        const lower = word.toLowerCase();
        if (['and', 'for', 'of', 'the', 'in', 'to', 'a'].includes(lower)) return lower;
        if (lower === '2d' || lower === '3d' || lower === 'cgi' || lower === 'vfx') return lower.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

    return clean;
  }

  /**
   * Automatically detect category from folder name and filename
   */
  detectCategory(folderName = '', filename = '', isVideo = true) {
    const combined = `${folderName} ${filename}`.toLowerCase();

    if (combined.includes('anime')) return 'anime';
    if (combined.includes('3d') || combined.includes('cgi')) return '3d-animation';
    if (combined.includes('character') || combined.includes('turnaround') || combined.includes('sketch') || combined.includes('comic')) {
      return 'character-animation';
    }
    if (combined.includes('cover') || combined.includes('poster') || combined.includes('album')) {
      return 'cover-art';
    }
    if (combined.includes('explainer') || combined.includes('motion') || combined.includes('graphic')) {
      return 'motion-graphics';
    }
    if (combined.includes('music') || combined.includes('song') || combined.includes('audio')) {
      return 'music-videos';
    }

    // Default based on media type
    return isVideo ? '2d-animation' : 'character-animation';
  }

  /**
   * Human-readable category label
   */
  getCategoryLabel(categoryId) {
    const map = {
      '2d-animation': '2D Animation',
      '3d-animation': '3D Animation',
      'anime': 'Anime Style',
      'music-videos': 'Music Videos',
      'character-animation': 'Character Design',
      'motion-graphics': 'Motion Graphics',
      'cover-art': 'Cover Art & Design'
    };
    return map[categoryId] || 'Animation';
  }

  /**
   * Fetch drive files from Google Apps Script Web App (with client-side caching)
   */
  async fetchLiveFeed() {
    if (!this.config.autoSyncEnabled || !this.config.appsScriptUrl) {
      return null;
    }

    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(this.cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.timestamp || 0);
        if (age < this.config.cacheDurationMs) {
          return parsed.files;
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    // Fetch from Google Apps Script endpoint
    try {
      const response = await fetch(this.config.appsScriptUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && data.status === 'success' && Array.isArray(data.files)) {
        // Cache valid response
        try {
          sessionStorage.setItem(this.cacheKey, JSON.stringify({
            timestamp: Date.now(),
            files: data.files
          }));
        } catch (e) {
          // Storage might be full or private browsing
        }
        return data.files;
      }
    } catch (err) {
      console.warn('Google Drive Live Feed unreachable, using existing catalog:', err.message);
    }

    return null;
  }

  /**
   * Merge live Drive files with existing curated portfolio projects
   * Avoids duplicates and preserves rich metadata of existing items
   */
  mergeCatalog(staticProjects, liveFiles) {
    if (!Array.isArray(liveFiles) || liveFiles.length === 0) {
      return staticProjects;
    }

    // Set of all fileIds already present in static catalog
    const existingFileIds = new Set(staticProjects.map(p => p.fileId));
    const newProjects = [];

    liveFiles.forEach((file) => {
      // If already curated in static catalog, skip to prevent duplicates
      if (existingFileIds.has(file.id)) {
        return;
      }

      const isVideo = file.type === 'video';
      const category = this.detectCategory(file.folder, file.name, isVideo);
      const title = this.formatProjectTitle(file.name, file.folder, isVideo);

      newProjects.push({
        id: `drive-${file.id}`,
        title: title,
        category: category,
        categoryLabel: this.getCategoryLabel(category),
        type: isVideo ? 'video' : 'image',
        fileId: file.id,
        description: `Original ${isVideo ? 'animation production' : 'visual artwork'} from ${file.folder || 'Google Drive'}. Handcrafted by Oseni Quadri.`,
        role: isVideo ? 'Director & Lead Animator' : 'Visual Artist & Illustrator',
        tools: isVideo ? ['After Effects', 'Photoshop', 'Premiere Pro'] : ['Photoshop', 'Clip Studio Paint'],
        isLiveSynced: true,
        createdTime: file.createdTime || new Date().toISOString()
      });
    });

    if (newProjects.length > 0) {
      console.log(`[DriveSync] Detected ${newProjects.length} new project(s) from Google Drive.`);
      // Prepend new projects to the top so new additions are immediately featured
      return [...newProjects, ...staticProjects];
    }

    return staticProjects;
  }
}

export const driveSync = new DriveSyncEngine();
