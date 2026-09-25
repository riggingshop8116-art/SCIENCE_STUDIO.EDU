import app, { app as expressApp } from '../server';

export default function handler(req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Auth-Token, x-bucket, x-filename, x-content-type'
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    let targetPath = '';

    // 1. Captured rewrite route from vercel.json (destination: "/api?route=$1")
    if (req.query && req.query.route) {
      const r = Array.isArray(req.query.route) ? req.query.route.join('/') : String(req.query.route);
      targetPath = '/api/' + r.replace(/^\/+/, '');
    } else if (req.query && req.query.path) {
      const p = Array.isArray(req.query.path) ? req.query.path.join('/') : String(req.query.path);
      targetPath = '/api/' + p.replace(/^\/+/, '');
    } else if (req.query && req.query.all) {
      const a = Array.isArray(req.query.all) ? req.query.all.join('/') : String(req.query.all);
      targetPath = '/api/' + a.replace(/^\/+/, '');
    }

    // 2. Fallback to forwarded URI headers
    if (!targetPath) {
      const forwardedUri = (req.headers['x-forwarded-uri'] || req.headers['x-original-url']) as string | undefined;
      const matchedPath = req.headers['x-matched-path'] as string | undefined;

      if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri !== '/api' && forwardedUri !== '/') {
        targetPath = forwardedUri;
      } else if (matchedPath && typeof matchedPath === 'string' && matchedPath !== '/api' && matchedPath !== '/') {
        targetPath = matchedPath;
      }
    }

    // 3. Fallback to raw req.url
    if (!targetPath && req.url && req.url !== '/' && req.url !== '/api') {
      targetPath = req.url;
    }

    // 4. Fallback to regex route match header
    if (!targetPath || targetPath === '/' || targetPath === '/api') {
      const matchHeader = req.headers['x-now-route-matches'] as string | undefined;
      if (matchHeader && typeof matchHeader === 'string') {
        const match = matchHeader.match(/1=([^&]+)/);
        if (match && match[1]) {
          targetPath = '/api/' + decodeURIComponent(match[1]);
        }
      }
    }

    if (!targetPath || targetPath === '/' || targetPath === '/api') {
      targetPath = '/api';
    }

    if (!targetPath.startsWith('/api') && !targetPath.startsWith('/_')) {
      targetPath = '/api' + (targetPath.startsWith('/') ? '' : '/') + targetPath;
    }
    
    // Strip trailing query parameters from path if any were appended to URL
    if (targetPath.includes('?route=')) {
      targetPath = targetPath.split('?')[0];
    }
    
    req.url = targetPath;

    const handlerApp = app || expressApp;
    return handlerApp(req, res);
  } catch (err: any) {
    console.error("Vercel API Serverless Handler Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: err?.message || "সার্ভার প্রসেসিং করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" 
      });
    }
  }
}
