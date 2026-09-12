/**
 * GHANEM FURNITURE
 * Gallery Loader — renders gallery items from data/gallery.json with multilingual support
 * This makes the gallery editable via /admin (Decap CMS) without touching code.
 */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const GALLERY_SECTIONS = [
    'kitchens',
    'bedrooms',
    'woodwork',
    'furniture',
    'designs',
    'designs-3d',
    'workshop',
  ];

  let loadedItems = [];

  function getCurrentLang() {
    if (window.i18n && typeof window.i18n.getLanguage === 'function') {
      return window.i18n.getLanguage();
    }
    return localStorage.getItem('site_lang') || 'ar';
  }

  function getLocalized(val, lang) {
    if (!val) return '';
    if (typeof val === 'object' && val !== null) {
      return val[lang] || val['ar'] || val['en'] || '';
    }
    return String(val);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderItems(items, lang) {
    grid.innerHTML = items.map((item, index) => {
      const categories = Array.isArray(item.category) ? item.category.join(' ') : (item.category || '');
      const alt = escapeHtml(getLocalized(item.alt || item.title, lang));
      const image = escapeHtml(item.image || '');
      const badge = escapeHtml(getLocalized(item.badge, lang));
      const title = escapeHtml(getLocalized(item.title, lang));
      const description = escapeHtml(getLocalized(item.description, lang));

      return `
        <div class="gallery-item" data-index="${index}" data-category="${escapeHtml(categories)}">
          <img src="${image}" alt="${alt}" loading="lazy" decoding="async">
          <div class="gallery-overlay">
            ${badge ? `<span class="gallery-badge">${badge}</span>` : ''}
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateTranslations(lang) {
    const itemEls = grid.querySelectorAll('.gallery-item');
    loadedItems.forEach((item, index) => {
      const el = itemEls[index];
      if (!el) return;
      const badgeEl = el.querySelector('.gallery-badge');
      const h3El = el.querySelector('h3');
      const pEl = el.querySelector('p');
      const imgEl = el.querySelector('img');

      const badgeText = getLocalized(item.badge, lang);
      const titleText = getLocalized(item.title, lang);
      const descText = getLocalized(item.description, lang);
      const altText = getLocalized(item.alt || item.title, lang);

      if (badgeEl) badgeEl.textContent = badgeText;
      if (h3El) h3El.textContent = titleText;
      if (pEl) pEl.textContent = descText;
      if (imgEl) imgEl.alt = altText;
    });

    // Also update lightbox if currently open
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      const lightboxImg = document.getElementById('lightboxImg');
      const lightboxTitle = document.getElementById('lightboxTitle');
      const lightboxCategory = document.getElementById('lightboxCategory');
      if (lightboxImg) {
        const currentSrc = lightboxImg.getAttribute('src');
        const matchedItem = loadedItems.find(it => it.image === currentSrc);
        if (matchedItem) {
          if (lightboxTitle) lightboxTitle.textContent = getLocalized(matchedItem.title, lang);
          if (lightboxCategory) lightboxCategory.textContent = getLocalized(matchedItem.badge, lang);
        }
      }
    }
  }

  // Listen to language changes
  window.addEventListener('languageChanged', (e) => {
    const lang = (e && e.detail && e.detail.lang) || getCurrentLang();
    updateTranslations(lang);
  });

  Promise.all(
    GALLERY_SECTIONS.map((section) =>
      fetch(`data/gallery/${section}.json`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .catch(() => ({ items: [] }))
    )
  )
    .then((sections) => {
      loadedItems = sections.flatMap((data) => (Array.isArray(data) ? data : (data.items || [])));
      const lang = getCurrentLang();
      renderItems(loadedItems, lang);
    })
    .catch((err) => {
      console.error('تعذر تحميل بيانات المعرض:', err);
      const isEn = getCurrentLang() === 'en';
      grid.innerHTML = `<p style="text-align:center;padding:40px;">${isEn ? 'Could not load gallery images.' : 'تعذر تحميل صور المعرض حالياً.'}</p>`;
    })
    .finally(() => {
      if (typeof window.initGalleryInteractions === 'function') {
        window.initGalleryInteractions();
      }
    });
});
