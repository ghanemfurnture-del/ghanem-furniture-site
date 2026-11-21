/**
 * GHANEM FURNITURE
 * Cinematic Scroll-Driven Hero Motion with WebP Image Sequence & GSAP ScrollTrigger
 * 
 * Features:
 * - High-DPI canvas rendering with 'object-fit: cover' mathematics
 * - Responsive sequence selection (120 frames desktop / 60 frames mobile)
 * - Configurable sequence paths via window.HERO_MOTION_CONFIG
 * - Smooth GSAP ScrollTrigger pin + scrub sync
 * - Progressive chunk preloading with sleek luxury gold progress indicator
 * - Full prefers-reduced-motion support (graceful static fallback)
 * - Safe fallback to poster image if frames are missing or fail to load
 * - Fully RTL and multilingual compatible
 */

(function () {
  'use strict';

  // 1. Config (Can be overridden by siteSettings in future phases)
  const DEFAULT_CONFIG = {
    desktop: {
      framesCount: 120,
      framePath: function (index) {
        return 'images/hero-frames/desktop/frame-' + String(index).padStart(3, '0') + '.webp';
      },
      fps: 12,
      width: 1280,
      height: 720
    },
    mobile: {
      framesCount: 60,
      framePath: function (index) {
        return 'images/hero-frames/mobile/frame-' + String(index).padStart(3, '0') + '.webp';
      },
      fps: 6,
      width: 720,
      height: 405
    },
    fallbackPoster: 'images/hero-poster.webp',
    scrollDistance: '220vh'
  };

  const config = Object.assign({}, DEFAULT_CONFIG, window.HERO_MOTION_CONFIG || {});

  function initHeroScroll() {
    const heroSection = document.getElementById('heroMotionSection');
    const heroContainer = document.getElementById('heroPinnedContainer');
    const canvas = document.getElementById('heroCanvas');
    const fallbackPic = document.getElementById('heroFallbackPicture');
    const preloader = document.getElementById('heroPreloader');
    const preloaderBar = document.getElementById('heroPreloaderBar');
    const scrollPrompt = document.getElementById('heroScrollPrompt');

    if (!heroSection || !heroContainer || !canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('[hero-scroll] Canvas 2D context not supported. Fallback active.');
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[hero-scroll] prefers-reduced-motion detected: using static hero display.');
      heroSection.classList.add('reduced-motion');
      return;
    }

    // Determine profile
    const isMobile = window.innerWidth <= 768;
    const currentProfile = isMobile ? config.mobile : config.desktop;
    const totalFrames = currentProfile.framesCount;

    // Cache of Image objects
    const images = new Array(totalFrames);
    let loadedCount = 0;
    let frame1Loaded = false;
    let currentRenderedIndex = -1;

    // Canvas sizing with DPR
    function resizeCanvas() {
      const rect = heroContainer.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile performance
      
      const displayWidth = rect.width || window.innerWidth;
      const displayHeight = rect.height || window.innerHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      if (currentRenderedIndex > 0) {
        renderFrame(currentRenderedIndex);
      }
    }

    // Draw image maintaining aspect ratio (cover mode)
    function drawImageCover(img) {
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      const canvasRatio = cw / ch;
      const imageRatio = nw / nh;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imageRatio) {
        drawWidth = cw;
        drawHeight = cw / imageRatio;
        offsetX = 0;
        offsetY = (ch - drawHeight) / 2;
      } else {
        drawWidth = ch * imageRatio;
        drawHeight = ch;
        offsetX = (cw - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    function renderFrame(frameIndex) {
      const clampedIndex = Math.max(1, Math.min(totalFrames, frameIndex));
      const img = images[clampedIndex - 1];

      if (img && img.complete && img.naturalWidth > 0) {
        drawImageCover(img);
        currentRenderedIndex = clampedIndex;
        
        // Hide fallback once canvas has rendered frame
        if (fallbackPic && !fallbackPic.classList.contains('hidden')) {
          fallbackPic.classList.add('hidden');
        }
      }
    }

    // Update luxury progress bar
    function updateProgress(loaded, total) {
      if (!preloaderBar) return;
      const percent = Math.min(100, Math.round((loaded / total) * 100));
      preloaderBar.style.width = percent + '%';

      if (percent >= 100) {
        setTimeout(function () {
          if (preloader) preloader.classList.add('done');
        }, 400);
      }
    }

    // Preload an image promise
    function loadImage(index) {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.src = currentProfile.framePath(index);
        img.onload = function () {
          images[index - 1] = img;
          loadedCount++;
          updateProgress(loadedCount, totalFrames);
          resolve(img);
        };
        img.onerror = function (err) {
          // Record failed image gracefully
          images[index - 1] = null;
          reject(err);
        };
      });
    }

    // Resize canvas initially
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Step 1: Preload Frame 1 immediately (LCP fallback / instant visual)
    loadImage(1).then(function (firstImg) {
      frame1Loaded = true;
      renderFrame(1);

      // Initialize GSAP ScrollTrigger after first frame is safely ready
      setupScrollTrigger();

      // Step 2: Progressively load remaining frames
      loadRemainingFrames();
    }).catch(function (err) {
      console.warn('[hero-scroll] Could not load initial frame. Keeping static poster image.', err);
      if (preloader) preloader.classList.add('done');
      heroSection.classList.add('motion-fallback-active');
    });

    // Progressive loader in controlled chunks (avoids network congestions)
    function loadRemainingFrames() {
      let nextIndex = 2;
      const CHUNK_SIZE = 6;

      function loadNextBatch() {
        if (nextIndex > totalFrames) return;

        const promises = [];
        for (let i = 0; i < CHUNK_SIZE && nextIndex <= totalFrames; i++, nextIndex++) {
          promises.push(loadImage(nextIndex).catch(function () {}));
        }

        Promise.all(promises).then(function () {
          if (nextIndex <= totalFrames) {
            // Yield briefly to main thread for smooth UI
            if (window.requestIdleCallback) {
              window.requestIdleCallback(loadNextBatch, { timeout: 200 });
            } else {
              setTimeout(loadNextBatch, 30);
            }
          }
        });
      }

      loadNextBatch();
    }

    // Step 3: Setup GSAP Timeline with ScrollTrigger
    function setupScrollTrigger() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[hero-scroll] GSAP or ScrollTrigger not loaded. Frame 1 displayed.');
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const motionSeq = { frame: 1 };
      const heroContent = heroContainer.querySelector('.hero-content');
      const badge = document.getElementById('heroBadge');
      const title = document.getElementById('heroTitle');
      const desc = document.getElementById('heroDesc');
      const cta = document.getElementById('heroCta');
      const stats = document.getElementById('heroStats');

      // Main ScrollTrigger Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          pin: heroContainer,
          anticipatePin: 1,
          onUpdate: function (self) {
            // Optional: Hide scroll prompt once user starts scrolling
            if (scrollPrompt) {
              if (self.progress > 0.04) {
                scrollPrompt.classList.add('scrolled-away');
              } else {
                scrollPrompt.classList.remove('scrolled-away');
              }
            }
          }
        }
      });

      // Frame scrubbing across total duration
      tl.to(motionSeq, {
        frame: totalFrames,
        ease: 'none',
        duration: 1,
        onUpdate: function () {
          renderFrame(Math.round(motionSeq.frame));
        }
      }, 0);

      // Phase 1: Badge, Title & Desc fade & translate gracefully
      if (badge && title && desc) {
        tl.to([badge, title, desc], {
          y: -35,
          opacity: 0,
          ease: 'power1.out',
          duration: 0.35,
          stagger: 0.04
        }, 0.15);
      }

      // Phase 2: CTA & Stats bar stay readable, then gently fade as camera explores kitchen
      if (cta && stats) {
        tl.to(cta, {
          y: -25,
          opacity: 0,
          ease: 'power1.out',
          duration: 0.3
        }, 0.35);

        tl.to(stats, {
          y: -20,
          opacity: 0,
          ease: 'power1.out',
          duration: 0.35
        }, 0.45);
      }

      // Refresh ScrollTrigger after DOM has completely settled
      ScrollTrigger.refresh();
    }
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScroll);
  } else {
    initHeroScroll();
  }
})();
