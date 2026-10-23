/**
 * Oseni Quadri Portfolio — Modal Player & Project Case Study Lightbox
 */

import { PORTFOLIO_PROJECTS } from './portfolio-data.js';

class ProjectModal {
  constructor() {
    this.currentProjectIndex = -1;
    this.filteredProjects = [...PORTFOLIO_PROJECTS];
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.backdrop = document.getElementById('projectModal');
    this.viewport = document.getElementById('modalViewport');
    this.title = document.getElementById('modalTitle');
    this.categoryBadge = document.getElementById('modalCategory');
    this.roleBadge = document.getElementById('modalRole');
    this.description = document.getElementById('modalDesc');
    this.toolsContainer = document.getElementById('modalTools');
    this.directLink = document.getElementById('modalDirectLink');
    this.inquireBtn = document.getElementById('modalInquireBtn');
    this.closeBtn = document.getElementById('modalCloseBtn');
    this.prevBtn = document.getElementById('modalPrevBtn');
    this.nextBtn = document.getElementById('modalNextBtn');
  }

  bindEvents() {
    if (!this.backdrop) return;

    // Close on backdrop click
    if (this.viewport) { this.viewport.addEventListener('contextmenu', (e) => e.preventDefault()); }
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    });

    // Close on button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Prev / Next
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.navigate(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.navigate(1));
    }

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (!this.backdrop.classList.contains('active')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });

    // Inquire button
    if (this.inquireBtn) {
      this.inquireBtn.addEventListener('click', () => {
        const project = this.filteredProjects[this.currentProjectIndex];
        this.close();

        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }

        const projectTypeSelect = document.getElementById('projectType');
        const projectDesc = document.getElementById('projectMessage');
        
        if (projectTypeSelect && project) {
          projectTypeSelect.value = project.category;
        }

        if (projectDesc && project) {
          projectDesc.value = "Hi Oseni Quadri, I was impressed by your project \"" + project.title + "\" and would like to discuss a similar animation project for my brand/music.";
          projectDesc.focus();
        }
      });
    }
  }

  setProjects(projects) {
    this.filteredProjects = projects;
  }

  openById(projectId) {
    const index = this.filteredProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      this.openIndex(index);
    }
  }

  openIndex(index) {
    this.currentProjectIndex = index;
    const project = this.filteredProjects[index];
    if (!project) return;

    // Update Text Content
    this.title.textContent = project.title;
    this.categoryBadge.textContent = project.categoryLabel || project.category;
    this.roleBadge.textContent = project.role || 'Animator & Visual Artist';
    this.description.textContent = project.description;

    // Tools
    this.toolsContainer.innerHTML = '';
    if (project.tools && Array.isArray(project.tools)) {
      project.tools.forEach(tool => {
        const span = document.createElement('span');
        span.className = 'tool-tag';
        span.textContent = `#${tool}`;
        this.toolsContainer.appendChild(span);
      });
    }

    // Direct Link (Disabled to prevent unauthorized downloads)
    if (this.directLink) {
      this.directLink.style.display = 'none';
      this.directLink.removeAttribute('href');
    }

    // Viewport Media
    this.viewport.innerHTML = '';
    if (project.type === 'video') {
      this.viewport.classList.remove('image-viewport');
      const iframe = document.createElement('iframe');
      iframe.src = `https://drive.google.com/file/d/${project.fileId}/preview`;
      iframe.allow = 'autoplay; fullscreen';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.title = project.title;
      this.viewport.appendChild(iframe);
    } else {
      this.viewport.classList.add('image-viewport');
      const img = document.createElement('img');
      img.src = `https://lh3.googleusercontent.com/d/${project.fileId}`;
      img.alt = project.title;
      img.loading = 'eager';
      img.onerror = () => {
        img.src = `https://drive.google.com/thumbnail?id=${project.fileId}&sz=w1200`;
      };
      this.viewport.appendChild(img);
    }

    // Show Backdrop
    this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  navigate(direction) {
    let newIndex = this.currentProjectIndex + direction;
    if (newIndex < 0) newIndex = this.filteredProjects.length - 1;
    if (newIndex >= this.filteredProjects.length) newIndex = 0;
    this.openIndex(newIndex);
  }

  close() {
    this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
    // Stop video playback by clearing iframe src
    this.viewport.innerHTML = '';
  }
}

export const projectModal = new ProjectModal();
