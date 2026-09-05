/**
 * GHANEM FURNITURE
 * Interactive Portfolio Filter & Lightbox Component
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // --- 1. Interactive Category Filter ---
  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter') || 'all';
        updateVisibleItems(filterValue);
      });
    });
  }

  // --- 2. Lightbox Modal Functionality ---
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

    const img = item.querySelector('img.gallery-thumb, img');
    const title = item.querySelector('.gallery-item-title, h3')?.textContent?.trim() || 'مشروع Ghanem Furniture';
    const category = item.querySelector('.gallery-item-category, .gallery-badge')?.textContent?.trim() || 'أعمال خشبية فاخرة';

    if (lightboxImg && img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || title;
    }
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxCategory) lightboxCategory.textContent = category;

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
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

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      // In RTL, left arrow moves to next image
      showNextImage();
    } else if (e.key === 'ArrowRight') {
      // In RTL, right arrow moves to previous image
      showPrevImage();
    }
  });
});
