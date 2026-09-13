/**
 * GHANEM FURNITURE
 * Interactive Portfolio Filter & Lightbox Component
 */

window.initGalleryInteractions = function initGalleryInteractions() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentGalleryIndex = 0;
  let activeVisibleItems = [...galleryItems];
  let currentFilter = 'all';

  // --- Category Fallback Images Mapping ---
  const CATEGORY_FALLBACKS = {
    kitchens: ['images/kitchen-cream-modern.jpg', 'images/kitchen-white-granite.jpg', 'images/kitchen-black-classic.jpg', 'images/hero-kitchen.jpg'],
    bedrooms: ['images/hero-bedroom.jpg'],
    woodwork: ['images/gallery-woodwork.jpg'],
    staircases: ['images/gallery-woodwork.jpg'],
    lighting: ['images/gallery-woodwork.jpg'],
    bathroom: ['images/gallery-woodwork.jpg'],
    dining: ['images/gallery-woodwork.jpg'],
    'designs-3d': [
      'images/designs/designs-round-table-walnut.jpg',
      'images/designs/designs-bedroom-twin-desk-wardrobe.jpg',
      'images/designs/designs-wardrobe-glass-black-frame.jpg',
      'images/designs/designs-bedroom-master-slat-wall.jpg',
      'images/designs/designs-bedroom-twin-gallery-wall.jpg',
      'images/designs/designs-livingroom-tv-unit-sofa.jpg'
    ],
    workshop: ['images/workshop-cnc-machine-action.jpg']
  };

  // Gracefully handle any missing or slow loading gallery images
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (!img) return;

    img.addEventListener('error', function onImgError() {
      const category = item.getAttribute('data-category') || 'kitchens';
      const fallbacks = CATEGORY_FALLBACKS[category] || ['images/gallery-woodwork.jpg'];
      const fallbackSrc = fallbacks[index % fallbacks.length];
      
      // Prevent infinite error loop
      if (this.src.endsWith(fallbackSrc) || this.getAttribute('data-fallback-applied')) {
        return;
      }
      this.setAttribute('data-fallback-applied', 'true');
      this.src = fallbackSrc;
    });
  });

  function getImageItems() {
    return activeVisibleItems.filter(item => !item.querySelector('video') && item.querySelector('img'));
  }

  function updateVisibleItems(filterValue) {
    currentFilter = filterValue;
    activeVisibleItems = [];

    galleryItems.forEach(item => {
      const catAttr = item.getAttribute('data-category') || '';
      const categories = catAttr.split(/\s+/);
      const shouldShow = (filterValue === 'all' || categories.includes(filterValue));

      if (shouldShow) {
        activeVisibleItems.push(item);
        item.style.display = 'block';
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (currentFilter !== 'all') {
            const currentCats = (item.getAttribute('data-category') || '').split(/\s+/);
            if (!currentCats.includes(currentFilter)) {
              item.style.display = 'none';
            }
          }
        }, 250);
      }
    });
  }

  // --- 1. Interactive Category Filter & Deep Linking ---
  function getInitialCategory() {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) return catParam.toLowerCase();
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && hash !== 'gallerygrid' && hash !== '') return hash;
    return null;
  }

  function setCategoryFilter(filterValue, updateUrl = true) {
    const targetBtn = Array.from(filterBtns).find(b => (b.getAttribute('data-filter') || '').toLowerCase() === filterValue.toLowerCase());
    if (targetBtn) {
      filterBtns.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');
      updateVisibleItems(filterValue);
      if (updateUrl) {
        const url = new URL(window.location);
        if (filterValue === 'all') {
          url.searchParams.delete('category');
          if (url.hash && url.hash.replace('#', '').toLowerCase() === filterValue.toLowerCase()) {
            url.hash = '';
          }
        } else {
          url.searchParams.set('category', filterValue);
        }
        history.replaceState(null, '', url);
      }
    } else if (filterValue === 'all') {
      updateVisibleItems('all');
    }
  }

  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterValue = btn.getAttribute('data-filter') || 'all';
        setCategoryFilter(filterValue, true);
      });
    });

    // Check for category deep link on initial load
    const initialCat = getInitialCategory();
    if (initialCat) {
      setCategoryFilter(initialCat, false);
    }
  }

  // --- 2. Lightbox Modal Functionality & Item Deep Linking ---
  function updateUrlWithItem(item) {
    if (!item) return;
    const slug = item.getAttribute('data-slug') || item.getAttribute('data-index');
    if (slug) {
      const url = new URL(window.location);
      url.searchParams.set('item', slug);
      history.replaceState(null, '', url);
    }
  }

  function clearItemFromUrl() {
    const url = new URL(window.location);
    if (url.searchParams.has('item')) {
      url.searchParams.delete('item');
      history.replaceState(null, '', url);
    }
  }

  function openLightbox(index) {
    const imageItems = getImageItems();
    if (!lightboxModal || imageItems.length === 0) return;

    // Wrap around index
    if (index < 0) {
      currentGalleryIndex = imageItems.length - 1;
    } else if (index >= imageItems.length) {
      currentGalleryIndex = 0;
    } else {
      currentGalleryIndex = index;
    }

    const item = imageItems[currentGalleryIndex];
    if (!item) return;

    const img = item.querySelector('img');
    const isEn = (window.i18n && window.i18n.getLanguage() === 'en') || (localStorage.getItem('site_lang') === 'en');
    const defaultTitle = isEn ? 'Ghanem Furniture Project' : 'مشروع Ghanem Furniture';
    const defaultCategory = isEn ? 'Luxury Woodwork' : 'أعمال خشبية فاخرة';
    const title = item.querySelector('.gallery-item-title, h3')?.textContent?.trim() || defaultTitle;
    const category = item.querySelector('.gallery-item-category, .gallery-badge')?.textContent?.trim() || defaultCategory;

    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || title;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxCategory) lightboxCategory.textContent = category;

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL with item slug for deep linking & sharing
    updateUrlWithItem(item);
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
    clearItemFromUrl();
  }

  function showNextImage() {
    const imageItems = getImageItems();
    if (imageItems.length === 0) return;
    openLightbox(currentGalleryIndex + 1);
  }

  function showPrevImage() {
    const imageItems = getImageItems();
    if (imageItems.length === 0) return;
    openLightbox(currentGalleryIndex - 1);
  }

  // Attach click listener to gallery items (skip video cards)
  galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.querySelector('video') || e.target.closest('video')) {
        return; // Allow native video play without opening lightbox
      }

      const imageItems = getImageItems();
      const idx = imageItems.indexOf(item);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  // Lightbox Controls
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  // Close when clicking modal backdrop
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // --- 3. Lightbox Share Button ---
  const lightboxShareBtn = document.getElementById('lightboxShareBtn');
  if (lightboxShareBtn) {
    lightboxShareBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const shareUrl = window.location.href;
      const isEn = (window.i18n && window.i18n.getLanguage() === 'en') || (localStorage.getItem('site_lang') === 'en');
      const copiedText = isEn ? '✓ Link Copied!' : '✓ تم نسخ الرابط!';
      const shareTitle = lightboxTitle ? lightboxTitle.textContent : 'Ghanem Furniture';

      // On mobile devices with Web Share API
      if (navigator.share && window.innerWidth <= 768) {
        try {
          await navigator.share({
            title: shareTitle,
            text: `${shareTitle} - Ghanem Furniture`,
            url: shareUrl
          });
          return;
        } catch (err) {
          // User dismissed or aborted; fallback to clipboard
        }
      }

      // Clipboard fallback
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const ta = document.createElement('textarea');
          ta.value = shareUrl;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        // Visual feedback on button
        const span = lightboxShareBtn.querySelector('span');
        const originalText = span ? span.textContent : '';
        if (span) span.textContent = copiedText;
        lightboxShareBtn.style.background = 'rgba(16, 185, 129, 0.25)';
        lightboxShareBtn.style.borderColor = '#10B981';
        lightboxShareBtn.style.color = '#34D399';

        setTimeout(() => {
          if (span) span.textContent = originalText;
          lightboxShareBtn.style.background = '';
          lightboxShareBtn.style.borderColor = '';
          lightboxShareBtn.style.color = '';
        }, 2200);
      } catch (err) {
        console.warn('Could not copy link:', err);
      }
    });
  }

  // --- 4. Deep Link Auto-Open on Page Load (?item=slug) ---
  const itemParam = new URLSearchParams(window.location.search).get('item');
  if (itemParam) {
    const slugQuery = itemParam.toLowerCase();
    const imageItems = getImageItems();
    let matchedItem = imageItems.find(it => (it.getAttribute('data-slug') || '').toLowerCase() === slugQuery);

    if (!matchedItem) {
      // Look across all galleryItems if current filter excluded it
      matchedItem = galleryItems.find(it => (it.getAttribute('data-slug') || '').toLowerCase() === slugQuery);
      if (matchedItem) {
        setCategoryFilter('all', false);
      }
    }

    if (matchedItem) {
      const refreshedImageItems = getImageItems();
      const targetIdx = refreshedImageItems.indexOf(matchedItem);
      if (targetIdx !== -1) {
        setTimeout(() => {
          openLightbox(targetIdx);
        }, 150);
      }
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showNextImage();
    } else if (e.key === 'ArrowRight') {
      showPrevImage();
    }
  });
};
