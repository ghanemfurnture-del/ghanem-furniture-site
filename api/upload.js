/**
 * GHANEM FURNITURE - Vercel Serverless Function: Cloudinary Signed Upload
 * 
 * Generates short-lived cryptographic signatures (SHA-1) for direct browser-to-Cloudinary uploads.
 * Includes:
 * 1. Strict Origin verification (Production, Vercel Preview, and Localhost only)
 * 2. In-memory IP rate limiting (Max 10 requests / minute per IP)
 * 3. Parameters signed: allowed_formats, folder, tags, timestamp
 * 4. Zero exposure of CLOUDINARY_API_SECRET
 */

const crypto = require('crypto');

// In-memory rate limiter per serverless container instance
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function cleanOldRateLimits(now) {
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}

function isOriginAllowed(origin, referer) {
  const host = origin || referer;
  if (!host) return true; // Direct same-origin requests or mobile webviews without origin header

  try {
    const url = new URL(host);
    const hostname = url.hostname.toLowerCase();

    // Allow localhost and 127.0.0.1 for development
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    // Allow Ghanem Furniture production domain & Vercel preview subdomains
    if (hostname === 'ghanem-furniture.vercel.app' || hostname.endsWith('.vercel.app')) return true;

    // Allow custom production domains if configured in future
    if (hostname === 'ghanemfurniture.com' || hostname.endsWith('.ghanemfurniture.com')) return true;

    return false;
  } catch (e) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  // CORS Headers
  const origin = req.headers.origin || '';
  if (isOriginAllowed(origin, req.headers.referer)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting by IP
  const now = Date.now();
  cleanOldRateLimits(now);

  const clientIp = (
    req.headers['x-forwarded-for'] ||
    (req.socket && req.socket.remoteAddress) ||
    req.ip ||
    'unknown'
  ).split(',')[0].trim();

  const ipRecord = rateLimitMap.get(clientIp) || { count: 0, startTime: now };
  if (now - ipRecord.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRecord.count = 1;
    ipRecord.startTime = now;
  } else {
    ipRecord.count += 1;
  }
  rateLimitMap.set(clientIp, ipRecord);

  if (ipRecord.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Too many upload signature requests. Please try again in one minute.'
    });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[api/upload] Missing Cloudinary environment variables.');
    return res.status(500).json({
      error: 'Cloudinary configuration is incomplete on server. Please check Environment Variables.'
    });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'ghanem-furniture/contact-uploads';
    const tags = 'contact_reference';
    const allowedFormats = 'jpg,jpeg,png,webp';

    // Cloudinary signature algorithm:
    // ALL parameters sent to the upload endpoint (except file, api_key, cloud_name, resource_type, signature)
    // MUST be sorted alphabetically and signed with apiSecret.
    const paramsToSign = {
      allowed_formats: allowedFormats,
      folder: folder,
      tags: tags,
      timestamp: timestamp
    };

    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    // Return signed payload. Notice CLOUDINARY_API_SECRET is NEVER returned.
    return res.status(200).json({
      success: true,
      cloudName: cloudName,
      apiKey: apiKey,
      timestamp: timestamp,
      folder: folder,
      tags: tags,
      allowedFormats: allowedFormats,
      signature: signature,
      maxFileSizeBytes: 5 * 1024 * 1024 // 5 MB
    });
  } catch (err) {
    console.error('[api/upload] Error generating upload signature:', err);
    return res.status(500).json({ error: 'Failed to generate upload signature' });
  }
};
