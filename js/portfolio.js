/**
 * Oseni Quadri Portfolio — Dynamic Grid, Categories & Search
 */

import { PORTFOLIO_PROJECTS, PORTFOLIO_CATEGORIES } from './portfolio-data.js';
import { projectModal } from './modal-player.js';
import { driveSync } from './drive-sync.js';

class PortfolioController {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.pageSize = 12;
    this.displayedCount = 12;
    this.allProjects = [...PORTFOLIO_PROJECTS];
    this.filteredProjects = [...this.allProjects];
    
    this.initElements();
    this.renderCategoryFilters();
    this.filterProjects();
    this.bindEvents();
    this.initLiveSync();
  }

  async initLiveSync() {
    try {
      const liveFiles = await driveSync.fetchLiveFeed();
      if (liveFiles && liveFiles.length > 0) {
        this.allProjects = driveSync.mergeCatalog(PORTFOLIO_PROJECTS, liveFiles);
        this.renderCategoryFilters();
        this.filterProjects();
      }
    } catch (e) {
      console.warn('Live sync check completed with fallback to standard catalog.');
    }
  }

  initElements() {
    this.gridContainer = document.getElementById('portfolioGrid');
    this.filtersContainer = document.getElementById('portfolioFilters');
    this.searchInput = document.getElementById('portfolioSearch');
    this.loadMoreContainer = document.getElementById('loadMoreContainer');
    this.loadMoreBtn = document.getElementById('loadMoreBtn');
    this.categoryIndicator = document.getElementById('categoryIndicator');
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.displayedCount = this.pageSize;
        this.filterProjects();
      });
    }

    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener('click', () => {
        this.displayedCount += this.pageSize;
        this.renderGrid();
      });
    }
  }

  renderCategoryFilters() {
    if (!this.filtersContainer) return;
    this.filtersContainer.innerHTML = '';

    PORTFOLIO_CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `filter-btn ${cat.id === this.currentCategory ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.id);

      // Count for category
      const count = cat.id === 'all' 
        ? this.allProjects.length 
        : this.allProjects.filter(p => p.category === cat.id).length;

      btn.innerHTML = `<span>${cat.label}</span><span class="filter-count">${count}</span>`;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = cat.id;
        this.displayedCount = this.pageSize;
        this.filterProjects();
      });

      this.filtersContainer.appendChild(btn);
    });
  }

  filterProjects() {
    this.filteredProjects = this.allProjects.filter(project => {
      const matchesCategory = this.currentCategory === 'all' || project.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        project.title.toLowerCase().includes(this.searchQuery) ||
        project.description.toLowerCase().includes(this.searchQuery) ||
        project.role.toLowerCase().includes(this.searchQuery) ||
        (project.tools && project.tools.some(t => t.toLowerCase().includes(this.searchQuery)));
      return matchesCategory && matchesSearch;
    });

    projectModal.setProjects(this.filteredProjects);
    this.updateIndicator();
    this.renderGrid();
  }

  updateIndicator() {
    if (!this.categoryIndicator) return;
    const catObj = PORTFOLIO_CATEGORIES.find(c => c.id === this.currentCategory);
    const catName = catObj ? catObj.label : 'All Projects';
    this.categoryIndicator.textContent = `Showing ${Math.min(this.displayedCount, this.filteredProjects.length)} of ${this.filteredProjects.length} works in ${catName}`;
  }

  renderGrid() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    if (this.filteredProjects.length === 0) {
      this.gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
          <div style="font-size: 2.5rem; margin-bottom: 16px;">🎨</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px; color: #fff;">No matching animation projects found</h3>
          <p>Try clearing your search or selecting another creative category above.</p>
        </div>
      `;
      if (this.loadMoreContainer) this.loadMoreContainer.style.display = 'none';
      return;
    }

    const projectsToRender = this.filteredProjects.slice(0, this.displayedCount);

    projectsToRender.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('data-id', project.id);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View details for ${project.title}`);

      const isSquare = project.category === 'cover-art' || project.category === 'character-design';
      const isVideo = project.type === 'video';

      const thumbUrl = `https://drive.google.com/thumbnail?id=${project.fileId}&sz=w800`;
      const fallbackUrl = `https://lh3.googleusercontent.com/d/${project.fileId}`;

      const toolsList = (project.tools || []).slice(0, 2).map(t => `<span class="tool-tag">#${t}</span>`).join('');

      card.innerHTML = `
        <div class="card-media ${isSquare ? 'square-media' : ''}">
          <img class="card-img" src="${thumbUrl}" alt="${project.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          ${isVideo ? '<div class="card-play-indicator" title="Play Video">▶</div>' : '<div class="card-play-indicator" style="background: rgba(6, 182, 212, 0.9);" title="View Artwork">🔍</div>'}
          <div class="card-overlay"></div>
        </div>
        <div class="card-body">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: space-between;">
            <span>${project.categoryLabel}</span>
            ${project.isLiveSynced ? '<span style="font-size: 0.65rem; padding: 2px 6px; background: rgba(139, 92, 246, 0.2); border: 1px solid var(--accent-studio); color: #c4b5fd; border-radius: 4px; font-weight: 700;">LIVE DRIVE</span>' : ''}
          </div>
          <h3 class="card-title">${project.title}</h3>
          <p class="card-desc">${project.description}</p>
          <div class="card-meta">
            <div class="card-tools">${toolsList}</div>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">${project.role ? project.role.split(' ')[0] : 'Artist'}</span>
          </div>
        </div>
      `;

      // Click and Enter key handling
      card.addEventListener('click', () => {
        projectModal.openById(project.id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          projectModal.openById(project.id);
        }
      });

      this.gridContainer.appendChild(card);
    });

    // Toggle Load More Button
    if (this.loadMoreContainer) {
      if (this.displayedCount < this.filteredProjects.length) {
        this.loadMoreContainer.style.display = 'block';
      } else {
        this.loadMoreContainer.style.display = 'none';
      }
    }

    this.updateIndicator();
  }
}

export const portfolioController = new PortfolioController();
