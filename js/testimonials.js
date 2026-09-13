/**
 * GHANEM FURNITURE
 * Interactive Customer Reviews & Rating Engine with Multilingual Support
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ghanem_customer_reviews_v2';
  try {
    localStorage.removeItem('ghanem_customer_reviews');
  } catch (e) {}
  let currentRating = 5;

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

  // Rating labels in Arabic and English
  const RATING_LABELS = {
    ar: {
      1: '⭐ 1 من 5 - غير راضٍ',
      2: '⭐⭐ 2 من 5 - مقبول ولكن يحتاج تحسين',
      3: '⭐⭐⭐ 3 من 5 - جيد بشكل عام',
      4: '⭐⭐⭐⭐ 4 من 5 - ممتاز وخدمة راقية',
      5: '⭐⭐⭐⭐⭐ 5 من 5 - تجربة استثنائية تفوق التوقعات'
    },
    en: {
      1: '⭐ 1 of 5 - Unsatisfied',
      2: '⭐⭐ 2 of 5 - Fair, needs improvement',
      3: '⭐⭐⭐ 3 of 5 - Good overall',
      4: '⭐⭐⭐⭐ 4 of 5 - Excellent, premium service',
      5: '⭐⭐⭐⭐⭐ 5 of 5 - Exceptional, exceeds expectations'
    }
  };

  // Authentic verified reviews from the official Facebook page
  const DEFAULT_REVIEWS = [
    {
      id: 'rev-fb-1',
      name: 'Amal Tarek',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '5 مايو 2025',
        en: 'May 5, 2025'
      },
      quote: {
        ar: 'ديكورات تحفه و الخامات ممتازة',
        en: 'ديكورات تحفه و الخامات ممتازة'
      }
    },
    {
      id: 'rev-fb-2',
      name: 'مشاء الله',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '5 مايو 2025',
        en: 'May 5, 2025'
      },
      quote: {
        ar: 'مكان ممتاز و الخامات تحفه و كنت عملت من عنده مطبخ و حقيقي شغله ممتاز',
        en: 'مكان ممتاز و الخامات تحفه و كنت عملت من عنده مطبخ و حقيقي شغله ممتاز'
      }
    },
    {
      id: 'rev-fb-3',
      name: 'Eman Kashwaa',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '22 مايو 2022',
        en: 'May 22, 2022'
      },
      quote: {
        ar: 'تسلم ايديك ا غانم شغل جميل والفنش تحفه ومواعيد التسليم ربنا يباركلك',
        en: 'تسلم ايديك ا غانم شغل جميل والفنش تحفه ومواعيد التسليم ربنا يباركلك'
      }
    },
    {
      id: 'rev-fb-4',
      name: 'Hussein Tharwat',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '27 ديسمبر 2019',
        en: 'December 27, 2019'
      },
      quote: {
        ar: 'ديكورات ممتازة خامات جيدة',
        en: 'ديكورات ممتازة خامات جيدة'
      }
    },
    {
      id: 'rev-fb-5',
      name: 'Anas Hamed Atta',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '2 ديسمبر 2018',
        en: 'December 2, 2018'
      },
      quote: {
        ar: 'VERY NICE WORK. HOPE STILL',
        en: 'VERY NICE WORK. HOPE STILL'
      }
    },
    {
      id: 'rev-fb-6',
      name: 'Hamada Eldesouky',
      role: {
        ar: 'توصية عبر صفحة فيسبوك الرسمية',
        en: 'Recommendation via official Facebook page'
      },
      rating: 5,
      date: {
        ar: '13 يونيو 2018',
        en: 'June 13, 2018'
      },
      quote: {
        ar: 'بسم الله ماشاء الله إبداع عالي جدا',
        en: 'بسم الله ماشاء الله إبداع عالي جدا'
      }
    }
  ];

  // Helper to generate initials avatar
  function getInitials(name) {
    if (!name) return 'غ';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const first = parts[0][0];
      const second = parts[1][0];
      return (first + '.' + second).toUpperCase();
    }
    return parts[0].substring(0, 2);
  }

  // Generate SVG stars markup
  function generateStarsSvg(count) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const fill = i <= count ? '#F59E0B' : '#D1D5DB';
      html += `<svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: ${fill};"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    return html;
  }

  // Create review HTML Card element
  function createReviewCard(rev, isNew = false) {
    const lang = getCurrentLang();
    const card = document.createElement('div');
    card.className = 'testimonial-card reveal' + (isNew ? ' is-new-review' : '');
    card.id = rev.id;

    const badgeText = lang === 'en' ? 'Recent Review ✨' : 'تقييم حديث ✨';
    const defaultRole = lang === 'en' ? 'Verified Ghanem Furniture Client' : 'عميل معتمد لدى Ghanem Furniture';
    const roleText = getLocalized(rev.role, lang) || defaultRole;
    const quoteText = getLocalized(rev.quote, lang);
    const dateText = getLocalized(rev.date, lang);

    card.innerHTML = `
      ${isNew ? `<span class="testimonial-badge-new">${badgeText}</span>` : ''}
      <div class="testimonial-stars">
        ${generateStarsSvg(rev.rating)}
      </div>
      <p class="testimonial-quote">"${escapeHtml(quoteText)}"</p>
      <div class="testimonial-author-wrap">
        <div class="testimonial-avatar">${getInitials(rev.name)}</div>
        <div style="flex: 1;">
          <div class="testimonial-name">${escapeHtml(rev.name)}</div>
          <div class="testimonial-role">${escapeHtml(roleText)}</div>
          ${dateText ? `<div class="testimonial-date">🕒 ${escapeHtml(dateText)}</div>` : ''}
        </div>
      </div>
    `;

    return card;
  }

  // Load reviews from localStorage
  function getStoredReviews() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read stored reviews:', e);
      return [];
    }
  }

  // Save new review to localStorage
  function saveReview(rev) {
    try {
      const stored = getStoredReviews();
      stored.unshift(rev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.warn('Could not save review:', e);
    }
  }

  // Update Score Card & Counts
  function updateCounters() {
    const lang = getCurrentLang();
    const stored = getStoredReviews();
    const totalCount = DEFAULT_REVIEWS.length + stored.length;
    const countEl = document.getElementById('reviewsTotalCount');
    if (countEl) {
      countEl.textContent = lang === 'en'
        ? `Based on ${totalCount} verified reviews from official Facebook page`
        : `بناءً على ${totalCount} تقييمات موثقة من صفحة فيسبوك الرسمية`;
    }
  }

  // Render initial reviews and user-submitted reviews
  function renderAllReviews() {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // 1. User reviews from localStorage first (most recent)
    const userReviews = getStoredReviews();
    userReviews.forEach(rev => {
      grid.appendChild(createReviewCard(rev, true));
    });

    // 2. Default verified reviews
    DEFAULT_REVIEWS.forEach(rev => {
      grid.appendChild(createReviewCard(rev, false));
    });

    updateCounters();
    revealReviewCards();
  }

  function revealReviewCards() {
    const cards = document.querySelectorAll('.testimonials-grid .reveal');
    if (!cards.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      });
      cards.forEach(card => observer.observe(card));
    } else {
      cards.forEach(card => card.classList.add('active'));
    }
  }

  // Initialize Interactive Star Rating Selector
  function initStarRatingPicker() {
    const starsContainer = document.getElementById('starRatingPicker');
    const labelEl = document.getElementById('starRatingLabel');
    if (!starsContainer) return;

    const starIcons = starsContainer.querySelectorAll('svg');

    function highlightStars(val) {
      const lang = getCurrentLang();
      const labels = RATING_LABELS[lang] || RATING_LABELS['ar'];
      starIcons.forEach(icon => {
        const ratingVal = parseInt(icon.getAttribute('data-value'), 10);
        if (ratingVal <= val) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
      if (labelEl) {
        labelEl.textContent = labels[val] || '';
      }
    }

    starIcons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        const val = parseInt(icon.getAttribute('data-value'), 10);
        highlightStars(val);
      });

      icon.addEventListener('click', () => {
        currentRating = parseInt(icon.getAttribute('data-value'), 10);
        highlightStars(currentRating);
      });
    });

    starsContainer.addEventListener('mouseleave', () => {
      highlightStars(currentRating);
    });

    highlightStars(currentRating);
  }

  // Setup Review Submission Form
  function initReviewForm() {
    const toggleBtn = document.getElementById('toggleReviewFormBtn');
    const formCard = document.getElementById('reviewFormCard');
    const form = document.getElementById('addReviewForm');
    const cancelBtn = document.getElementById('cancelReviewBtn');
    const successAlert = document.getElementById('reviewSuccessAlert');

    if (toggleBtn && formCard) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = formCard.classList.contains('open');
        formCard.classList.toggle('open', !isOpen);
        if (!isOpen) {
          formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const nameInput = document.getElementById('reviewAuthorName');
          if (nameInput) nameInput.focus();
        }
      });
    }

    if (cancelBtn && formCard) {
      cancelBtn.addEventListener('click', () => {
        formCard.classList.remove('open');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const lang = getCurrentLang();
        const nameInput = document.getElementById('reviewAuthorName');
        const roleInput = document.getElementById('reviewAuthorRole');
        const quoteInput = document.getElementById('reviewQuote');

        const name = nameInput ? nameInput.value.trim() : '';
        const role = roleInput ? roleInput.value.trim() : '';
        const quote = quoteInput ? quoteInput.value.trim() : '';

        if (!name || !quote) {
          const alertMsg = lang === 'en'
            ? 'Please enter your name and review details.'
            : 'يرجى كتابة الاسم وتفاصيل رأيك / تعليقك.';
          alert(alertMsg);
          return;
        }

        const defaultRole = lang === 'en' ? 'Ghanem Furniture Client' : 'عميل Ghanem Furniture';
        const newReview = {
          id: 'rev-user-' + Date.now(),
          name: name,
          role: role || defaultRole,
          rating: currentRating,
          date: lang === 'en' ? 'Just now (New review)' : 'الآن (تقييم جديد)',
          quote: quote
        };

        // Save and Render
        saveReview(newReview);

        const grid = document.querySelector('.testimonials-grid');
        if (grid) {
          const newCard = createReviewCard(newReview, true);
          grid.insertBefore(newCard, grid.firstChild);
          newCard.classList.add('active');
          newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        updateCounters();

        // Send email notification to site owner in background via EmailJS
        try {
          if (typeof emailjs !== 'undefined') {
            if (typeof emailjs.init === 'function') {
              emailjs.init({ publicKey: "fLXg3QrDyPaSMa1oN" });
            }
            const starsEmoji = '⭐'.repeat(newReview.rating);
            const reviewEmailBody = 
`🌟 تقييم ورأي عميل جديد تم إرساله عبر موقع Ghanem Furniture:
---------------------------------------------
👤 اسم العميل: ${newReview.name}
💼 نوع المشروع / المدينة: ${newReview.role || 'غير محدد'}
⭐ التقييم: ${newReview.rating} من 5 (${starsEmoji})
💬 نص الرأي والتعليق:
"${newReview.quote}"
---------------------------------------------
🕒 توقيت الإرسال: ${new Date().toLocaleString('ar-EG')}
📍 الصفحة: آراء وتقييمات العملاء (testimonials.html)`;

            emailjs.send("service_ngeifoq", "template_v1mkb5i", {
              name: newReview.name,
              phone: newReview.role || 'تقييم من صفحة الآراء',
              email: 'testimonials@ghanemfurniture.com',
              service: `[رأي عميل جديد] ${newReview.rating} نجوم ${starsEmoji}`,
              message: reviewEmailBody,
              reference_photos: 'رأي عميل جديد للمراجعة'
            }).then(function (res) {
              console.log('[testimonials.js] EmailJS review notification sent successfully:', res.status, res.text);
            }).catch(function (err) {
              console.warn('[testimonials.js] EmailJS review notification failed:', err);
            });
          } else {
            console.warn('[testimonials.js] emailjs SDK not loaded');
          }
        } catch (emailErr) {
          console.warn('[testimonials.js] Error triggering EmailJS notification:', emailErr);
        }

        // Show Success banner
        if (successAlert) {
          successAlert.style.display = 'flex';
          successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => {
            successAlert.style.display = 'none';
          }, 6000);
        }

        // Reset form
        form.reset();
        currentRating = 5;
        initStarRatingPicker();
        if (formCard) formCard.classList.remove('open');
      });
    }
  }

  // Update on languageChanged event
  window.addEventListener('languageChanged', () => {
    renderAllReviews();
    initStarRatingPicker();
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    renderAllReviews();
    initStarRatingPicker();
    initReviewForm();
  });
})();
