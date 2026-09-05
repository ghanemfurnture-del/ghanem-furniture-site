/**
 * GHANEM FURNITURE
 * Universal Multilingual & Global Translation Engine (All Languages)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'site_lang';
  const DEFAULT_LANG = 'ar';

  // Supported Quick Switch Languages
  const NATIVE_LANGS = ['ar', 'en'];

  // Language Meta Registry
  const LANG_META = {
    'ar': { name: 'العربية', badge: 'AR', dir: 'rtl', flag: '🇪🇬' },
    'en': { name: 'English', badge: 'EN', dir: 'ltr', flag: '🇬🇧' },
    'fr': { name: 'Français', badge: 'FR', dir: 'ltr', flag: '🇫🇷' },
    'de': { name: 'Deutsch', badge: 'DE', dir: 'ltr', flag: '🇩🇪' },
    'it': { name: 'Italiano', badge: 'IT', dir: 'ltr', flag: '🇮🇹' },
    'es': { name: 'Español', badge: 'ES', dir: 'ltr', flag: '🇪🇸' },
    'ru': { name: 'Русский', badge: 'RU', dir: 'ltr', flag: '🇷🇺' },
    'tr': { name: 'Türkçe', badge: 'TR', dir: 'ltr', flag: '🇹🇷' },
    'zh-CN': { name: '中文', badge: 'ZH', dir: 'ltr', flag: '🇨🇳' }
  };

  const RTL_LANGS = ['ar', 'fa', 'ur', 'he'];

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  const translationsCache = {};
  let googleTranslateLoaded = false;

  // Resolve nested object path e.g. "home.hero_title"
  function getNestedValue(obj, keyPath) {
    if (!obj || !keyPath) return null;
    const keys = keyPath.split('.');
    let val = obj;
    for (let k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        return null;
      }
    }
    return val;
  }

  // Fetch local translation dictionary for native languages
  async function loadTranslations(lang) {
    if (!NATIVE_LANGS.includes(lang)) return null;
    if (translationsCache[lang]) return translationsCache[lang];

    try {
      const response = await fetch(`lang/${lang}.json?v=2.0`);
      if (!response.ok) throw new Error(`Failed to load lang/${lang}.json`);
      const data = await response.json();
      translationsCache[lang] = data;
      return data;
    } catch (err) {
      console.warn(`[i18n] Could not fetch lang/${lang}.json:`, err);
      return null;
    }
  }

  // Apply native translations to DOM elements
  function applyTranslations(dict, lang) {
    if (!dict) return;

    // 1. Text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = getNestedValue(dict, key);
      if (translation !== null && translation !== undefined) {
        el.textContent = translation;
      }
    });

    // 2. Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = getNestedValue(dict, key);
      if (translation !== null && translation !== undefined) {
        el.setAttribute('placeholder', translation);
      }
    });

    // 3. Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = getNestedValue(dict, key);
      if (translation !== null && translation !== undefined) {
        el.setAttribute('title', translation);
      }
    });

    // 4. Alt attributes
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const translation = getNestedValue(dict, key);
      if (translation !== null && translation !== undefined) {
        el.setAttribute('alt', translation);
      }
    });

    // 5. Update document dir and lang
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

    // 6. Update Switcher UI indicators
    updateSwitcherUI(lang);

    // 7. Dispatch event
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, dict } }));
  }

  // Set / Clear Cookie helper
  function setCookie(name, value, days = 30) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
    const host = window.location.hostname;
    if (host && host !== 'localhost') {
      document.cookie = name + '=' + (value || '') + expires + '; path=/; domain=' + host;
    }
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    const host = window.location.hostname;
    if (host && host !== 'localhost') {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + host;
    }
  }

  // Load Google Translate script on-demand
  function initGoogleTranslate() {
    if (googleTranslateLoaded) return;
    googleTranslateLoaded = true;

    // Create container if not present
    if (!document.getElementById('google_translate_element')) {
      const container = document.createElement('div');
      container.id = 'google_translate_element';
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    // Define Global Callback
    window.googleTranslateElementInit = function () {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'ar',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
      } catch (e) {
        console.warn('Google Translate Init error:', e);
      }
    };

    // Load External Script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  // Trigger Google Translate combo selector
  function triggerGoogleTranslateCombo(lang) {
    initGoogleTranslate();

    // Set cookie recognized by Google Translate
    setCookie('googtrans', `/ar/${lang}`);

    // Attempt to update select element if already present in DOM
    const trySelect = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        return true;
      }
      return false;
    };

    if (!trySelect()) {
      // Retry every 250ms up to 15 times while script loads
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (trySelect() || retries > 15) {
          clearInterval(interval);
        }
      }, 250);
    }
  }

  // Switch language function (Supports Arabic, English & ANY language in the world)
  async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const isRtl = RTL_LANGS.includes(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    if (lang === 'ar') {
      // 1. Reset to native Arabic
      deleteCookie('googtrans');
      const dict = await loadTranslations('ar');
      if (dict) applyTranslations(dict, 'ar');

      // Reset Google combo if active
      const select = document.querySelector('.goog-te-combo');
      if (select && select.value !== '') {
        select.value = '';
        select.dispatchEvent(new Event('change'));
      }
    } else if (lang === 'en') {
      // 2. Native English
      const dict = await loadTranslations('en');
      if (dict) applyTranslations(dict, 'en');
      deleteCookie('googtrans');
    } else {
      // 3. ANY Other World Language (French, German, Spanish, Italian, Russian, Turkish, etc.)
      triggerGoogleTranslateCombo(lang);
    }

    updateSwitcherUI(lang);
  }

  // Update switcher dropdown active states & display text
  function updateSwitcherUI(lang) {
    const meta = LANG_META[lang] || {
      name: lang.toUpperCase(),
      badge: lang.toUpperCase().substring(0, 2),
      dir: 'ltr',
      flag: '🌐'
    };

    document.querySelectorAll('.lang-switcher-current').forEach(label => {
      label.textContent = meta.name;
    });

    document.querySelectorAll('.lang-badge').forEach(badge => {
      badge.textContent = meta.badge;
    });

    document.querySelectorAll('.lang-option').forEach(option => {
      const optLang = option.getAttribute('data-lang');
      if (optLang === lang) {
        option.classList.add('active');
        option.setAttribute('aria-selected', 'true');
      } else {
        option.classList.remove('active');
        option.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Initialize interactive Switcher Dropdowns
  function initSwitcherDropdowns() {
    const switchers = document.querySelectorAll('.lang-switcher');

    switchers.forEach(switcher => {
      const toggleBtn = switcher.querySelector('.lang-switcher-btn');
      const dropdown = switcher.querySelector('.lang-dropdown');

      if (!toggleBtn || !dropdown) return;

      // Toggle Open
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = switcher.classList.contains('open');
        document.querySelectorAll('.lang-switcher.open').forEach(s => {
          if (s !== switcher) s.classList.remove('open');
        });
        switcher.classList.toggle('open', !isOpen);

        // Preload Google Translate script when user opens language menu
        initGoogleTranslate();
      });

      // Handle Option Clicks
      dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.lang-option');
        if (!option) return;
        e.stopPropagation();

        const targetLang = option.getAttribute('data-lang');
        if (targetLang) {
          setLanguage(targetLang);
        }
        switcher.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lang-switcher')) {
        document.querySelectorAll('.lang-switcher.open').forEach(s => s.classList.remove('open'));
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.lang-switcher.open').forEach(s => s.classList.remove('open'));
      }
    });
  }

  // Expose global API
  window.i18n = {
    setLanguage,
    getLanguage: () => currentLang,
    loadTranslations,
    initGoogleTranslate
  };
  window.setSiteLanguage = setLanguage;

  // Boot on DOM ready
  function boot() {
    initSwitcherDropdowns();

    if (currentLang && currentLang !== 'ar') {
      setLanguage(currentLang);
    } else {
      setLanguage('ar');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
