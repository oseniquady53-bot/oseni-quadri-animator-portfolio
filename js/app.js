/**
 * Oseni Quadri Portfolio — Core Application Logic
 * Upgraded with Featured Work, Why Work With Me, Creative Pipeline & FAQ
 */

import { ARTIST_PROFILE, FEATURED_PROJECTS, PRICING_PACKAGES, CLIENT_REVIEWS_ORDERS } from './portfolio-data.js';
import { projectModal } from './modal-player.js';
import './portfolio.js';

// Toast Notification System
export function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 1. Render Featured Work Section (4–6 Strongest Projects)
function renderFeaturedWork() {
  const container = document.getElementById('featuredGrid');
  if (!container) return;
  container.innerHTML = '';

  FEATURED_PROJECTS.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'featured-card';
    card.setAttribute('data-id', project.id);

    const thumbUrl = `https://drive.google.com/thumbnail?id=${project.fileId}&sz=w1000`;
    const fallbackUrl = `https://lh3.googleusercontent.com/d/${project.fileId}`;
    const isVideo = project.type === 'video';

    card.innerHTML = `
      <div class="featured-media" tabindex="0" role="button" aria-label="Play ${project.title}">
        <img class="featured-img" src="${thumbUrl}" alt="${project.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
        <div class="featured-play-btn" title="${isVideo ? 'Play Video' : 'View Artwork'}">
          ${isVideo ? '▶' : '🔍'}
        </div>
      </div>
      <div class="featured-body">
        <div class="featured-category-tag">[ 0${index + 1} // ${(project.categoryLabel || project.category).toUpperCase()} ]</div>
        <h3 class="featured-title">${project.title}</h3>
        <p class="featured-desc">${project.description}</p>
        <div class="featured-footer">
          <span style="font-family: var(--font-mono); font-size: 0.76rem; color: var(--text-muted);">${project.role || 'Animator'}</span>
          <button class="btn btn-secondary btn-sm view-project-btn" data-id="${project.id}">
            View Project →
          </button>
        </div>
      </div>
    `;

    // Click on media or button opens modal
    const media = card.querySelector('.featured-media');
    const viewBtn = card.querySelector('.view-project-btn');

    const openProj = () => projectModal.openById(project.id);
    if (media) media.addEventListener('click', openProj);
    if (viewBtn) viewBtn.addEventListener('click', openProj);

    container.appendChild(card);
  });
}

// 2. Render "Why Work With Me" Value Cards (Architectural Studio Cards)
function renderWhyWorkWithMe() {
  const container = document.getElementById('whyGrid');
  if (!container) return;
  container.innerHTML = '';

  (ARTIST_PROFILE.whyWorkWithMe || []).forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'why-card';
    const num = String(index + 1).padStart(2, '0');
    card.innerHTML = `
      <div class="why-icon-box">${num}</div>
      <h3 class="why-title">${item.title}</h3>
      <p class="why-desc">${item.desc}</p>
    `;
    container.appendChild(card);
  });
}

// 3. Render Creative Pipeline (Transformation: Rough Sketch -> Final Result)
function renderCreativePipeline() {
  const container = document.getElementById('pipelineGrid');
  if (!container) return;
  container.innerHTML = '';

  (ARTIST_PROFILE.creativePipeline || []).forEach(step => {
    const card = document.createElement('div');
    card.className = 'pipeline-step-card';

    const isVideo = step.type === 'video';

    card.innerHTML = `
      <div class="pipeline-media-box" tabindex="0" role="button" aria-label="View ${step.title}">
        <img src="${step.thumb}" alt="${step.title} — ${step.subtitle}" loading="lazy">
        <div class="pipeline-step-badge">STEP ${step.step}</div>
        ${isVideo ? '<div class="card-play-indicator" style="top: 14px; right: 14px;">▶</div>' : ''}
      </div>
      <div class="pipeline-body">
        <h3 class="pipeline-title">${step.title}</h3>
        <div class="pipeline-subtitle">${step.subtitle}</div>
        <p class="pipeline-desc">${step.desc}</p>
      </div>
    `;

    // Click to view in modal
    const mediaBox = card.querySelector('.pipeline-media-box');
    if (mediaBox) {
      mediaBox.addEventListener('click', () => {
        // Find if exists in catalog or open by fileId
        const match = projectModal.filteredProjects.find(p => p.fileId === step.fileId);
        if (match) {
          projectModal.openById(match.id);
        } else {
          projectModal.openById('proj-1');
        }
      });
    }

    container.appendChild(card);
  });
}

// 4. Render Services (Architectural Studio Decks)
function renderServices() {
  const container = document.getElementById('servicesGrid');
  if (!container) return;
  container.innerHTML = '';

  ARTIST_PROFILE.services.forEach((service, index) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    const num = String(index + 1).padStart(2, '0');
    
    const deliverablesHtml = (service.deliverables || [])
      .map(item => `<li class="deliverable-item">${item}</li>`)
      .join('');

    card.innerHTML = `
      <div class="service-header">
        <span class="service-icon">[ ${num} ]</span>
        <h3 class="service-title">${service.title}</h3>
      </div>
      <p class="service-desc">${service.shortDesc}</p>
      <ul class="deliverables-list">${deliverablesHtml}</ul>
      <button class="btn btn-secondary btn-sm book-service-btn" data-service="${service.id}" style="width: 100%; margin-top: 20px;">
        Inquire for ${service.title} →
      </button>
    `;

    const bookBtn = card.querySelector('.book-service-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        const select = document.getElementById('projectType');
        if (select) {
          select.value = service.id;
        }
        const msg = document.getElementById('projectMessage');
        if (msg) {
          msg.value = `Hi Quady (Oseni Quadri), I am interested in your ${service.title} service. Here are the details of what I need:`;
          msg.focus();
        }
      });
    }

    container.appendChild(card);
  });
}


// Render Transparent Pricing & Packages Section
function renderPricing() {
  const container = document.getElementById('pricingGrid');
  const tabsContainer = document.getElementById('pricingTabs');
  if (!container || !PRICING_PACKAGES) return;

  const renderCards = (cat = 'all') => {
    container.innerHTML = '';
    const filtered = (cat === 'all')
      ? PRICING_PACKAGES
      : PRICING_PACKAGES.filter(p => p.category === cat);

    filtered.forEach(pkg => {
      const card = document.createElement('div');
      card.className = `pricing-card ${pkg.isFeatured ? 'featured' : ''}`;
      card.setAttribute('data-category', pkg.category);

      const tiersHtml = pkg.tiers.map(tier => `
        <div class="pricing-tier-row">
          <span class="tier-label">${tier.duration}</span>
          <span class="tier-dots"></span>
          <span class="tier-price ${tier.highlight ? 'highlight-price' : ''}">${tier.price}</span>
        </div>
      `).join('');

      const featuresHtml = pkg.features.map(feat => `
        <li class="pricing-feature-item">
          <span class="feature-check">✓</span>
          <span>${feat}</span>
        </li>
      `).join('');

      card.innerHTML = `
        <div class="pricing-top-bar">
          <span class="pricing-badge">${pkg.badge}</span>
        </div>
        <h3 class="pricing-title">${pkg.title}</h3>
        <p class="pricing-tagline">${pkg.tagline}</p>

        <div class="pricing-tiers-list">
          ${tiersHtml}
        </div>

        <ul class="pricing-features-list">
          ${featuresHtml}
        </ul>

        <button class="btn ${pkg.isFeatured ? 'btn-primary' : 'btn-secondary'} pricing-btn-action" data-package-id="${pkg.id}" data-package-title="${pkg.title}">
          ${pkg.ctaText} →
        </button>
      `;

      // Interactive Click on Quote Button
      const actionBtn = card.querySelector('.pricing-btn-action');
      actionBtn?.addEventListener('click', () => {
        const contactSection = document.getElementById('contact');
        const projectTypeSelect = document.getElementById('projectType');
        const messageTextarea = document.getElementById('projectMessage');

        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }

        if (projectTypeSelect) {
          const typeMapping = {
            '2d-animation': '2d-animation',
            'anime': 'anime',
            '3d-animation': '3d-animation',
            'character-animation': 'character-animation',
            'motion-graphics': 'motion-graphics',
            'shorts-action': '2d-animation',
            'design': 'design'
          };
          const mapped = typeMapping[pkg.id] || 'other';
          projectTypeSelect.value = mapped;
        }

        if (messageTextarea && (!messageTextarea.value || messageTextarea.value.startsWith("Hi Quady, I'm interested in"))) {
          messageTextarea.value = `Hi Quady, I'm interested in your ${pkg.title} package. I have a project in mind and would love to get an exact quote and timeline breakdown. Here are my project details:`;
        }

        showToast(`Selected ${pkg.title}! Fill in your details below to get an exact quote.`, 'success');
      });

      container.appendChild(card);
    });
  };

  // Initial render with All
  renderCards('all');

  // Handle Tab Switching
  if (tabsContainer) {
    const tabBtns = tabsContainer.querySelectorAll('.pricing-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-category') || 'all';
        renderCards(cat);
      });
    });
  }
}

// 5. Render Process Steps
function renderProcess() {
  const container = document.getElementById('processTimeline');
  if (!container) return;
  container.innerHTML = '';

  ARTIST_PROFILE.processSteps.forEach(step => {
    const el = document.createElement('div');
    el.className = 'process-step';
    el.innerHTML = `
      <div class="step-number">${step.step}</div>
      <h3 class="step-title">${step.title}</h3>
      <p class="step-desc">${step.desc}</p>
    `;
    container.appendChild(el);
  });
}

// 6. Render FAQ Accordion
function renderFAQ() {
  const container = document.getElementById('faqList');
  if (!container) return;
  container.innerHTML = '';

  (ARTIST_PROFILE.faq || []).forEach((item, index) => {
    const faqItem = document.createElement('div');
    faqItem.className = `faq-item ${index === 0 ? 'active' : ''}`;

    faqItem.innerHTML = `
      <button class="faq-header" aria-expanded="${index === 0}">
        <span class="faq-question">${item.question}</span>
        <span class="faq-toggle-icon">+</span>
      </button>
      <div class="faq-body">
        <div class="faq-answer">${item.answer}</div>
      </div>
    `;

    const headerBtn = faqItem.querySelector('.faq-header');
    headerBtn.addEventListener('click', () => {
      const isActive = faqItem.classList.contains('active');
      
      // Close other items
      document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
        const btn = el.querySelector('.faq-header');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Toggle current item
      if (!isActive) {
        faqItem.classList.add('active');
        headerBtn.setAttribute('aria-expanded', 'true');
      }
    });

    container.appendChild(faqItem);
  });
}


// Render Verified Client Reviews & Order Proofs
function renderReviews() {
  const homeContainer = document.getElementById('homeReviewsGrid');
  const fullContainer = document.getElementById('reviewsGrid');

  const populate = (container, list) => {
    if (!container) return;
    container.innerHTML = '';

    list.forEach(order => {
      const card = document.createElement('article');
      card.className = 'review-card';
      const thumbUrl = `https://drive.google.com/thumbnail?id=${order.fileId}&sz=w800`;
      const fallbackUrl = `https://lh3.googleusercontent.com/d/${order.fileId}`;

      card.innerHTML = `
        <div class="review-media-box" tabindex="0" role="button" aria-label="Zoom order receipt #${order.orderNumber}">
          <img class="review-img" src="${thumbUrl}" alt="${order.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          <div class="review-zoom-btn" title="Inspect Full Resolution Proof">🔍</div>
          <div class="review-tag-badge">${order.tag}</div>
        </div>
        <div class="review-body">
          <div class="review-stars">★★★★★ <span style="font-size: 0.8rem; color: #fff; font-family: var(--font-mono); margin-left: 6px;">5.0</span></div>
          <h3 class="review-title">${order.title}</h3>
          <p class="review-quote">"${order.feedback}"</p>
          <div class="review-meta-bar">
            <span>${order.category}</span>
            <span style="color: #22c55e;">✓ Verified Client</span>
          </div>
        </div>
      `;

      // Click to open in modal
      const mediaBox = card.querySelector('.review-media-box');
      if (mediaBox) {
        mediaBox.addEventListener('click', () => {
          const modal = document.getElementById('projectModal');
          const viewport = document.getElementById('modalViewport');
          const title = document.getElementById('modalTitle');
          const desc = document.getElementById('modalDesc');
          const catBadge = document.getElementById('modalCategory');
          const roleBadge = document.getElementById('modalRole');
          const directLink = document.getElementById('modalDirectLink');

          if (modal && viewport) {
            viewport.innerHTML = `<img src="${thumbUrl}" alt="${order.title}" style="max-height: 80vh; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;" onerror="this.onerror=null; this.src='${fallbackUrl}';">`;
            if (title) title.textContent = order.title;
            if (desc) desc.textContent = `Client Feedback: "${order.feedback}" — Completed freelance order for client in ${order.clientCountry}.`;
            if (catBadge) catBadge.textContent = order.category;
            if (roleBadge) roleBadge.textContent = order.tag;
            if (directLink) {
              directLink.href = `https://drive.google.com/file/d/${order.fileId}/view?usp=sharing`;
              directLink.textContent = "Open Full Screenshot on Google Drive ↗";
            }
            modal.classList.add('active');
          }
        });
      }

      container.appendChild(card);
    });
  };

  if (homeContainer) populate(homeContainer, (CLIENT_REVIEWS_ORDERS || []).slice(0, 6));
  if (fullContainer) populate(fullContainer, CLIENT_REVIEWS_ORDERS || []);
}

// 7. Navigation & Multi-Page Support
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Header scroll blur effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const isOpen = navMenu.classList.contains('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active link highlight based on current pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Smooth scroll for in-page anchors
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const hash = anchor.getAttribute('href').replace(/^#/, '');
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          if (navMenu) {
            navMenu.classList.remove('mobile-open');
            mobileToggle?.setAttribute('aria-expanded', 'false');
          }
        }
      }
    }
  });

  // Active section scrollspy on single-page view
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 3) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.25 });

    sections.forEach(s => observer.observe(s));
  }
}

// 8. Showreel Player
function initShowreel() {
  const overlay = document.getElementById('showreelOverlay');
  const wrapper = document.getElementById('showreelWrapper');
  const watchBtn = document.getElementById('heroWatchBtn');
  const switchBtns = document.querySelectorAll('.reel-switch-btn');
  const posterImg = document.getElementById('showreelPoster');

  let currentFileId = ARTIST_PROFILE.showreel.fileId;
  let isPlaying = false;

  const playShowreel = (fileId = currentFileId, title = ARTIST_PROFILE.showreel.title) => {
    if (!wrapper) return;
    isPlaying = true;
    currentFileId = fileId;
    wrapper.innerHTML = `
      <iframe 
        src="https://drive.google.com/file/d/${fileId}/preview" 
        class="showreel-video-iframe" 
        allow="autoplay; fullscreen" 
        allowfullscreen="true"
        title="${title}">
      </iframe>
    `;
    showToast(`Playing ${title}...`, 'info');
  };

  if (overlay) {
    overlay.addEventListener('click', () => playShowreel(currentFileId));
  }

  if (watchBtn) {
    watchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const showreelSection = document.getElementById('showreelContainer');
      if (showreelSection) {
        showreelSection.scrollIntoView({ behavior: 'smooth' });
      }
      playShowreel(currentFileId);
    });
  }

  // Handle Switcher Buttons
  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const fileId = btn.getAttribute('data-fileid');
      const title = btn.getAttribute('data-title');
      currentFileId = fileId;

      if (isPlaying) {
        playShowreel(fileId, title);
      } else if (posterImg) {
        posterImg.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
        posterImg.onerror = () => {
          posterImg.src = `https://lh3.googleusercontent.com/d/${fileId}`;
        };
        showToast(`Selected ${title}. Click play to watch.`, 'info');
      }
    });
  });
}

// 9. Contact Form & Inquiry Actions
function initContact() {
  const form = document.getElementById('projectInquiryForm');
  const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const copyDiscordBtn = document.getElementById('copyDiscordBtn');

  // Copy Discord tag (safe fallback)
  if (copyDiscordBtn) {
    copyDiscordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const discordTag = ARTIST_PROFILE.contacts.discord.tag;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(discordTag).then(() => {
          showToast(`Discord tag "${discordTag}" copied to clipboard!`, 'success');
        }).catch(() => {
          showToast(`Discord tag: ${discordTag}`, 'info');
        });
      } else {
        showToast(`Discord tag: ${discordTag}`, 'info');
      }
    });
  }

  // Extract form data including Duration & Reference link
  const getFormData = () => {
    const name = document.getElementById('clientName')?.value.trim() || '';
    const email = document.getElementById('clientEmail')?.value.trim() || '';
    const projectType = document.getElementById('projectType')?.value || 'General Inquiry';
    const duration = document.getElementById('clientDuration')?.value.trim() || 'Not specified';
    const budget = document.getElementById('projectBudget')?.value || 'Flexible';
    const timeline = document.getElementById('projectTimeline')?.value || 'Flexible';
    const refLink = document.getElementById('clientRefLink')?.value.trim() || 'None provided';
    const message = document.getElementById('projectMessage')?.value.trim() || '';

    return { name, email, projectType, duration, budget, timeline, refLink, message };
  };

  // WhatsApp quick button
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!data.name || !data.message) {
        showToast('Please enter your name and project details first.', 'info');
        return;
      }

      const text = `*New Animation Project Inquiry*%0A%0A` +
        `*Name:* ${encodeURIComponent(data.name)}%0A` +
        `*Email:* ${encodeURIComponent(data.email || 'N/A')}%0A` +
        `*Project Type:* ${encodeURIComponent(data.projectType)}%0A` +
        `*Est. Duration:* ${encodeURIComponent(data.duration)}%0A` +
        `*Budget Range:* ${encodeURIComponent(data.budget)}%0A` +
        `*Target Deadline:* ${encodeURIComponent(data.timeline)}%0A` +
        `*Reference Link:* ${encodeURIComponent(data.refLink)}%0A%0A` +
        `*Project Vision:*%0A${encodeURIComponent(data.message)}`;

      const waUrl = `https://wa.me/${ARTIST_PROFILE.contacts.whatsapp.cleanPhone}?text=${text}`;
      window.open(waUrl, '_blank');
      showToast('Opening WhatsApp with your project details...', 'success');
    });
  }

  // Email quick button
  if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!data.name || !data.message) {
        showToast('Please enter your name and project details first.', 'info');
        return;
      }

      const subject = encodeURIComponent(`Animation Inquiry: ${data.projectType} - ${data.name}`);
      const body = encodeURIComponent(
        `Hi Quady (Oseni Quadri),

` +
        `Name: ${data.name}
` +
        `Email: ${data.email}
` +
        `Project Type: ${data.projectType}
` +
        `Estimated Duration: ${data.duration}
` +
        `Budget Range: ${data.budget}
` +
        `Target Deadline: ${data.timeline}
` +
        `Reference / Track Link: ${data.refLink}

` +
        `Project Description:
${data.message}
`
      );

      window.location.href = `mailto:${ARTIST_PROFILE.contacts.email.address}?subject=${subject}&body=${body}`;
      showToast('Opening your default email app...', 'success');
    });
  }

  // Standard Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = getFormData();
      if (!data.name || !data.email || !data.message) {
        showToast('Please fill in your name, email, and project details.', 'info');
        return;
      }

      showToast('Opening email to deliver inquiry directly to Oseni Quadri...', 'success');
      setTimeout(() => {
        if (sendEmailBtn) sendEmailBtn.click();
      }, 600);
    });
  }
}

// Initialization on DOM Ready

// 9. Asset Protection Module (Prevent saving/downloading videos and artworks)
function initAssetProtection() {
  // Prevent right-click context menu on all video and media elements
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('video, img, iframe, .modal-viewport, .showreel-wrapper, .featured-media, .pipeline-media-box, .portfolio-card-media, .showreel-container')) {
      e.preventDefault();
      if (typeof showToast === 'function') {
        showToast('🔒 Video & media assets are protected by copyright.', 'warning');
      }
      return false;
    }
  });

  // Prevent drag saving of media
  document.addEventListener('dragstart', (e) => {
    if (e.target.closest('video, img, iframe, .showreel-wrapper, .modal-viewport, .featured-media, .portfolio-card-media')) {
      e.preventDefault();
      return false;
    }
  });

  // Prevent Save Page keyboard shortcuts (Ctrl+S, Cmd+S)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (typeof showToast === 'function') {
        showToast('🔒 Saving page media is disabled.', 'warning');
      }
      return false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
    initAssetProtection();
  renderFeaturedWork();
  renderWhyWorkWithMe();
  renderCreativePipeline();
  renderServices();
  renderPricing();
  renderProcess();
  renderFAQ();
  renderReviews();
  initNavigation();
  initShowreel();
  initContact();
  console.log('Oseni Quadri Animator Portfolio loaded and initialized.');
});
