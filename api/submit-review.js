// Vercel Serverless Function: api/submit-review.js
// Handles customer review submissions and commits them to data/reviews-pending.json via GitHub REST API

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { name, rating, quote } = req.body || {};

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'الاسم مطلوب (حرفين على الأقل).' });
    }

    if (!quote || typeof quote !== 'string' || quote.trim().length < 4) {
      return res.status(400).json({ success: false, error: 'نص الرأي مطلوب (4 أحرف على الأقل).' });
    }

    const cleanName = name.trim().replace(/<[^>]*>?/gm, '').substring(0, 100);
    const cleanQuote = quote.trim().replace(/<[^>]*>?/gm, '').substring(0, 2000);
    const parsedRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    // Formatted date in Arabic (e.g. 13 سبتمبر 2026)
    const now = new Date();
    const arabicMonths = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const formattedDate = `${now.getDate()} ${arabicMonths[now.getMonth()]} ${now.getFullYear()}`;

    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!githubToken) {
      console.error('Missing GITHUB_TOKEN environment variable in Vercel settings.');
      return res.status(500).json({
        success: false,
        error: 'لم يتم العثور على GITHUB_TOKEN في إعدادات البيئة. يرجى إضافته في إعدادات Vercel.'
      });
    }

    const repoOwner = 'ghanemfurnture-del';
    const repoName = 'ghanem-furniture-site';
    const targetPath = 'data/reviews-pending.json';
    const targetBranch = 'main';

    const githubHeaders = {
      'Authorization': `Bearer ${githubToken.trim()}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Ghanem-Furniture-Reviews-API',
      'Content-Type': 'application/json'
    };

    // 2. Fetch existing reviews-pending.json from GitHub
    const getFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${targetPath}?ref=${targetBranch}`;
    let fileSha = null;
    let pendingReviews = [];

    const getRes = await fetch(getFileUrl, { headers: githubHeaders });

    if (getRes.ok) {
      const fileData = await getRes.json();
      fileSha = fileData.sha;
      if (fileData.content) {
        try {
          const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const parsed = JSON.parse(decoded);
          pendingReviews = Array.isArray(parsed.reviews) ? parsed.reviews : (Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.warn('Could not parse existing reviews-pending.json, starting fresh array.');
          pendingReviews = [];
        }
      }
    } else if (getRes.status !== 404) {
      const errText = await getRes.text();
      console.error('GitHub GET file error:', getRes.status, errText);
      return res.status(502).json({
        success: false,
        error: `خطأ في الاتصال بمستودع GitHub (${getRes.status}).`
      });
    }

    // 3. Construct new review item
    const newReview = {
      id: 'rev-pending-' + Date.now(),
      name: cleanName,
      rating: parsedRating,
      date: formattedDate,
      quote: cleanQuote,
      submitted_at: now.toISOString()
    };

    // Add new review at the beginning of pending list
    pendingReviews.unshift(newReview);

    const updatedFileContent = JSON.stringify({ reviews: pendingReviews }, null, 2) + '\n';
    const base64Content = Buffer.from(updatedFileContent, 'utf-8').toString('base64');

    // 4. Commit updated file to GitHub repo
    const putFileUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${targetPath}`;
    const commitPayload = {
      message: `feat(reviews): add pending review from ${cleanName}`,
      content: base64Content,
      branch: targetBranch
    };

    if (fileSha) {
      commitPayload.sha = fileSha;
    }

    const putRes = await fetch(putFileUrl, {
      method: 'PUT',
      headers: githubHeaders,
      body: JSON.stringify(commitPayload)
    });

    if (!putRes.ok) {
      const putErr = await putRes.text();
      console.error('GitHub PUT file error:', putRes.status, putErr);
      return res.status(502).json({
        success: false,
        error: `فشل تسجيل الرأي على GitHub (${putRes.status}). تأكد من صحة صلاحيات GITHUB_TOKEN.`
      });
    }

    const commitResult = await putRes.json();

    return res.status(200).json({
      success: true,
      message: 'تم استلام الرأي وحفظه للمراجعة بنجاح.',
      review: newReview,
      commitSha: commitResult?.commit?.sha || null
    });

  } catch (error) {
    console.error('Unhandled submit-review error:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي أثناء معالجة التقييم. يرجى المحاولة لاحقاً.'
    });
  }
};
