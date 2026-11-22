const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_URL = process.argv[2] || 'http://localhost:8080/';
const SCREENSHOT_PATH = process.argv[3] || path.resolve('C:\\Users\\Techno Shop\\.gemini\\antigravity\\brain\\6833f57d-6644-409d-8284-808701a13ae1\\hero-before.png');

(async () => {
  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);
  console.log(`Target URL: ${TARGET_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1280,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    consoleLogs.push({ type: 'pageerror', text: err.toString() });
  });

  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), error: req.failure()?.errorText });
  });

  console.log('Navigating to target...');
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (err) {
    console.warn('Navigation warning/timeout:', err.message);
  }

  // Wait extra 1 second for JS to settle
  await new Promise(r => setTimeout(r, 1000));

  // Inspect DOM and computed styles
  const inspection = await page.evaluate(() => {
    function getInfo(selector) {
      const el = document.querySelector(selector);
      if (!el) return { found: false };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        found: true,
        tag: el.tagName,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        style: {
          display: style.display,
          position: style.position,
          zIndex: style.zIndex,
          opacity: style.opacity,
          visibility: style.visibility,
          top: style.top,
          background: style.background?.substring(0, 80)
        }
      };
    }

    return {
      topBar: getInfo('.top-bar'),
      siteHeader: getInfo('.site-header'),
      heroSection: getInfo('.hero-motion-section'),
      heroContainer: getInfo('#heroPinnedContainer'),
      pinSpacer: getInfo('.pin-spacer'),
      canvas: getInfo('#heroCanvas'),
      fallbackPic: getInfo('#heroFallbackPicture'),
      fallbackImg: getInfo('#heroFallbackImg'),
      overlay: getInfo('.hero-gradient-overlay'),
      heroContent: getInfo('.hero-content'),
      isGsapLoaded: typeof window.gsap !== 'undefined',
      isScrollTriggerLoaded: typeof window.ScrollTrigger !== 'undefined'
    };
  });

  // Save screenshot
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
  console.log(`Screenshot saved to: ${SCREENSHOT_PATH}`);

  console.log('\n--- CONSOLE LOGS ---');
  consoleLogs.forEach(l => console.log(`[${l.type}] ${l.text}`));

  console.log('\n--- NETWORK FAILURES ---');
  if (networkErrors.length === 0) console.log('None (all requests succeeded)');
  networkErrors.forEach(e => console.log(`FAILED: ${e.url} - ${e.error}`));

  console.log('\n--- DOM & COMPUTED STYLES INSPECTION ---');
  console.log(JSON.stringify(inspection, null, 2));

  await browser.close();
})();
