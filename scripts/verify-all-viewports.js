const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\Techno Shop\\.gemini\\antigravity\\brain\\6833f57d-6644-409d-8284-808701a13ae1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let currentPort = 5050;

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);

      if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(currentPort, '127.0.0.1', () => {
      const boundPort = server.address().port;
      currentPort = boundPort;
      console.log(`Server listening at http://127.0.0.1:${currentPort}`);
      resolve(server);
    }).on('error', (err) => {
      if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        currentPort = 0; // dynamic port
        server.listen(0, '127.0.0.1', () => {
          currentPort = server.address().port;
          console.log(`Server listening at http://127.0.0.1:${currentPort}`);
          resolve(server);
        });
      } else {
        reject(err);
      }
    });
  });
}

async function verify() {
  const server = await startServer();
  const userDataDir = path.join(ROOT_DIR, 'node_modules', '.test-chrome-profile-' + Date.now());

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    userDataDir: userDataDir,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  const viewports = [
    { name: '1366x768', width: 1366, height: 768, isMobile: false, scrollAmount: 500 },
    { name: '1536x864', width: 1536, height: 864, isMobile: false, scrollAmount: 500 },
    { name: '1920x1080', width: 1920, height: 1080, isMobile: false, scrollAmount: 600 },
    { name: '390x844', width: 390, height: 844, isMobile: true, scrollAmount: 350 }
  ];

  const results = {};

  try {
    for (const vp of viewports) {
      console.log(`\n=== Testing Viewport ${vp.name} ===`);
      const page = await browser.newPage();
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        isMobile: vp.isMobile
      });

      await page.goto(`http://127.0.0.1:${currentPort}/index.html`, { waitUntil: 'networkidle0', timeout: 15000 });
      // Wait an extra moment for GSAP and layout to settle
      await new Promise(r => setTimeout(r, 600));

      // Inspect elements
      const inspection = await page.evaluate(() => {
        const header = document.querySelector('.site-header');
        const topBar = document.querySelector('.top-bar');
        const badge = document.getElementById('heroBadge');
        const title = document.getElementById('heroTitle');
        const desc = document.getElementById('heroDesc');
        const cta = document.getElementById('heroCta');
        const stats = document.getElementById('heroStats');
        const prompt = document.getElementById('heroScrollPrompt');

        function getInfo(el) {
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight
          };
        }

        // Title line count calculation
        let titleLineCount = 0;
        if (title) {
          const lh = parseFloat(window.getComputedStyle(title).lineHeight) || 28;
          titleLineCount = Math.round(title.getBoundingClientRect().height / lh);
        }

        return {
          windowHeight: window.innerHeight,
          windowWidth: window.innerWidth,
          topBar: getInfo(topBar),
          header: getInfo(header),
          badge: getInfo(badge),
          title: Object.assign({}, getInfo(title), { lineCount: titleLineCount, text: title ? title.innerText : '' }),
          desc: getInfo(desc),
          cta: getInfo(cta),
          stats: getInfo(stats),
          prompt: getInfo(prompt)
        };
      });

      console.log('Inspection:', JSON.stringify(inspection, null, 2));

      // Initial screenshot
      const initialPicPath = path.join(ARTIFACT_DIR, `hero-${vp.name}.png`);
      await page.screenshot({ path: initialPicPath, fullPage: false });
      console.log(`Saved screenshot: ${initialPicPath}`);

      // Scroll test if applicable
      let scrolledPicPath = null;
      if (vp.name === '1366x768' || vp.name === '390x844') {
        await page.evaluate((scroll) => {
          window.scrollBy({ top: scroll, behavior: 'instant' });
        }, vp.scrollAmount);
        await new Promise(r => setTimeout(r, 400));
        scrolledPicPath = path.join(ARTIFACT_DIR, `hero-${vp.name}-scrolled.png`);
        await page.screenshot({ path: scrolledPicPath, fullPage: false });
        console.log(`Saved scrolled screenshot: ${scrolledPicPath}`);
      }

      results[vp.name] = {
        inspection,
        initialPic: initialPicPath,
        scrolledPic: scrolledPicPath
      };

      await page.close();
    }
  } finally {
    await browser.close();
    if (server) {
      server.close();
    }
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }

  console.log('\n=== ALL VIEWPORT TESTS COMPLETE ===');
}

verify().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
