/**
 * GHANEM FURNITURE - Vercel Serverless Function: Cloudinary Signed Upload
 * 
 * Generates secure, short-lived signed parameters for direct browser-to-Cloudinary uploads.
 * This completely avoids Vercel's 4.5MB request body limit and leaves zero sensitive
 * API secrets exposed to the client.
 */

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  // CORS & Allowed Methods
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    // Current UNIX timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'ghanem-furniture/contact-uploads';
    const tags = 'contact_reference';

    // Cloudinary signature algorithm:
    // Sort parameters alphabetically, join with '=', join pairs with '&', append API secret, compute SHA1
    const paramsToSign = {
      folder: folder,
      tags: tags,
      timestamp: timestamp
    };

    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return res.status(200).json({
      success: true,
      cloudName: cloudName,
      apiKey: apiKey,
      timestamp: timestamp,
      folder: folder,
      tags: tags,
      signature: signature,
      maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
    });
  } catch (err) {
    console.error('[api/upload] Error generating upload signature:', err);
    return res.status(500).json({ error: 'Failed to generate upload signature' });
  }
};
