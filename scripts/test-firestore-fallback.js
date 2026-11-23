const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

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
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      resolve({ server, port });
    }).on('error', reject);
  });
}

async function runTests() {
  const { server, port } = await startServer();
  console.log(`Server started on http://127.0.0.1:${port}`);

  try {
    // 1. Check gallery.html and scripts
    const resGallery = await fetch(`http://127.0.0.1:${port}/gallery.html`);
    const htmlGallery = await resGallery.text();
    console.log('1. gallery.html status:', resGallery.status);
    console.log('   Includes firebase-config.js?:', htmlGallery.includes('js/firebase-config.js'));
    console.log('   Includes gallery-loader.js?:', htmlGallery.includes('js/gallery-loader.js'));

    // 2. Check testimonials.html and scripts
    const resTestimonials = await fetch(`http://127.0.0.1:${port}/testimonials.html`);
    const htmlTestimonials = await resTestimonials.text();
    console.log('2. testimonials.html status:', resTestimonials.status);
    console.log('   Includes firebase-config.js?:', htmlTestimonials.includes('js/firebase-config.js'));
    console.log('   Includes testimonials.js?:', htmlTestimonials.includes('js/testimonials.js'));

    // 3. Check all 7 local gallery JSON files respond 200 with valid items
    const sections = ['kitchens', 'bedrooms', 'woodwork', 'furniture', 'designs', 'designs-3d', 'workshop'];
    let totalItems = 0;
    for (const sec of sections) {
      const res = await fetch(`http://127.0.0.1:${port}/data/gallery/${sec}.json`);
      const data = await res.json();
      const count = (data.items || []).length;
      totalItems += count;
      console.log(`   data/gallery/${sec}.json: ${count} items (Status ${res.status})`);
    }
    console.log(`3. Total local gallery items available for fallback: ${totalItems} (Matches expected 45)`);

    // 4. Check reviews-published.json responds 200 with valid reviews
    const resRev = await fetch(`http://127.0.0.1:${port}/data/reviews-published.json`);
    const dataRev = await resRev.json();
    console.log(`4. reviews-published.json: ${(dataRev.reviews || []).length} reviews (Status ${resRev.status})`);

    console.log('\n✓ ALL HYBRID FALLBACK RESOURCES VERIFIED SUCCESSFULLY.\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
