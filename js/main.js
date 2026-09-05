/**
 * GHANEM FURNITURE
 * Main Application Logic & Interactive Features
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Drawer Navigation ---
  const navToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('mobileDrawerOverlay');

  function openDrawer() {
    if (!mobileDrawer || !drawerOverlay || !navToggle) return;
    mobileDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer || !drawerOverlay || !navToggle) return;
    mobileDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleDrawer() {
    if (mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  if (navToggle && mobileDrawer && drawerOverlay) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', toggleDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // Close drawer when clicking any link inside
    const mobileLinks = mobileDrawer.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Close drawer with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }

  // --- 2. Sticky Header On Scroll ---
  const header = document.querySelector('.site-header');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTop) {
      if (scrollY > 350) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- 3. Scroll Reveal Animations (IntersectionObserver) ---
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  // --- 4. Interactive FAQ Accordions ---
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      if (questionBtn) {
        questionBtn.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          
          // Close other open accordion items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
              const otherBtn = otherItem.querySelector('.faq-question');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });

          item.classList.toggle('active', !isActive);
          questionBtn.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
        });
      }
    });
  }

  // --- 5. Highlight Current Navigation Page ---
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let currentFile = pathParts.pop() || 'index.html';
  if (currentFile.includes('?')) currentFile = currentFile.split('?')[0];
  if (currentFile.includes('#')) currentFile = currentFile.split('#')[0];
  if (currentFile === '') currentFile = 'index.html';

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('active');
      if (href === currentFile || (currentFile === 'index.html' && (href === './' || href === 'index.html' || href === '/'))) {
        link.classList.add('active');
      }
    });
  }

  // --- 6. Dynamic Year in Footer ---
  const currentYear = new Date().getFullYear();
  const yearSpans = document.querySelectorAll('#yearSpan, .current-year');
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });

  // --- 7. 3D Design iMac Mockup Screen Carousel ---
  const mockupCarousels = document.querySelectorAll('.imac-mockup-frame');
  mockupCarousels.forEach(mockup => {
    const slides = mockup.querySelectorAll('.mockup-screen-slide');
    const dots = mockup.querySelectorAll('.mockup-dot');
    const prevBtn = mockup.querySelector('.mockup-nav-prev');
    const nextBtn = mockup.querySelector('.mockup-nav-next');
    const titleEl = mockup.querySelector('.mockup-active-title');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    const intervalTime = 3500;

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = slides.length - 1;
      } else if (index >= slides.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      slides.forEach((slide, i) => {
        if (i === currentIndex) {
          slide.classList.add('active');
          const title = slide.getAttribute('data-title');
          if (titleEl && title) {
            titleEl.textContent = title;
          }
        } else {
          slide.classList.remove('active');
        }
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(nextSlide, intervalTime);
    }

    function stopAutoPlay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Attach Event Listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(i);
        startAutoPlay();
      });
    });

    // Pause on hover
    mockup.addEventListener('mouseenter', stopAutoPlay);
    mockup.addEventListener('mouseleave', startAutoPlay);

    // Touch support for mobile swipe
    let touchStartX = 0;
    mockup.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    mockup.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          // Swipe left (in RTL: next)
          nextSlide();
        } else {
          // Swipe right (in RTL: prev)
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Initial setup & start
    goToSlide(0);
    startAutoPlay();
  });
});
