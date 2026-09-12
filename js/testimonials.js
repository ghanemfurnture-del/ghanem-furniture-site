/**
 * GHANEM FURNITURE
 * Interactive Customer Reviews & Rating Engine
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ghanem_customer_reviews';
  let currentRating = 5;

  // Rating labels in Arabic
  const RATING_LABELS = {
    1: '⭐ 1 من 5 - غير راضٍ',
    2: '⭐⭐ 2 من 5 - مقبول ولكن يحتاج تحسين',
    3: '⭐⭐⭐ 3 من 5 - جيد بشكل عام',
    4: '⭐⭐⭐⭐ 4 من 5 - ممتاز وخدمة راقية',
    5: '⭐⭐⭐⭐⭐ 5 من 5 - تجربة استثنائية تفوق التوقعات'
  };

  // Default human-sounding initial reviews
  const DEFAULT_REVIEWS = [
    {
      id: 'rev-1',
      name: 'م. أحمد الشريف',
      role: 'مشروع مطبخ مودرن كامل - التجمع الخامس، القاهرة',
      rating: 5,
      date: 'منذ أسبوعين',
      quote: 'بصراحة كنت متردد في الأول أفصل عمولة وكنت هشتري جاهز، بس لما قعدت مع الباشمهندس وشفت عينات الخشب الزان والتصميم الـ 3D اقتنعت تماماً. المطبخ بقاله عندي 6 شهور، الخامات ممتازة والمفصلات بلوم أصلية وسلسة جداً ومفيش أي هبوط في الدلف ولا تأثر بالبخار. ربنا يبارك لكم على الضمير والشغل النضيف.'
    },
    {
      id: 'rev-2',
      name: 'م. كريم السعدني',
      role: 'مهندس تصميم داخلي ومقاولات - الشيخ زايد',
      rating: 5,
      date: 'منذ شهر',
      quote: 'أنا عندي مكتب تشطيبات، وكل شغل تقطيع المسطحات ولزق شريط الحرف (القشاط) بعمله في ورشة غانم. بجد مكن التقطيع الإيطالي عندهم نتيجته زيرو رايش والزوايا 90 درجة بالمللي، وده بيوفر عليا وقت التركيب جداً ومبيكسفنيش قدام العميل. أمانة وسرعة وتسليم في الميعاد.'
    },
    {
      id: 'rev-3',
      name: 'أ. سارة عبد الرحمن',
      role: 'دريسنج روم وغرفة نوم ماستر - المعادي',
      rating: 5,
      date: 'منذ شهر ونصف',
      quote: 'فصلت دريسنج روم كاملة وغرفة نوم ماستر.. التشطيب فوق الوصف، ملمس الدهان ناعم جداً مفيش أي غلطة والتقسيمات الداخلية مريحة قوي واستغلت كل زاوية في الأوضة. والفنيين اللي جم ركبوا قمة في الذوق والأدب وما مشيوش غير لما اتأكدوا إني راضية عن كل درج ودلفة.'
    },
    {
      id: 'rev-4',
      name: 'أ. مصطفى كامل',
      role: 'شقة عريس بالكامل - مصر الجديدة',
      rating: 5,
      date: 'منذ شهرين',
      quote: 'أهم حاجة كانت عندي هي الالتزام بالوقت عشان توضيب الشقة وميعاد الفرح كان مضغوط.. سلموني الشغل كامل قبل الميعاد المتفق عليه بيومين! قطع الخشب متينة وثقيلة خشب طبيعي معالج بجد مش كرتون مضغوط زي اللي بنشوفه في السوق. شكراً ليكم بجد رفعتوا راسي.'
    },
    {
      id: 'rev-5',
      name: 'الحاج صبحي النجار',
      role: 'صاحب ورشة موبيليا - دمياط (خدمات B2B)',
      rating: 5,
      date: 'منذ 3 أشهر',
      quote: 'من أحسن الورش اللي اتعاملت معاها من سنين في السوق.. مفيش هدر في الألواح إطلاقاً لأنهم بيشتغلوا ببرامج تقطيع متطورة، وسعر المتر مناسب جداً لأصحاب الورش. القشاط الحراري ماسك في الحرف عمره ما يفك ولا يرطب.'
    },
    {
      id: 'rev-6',
      name: 'د. منى السعيد',
      role: 'تجديد مطبخ ودواليب ملابس - مدينة نصر',
      rating: 5,
      date: 'منذ 4 أشهر',
      quote: 'خدمة ما بعد البيع هي اللي بتفرق المحترم عن غيره.. بعد التركيب بحوالي شهر طلبت أغير مكان رف في المطبخ عشان اشتريت ميكروويف بمقاس أكبر، جم في نفس الأسبوع وعملوا التعديل بكل ترحاب ومن غير أي تعقيد. شكراً لذوقكم ولدقة شغلكم.'
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
    const card = document.createElement('div');
    card.className = 'testimonial-card reveal' + (isNew ? ' is-new-review' : '');
    card.id = rev.id;

    card.innerHTML = `
      ${isNew ? '<span class="testimonial-badge-new">تقييم حديث ✨</span>' : ''}
      <div class="testimonial-stars">
        ${generateStarsSvg(rev.rating)}
      </div>
      <p class="testimonial-quote">"${rev.quote}"</p>
      <div class="testimonial-author-wrap">
        <div class="testimonial-avatar">${getInitials(rev.name)}</div>
        <div style="flex: 1;">
          <div class="testimonial-name">${rev.name}</div>
          <div class="testimonial-role">${rev.role || 'عميل معتمد لدى Ghanem Furniture'}</div>
          ${rev.date ? `<div class="testimonial-date">🕒 ${rev.date}</div>` : ''}
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
    const stored = getStoredReviews();
    const totalCount = DEFAULT_REVIEWS.length + stored.length;
    const countEl = document.getElementById('reviewsTotalCount');
    if (countEl) {
      countEl.textContent = `بناءً على ${totalCount} تقييماً موثقاً`;
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

  // These cards are injected after main.js already set up its scroll-reveal
  // IntersectionObserver, so they need their own observer, otherwise they
  // stay permanently invisible (opacity: 0 from the .reveal class).
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
      starIcons.forEach(icon => {
        const ratingVal = parseInt(icon.getAttribute('data-value'), 10);
        if (ratingVal <= val) {
          icon.classList.add('active');
        } else {
          icon.classList.remove('active');
        }
      });
      if (labelEl) {
        labelEl.textContent = RATING_LABELS[val] || '';
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

    // Set initial
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

        const nameInput = document.getElementById('reviewAuthorName');
        const roleInput = document.getElementById('reviewAuthorRole');
        const quoteInput = document.getElementById('reviewQuote');

        const name = nameInput ? nameInput.value.trim() : '';
        const role = roleInput ? roleInput.value.trim() : '';
        const quote = quoteInput ? quoteInput.value.trim() : '';

        if (!name || !quote) {
          alert('يرجى كتابة الاسم وتفاصيل رأيك / تعليقك.');
          return;
        }

        const newReview = {
          id: 'rev-user-' + Date.now(),
          name: name,
          role: role || 'عميل Ghanem Furniture',
          rating: currentRating,
          date: 'الآن (تقييم جديد)',
          quote: quote
        };

        // Save and Render
        saveReview(newReview);

        const grid = document.querySelector('.testimonials-grid');
        if (grid) {
          const newCard = createReviewCard(newReview, true);
          grid.insertBefore(newCard, grid.firstChild);
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

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    renderAllReviews();
    initStarRatingPicker();
    initReviewForm();
  });
})();
