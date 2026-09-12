/**
 * GHANEM FURNITURE
 * Gallery Loader — renders gallery items from data/gallery.json
 * This makes the gallery editable via /admin (Decap CMS) without touching code.
 */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  // كل قسم من أقسام المعرض له ملف JSON منفصل، عشان تقدر تدخل من لوحة
  // التحكم على القسم اللي عاوزه (مطابخ / غرف نوم / ...) مباشرة من غير
  // ما تدور بين كل الصور. أضف اسم الملف هنا لو ضفت قسم جديد من config.yml.
  const GALLERY_SECTIONS = [
    'kitchens',
    'bedrooms',
    'woodwork',
    'furniture',
    'designs',
    'designs-3d',
    'workshop',
  ];

  Promise.all(
    GALLERY_SECTIONS.map((section) =>
      fetch(`data/gallery/${section}.json`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : { items: [] }))
        .catch(() => ({ items: [] }))
    )
  )
    .then((sections) => {
      const items = sections.flatMap((data) => (Array.isArray(data) ? data : (data.items || [])));
      renderItems(items);
    })
    .catch((err) => {
      console.error('تعذر تحميل بيانات المعرض:', err);
      grid.innerHTML = '<p style="text-align:center;padding:40px;">تعذر تحميل صور المعرض حالياً.</p>';
    })
    .finally(() => {
      // Hand off to gallery.js to wire up filters + lightbox now that items exist
      if (typeof window.initGalleryInteractions === 'function') {
        window.initGalleryInteractions();
      }
    });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderItems(items) {
    grid.innerHTML = items.map((item) => {
      const categories = Array.isArray(item.category) ? item.category.join(' ') : (item.category || '');
      const alt = escapeHtml(item.alt || item.title || '');
      const image = escapeHtml(item.image || '');
      const badge = escapeHtml(item.badge || '');
      const title = escapeHtml(item.title || '');
      const description = escapeHtml(item.description || '');

      return `
        <div class="gallery-item" data-category="${escapeHtml(categories)}">
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
});
