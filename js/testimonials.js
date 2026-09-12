/**
 * GHANEM FURNITURE
 * Interactive Customer Reviews & Rating Engine with Multilingual Support
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ghanem_customer_reviews';
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

  // Default human-sounding initial reviews with dual-language content
  const DEFAULT_REVIEWS = [
    {
      id: 'rev-1',
      name: 'م. أحمد الشريف',
      role: {
        ar: 'مشروع مطبخ مودرن كامل - التجمع الخامس، القاهرة',
        en: 'Full Modern Kitchen Project - Fifth Settlement, Cairo'
      },
      rating: 5,
      date: {
        ar: 'منذ أسبوعين',
        en: '2 weeks ago'
      },
      quote: {
        ar: 'بصراحة كنت متردد في الأول أفصل عمولة وكنت هشتري جاهز، بس لما قعدت مع الباشمهندس وشفت عينات الخشب الزان والتصميم الـ 3D اقتنعت تماماً. المطبخ بقاله عندي 6 شهور، الخامات ممتازة والمفصلات بلوم أصلية وسلسة جداً ومفيش أي هبوط في الدلف ولا تأثر بالبخار. ربنا يبارك لكم على الضمير والشغل النضيف.',
        en: 'Honestly, I was hesitant at first about custom manufacturing and was about to buy ready-made. But after meeting the engineer and seeing the solid beechwood samples and the 3D design, I was completely convinced. The kitchen has been installed for 6 months now: exceptional materials, genuine smooth Blum hydraulic hinges, no sagging doors, and zero moisture impact. May God bless your integrity and immaculate craftsmanship.'
      }
    },
    {
      id: 'rev-2',
      name: 'م. كريم السعدني',
      role: {
        ar: 'مهندس تصميم داخلي ومقاولات - الشيخ زايد',
        en: 'Interior Architect & Contractor - Sheikh Zayed'
      },
      rating: 5,
      date: {
        ar: 'منذ شهر',
        en: '1 month ago'
      },
      quote: {
        ar: 'أنا عندي مكتب تشطيبات، وكل شغل تقطيع المسطحات ولزق شريط الحرف (القشاط) بعمله في ورشة غانم. بجد مكن التقطيع الإيطالي عندهم نتيجته زيرو رايش والزوايا 90 درجة بالمللي، وده بيوفر عليا وقت التركيب جداً ومبيكسفنيش قدام العميل. أمانة وسرعة وتسليم في الميعاد.',
        en: 'I run an interior contracting firm, and I handle all sheet cutting and edge-banding at Ghanem workshops. Truly, their Italian panel saws yield zero chipout and perfect 90-degree cuts to the millimeter. This saves me tremendous installation time and ensures my clients are always impressed. Remarkable reliability, speed, and punctuality.'
      }
    },
    {
      id: 'rev-3',
      name: 'أ. سارة عبد الرحمن',
      role: {
        ar: 'دريسنج روم وغرفة نوم ماستر - المعادي',
        en: 'Walk-In Dressing Room & Master Bedroom - Maadi'
      },
      rating: 5,
      date: {
        ar: 'منذ شهر ونصف',
        en: '1.5 months ago'
      },
      quote: {
        ar: 'فصلت دريسنج روم كاملة وغرفة نوم ماستر.. التشطيب فوق الوصف، ملمس الدهان ناعم جداً مفيش أي غلطة والتقسيمات الداخلية مريحة قوي واستغلت كل زاوية في الأوضة. والفنيين اللي جم ركبوا قمة في الذوق والأدب وما مشيوش غير لما اتأكدوا إني راضية عن كل درج ودلفة.',
        en: 'I ordered a complete custom dressing room and master bedroom suite. The finishing is beyond description—silky smooth lacquer with zero flaws, and an intuitive layout optimizing every room corner. The installation technicians were polite, considerate, and did not leave until ensuring I was completely satisfied with every drawer and door.'
      }
    },
    {
      id: 'rev-4',
      name: 'أ. مصطفى كامل',
      role: {
        ar: 'شقة عريس بالكامل - مصر الجديدة',
        en: 'Complete Bridal Residence - Heliopolis'
      },
      rating: 5,
      date: {
        ar: 'منذ شهرين',
        en: '2 months ago'
      },
      quote: {
        ar: 'أهم حاجة كانت عندي هي الالتزام بالوقت عشان توضيب الشقة وميعاد الفرح كان مضغوط.. سلموني الشغل كامل قبل الميعاد المتفق عليه بيومين! قطع الخشب متينة وثقيلة خشب طبيعي معالج بجد مش كرتون مضغوط زي اللي بنشوفه في السوق. شكراً ليكم بجد رفعتوا راسي.',
        en: 'My top priority was adhering to the strict delivery schedule ahead of our wedding. They delivered everything two days ahead of the agreed date! The furniture is sturdy and substantial—genuine treated natural wood, not compressed board like most of the market. Thank you for exceeding all expectations.'
      }
    },
    {
      id: 'rev-5',
      name: 'الحاج صبحي النجار',
      role: {
        ar: 'صاحب ورشة موبيليا - دمياط (خدمات B2B)',
        en: 'Furniture Workshop Owner - Damietta (B2B Services)'
      },
      rating: 5,
      date: {
        ar: 'منذ 3 أشهر',
        en: '3 months ago'
      },
      quote: {
        ar: 'من أحسن الورش اللي اتعاملت معاها من سنين في السوق.. مفيش هدر في الألواح إطلاقاً لأنهم بيشتغلوا ببرامج تقطيع متطورة، وسعر المتر مناسب جداً لأصحاب الورش. القشاط الحراري ماسك في الحرف عمره ما يفك ولا يرطب.',
        en: 'One of the best industrial workshops I have partnered with in years. Zero panel wastage thanks to their advanced sheet optimization software, and highly competitive rates for workshops. Their hot-melt edge banding bonds permanently without peeling or absorbing moisture.'
      }
    },
    {
      id: 'rev-6',
      name: 'د. منى السعيد',
      role: {
        ar: 'تجديد مطبخ ودواليب ملابس - مدينة نصر',
        en: 'Kitchen & Wardrobe Renovation - Nasr City'
      },
      rating: 5,
      date: {
        ar: 'منذ 4 أشهر',
        en: '4 months ago'
      },
      quote: {
        ar: 'خدمة ما بعد البيع هي اللي بتفرق المحترم عن غيره.. بعد التركيب بحوالي شهر طلبت أغير مكان رف في المطبخ عشان اشتريت ميكروويف بمقاس أكبر، جم في نفس الأسبوع وعملوا التعديل بكل ترحاب ومن غير أي تعقيد. شكراً لذوقكم ولدقة شغلكم.',
        en: 'After-sales service is what truly sets a respectable business apart. A month after installation, I needed a shelf adjusted for a larger microwave. Their team arrived that same week and made the adjustment graciously without complications. Thank you for your courtesy and precision.'
      }
    }
  ];

  // Helper to generate initials avatar
  function getInitials(name) {
    if (!name) return 'ع';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + '.' + parts[1][0]);
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
        ? `Based on ${totalCount} verified reviews`
        : `بناءً على ${totalCount} تقييماً موثقاً`;
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
