import app, { app as expressApp } from '../server.ts';

export default function handler(req: any, res: any) {
  return new Promise((resolve) => {
    try {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Auth-Token, x-bucket, x-filename, x-content-type'
      );

      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return resolve(true);
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
      let querySuffix = '';
      if (targetPath.includes('?')) {
        const parts = targetPath.split('?');
        targetPath = parts[0];
        querySuffix = '?' + parts.slice(1).join('&').replace(/route=[^&]*&?/g, '').replace(/&&+/g, '&').replace(/^&|&$/g, '');
        if (querySuffix === '?') querySuffix = '';
      }
      
      req.url = targetPath + querySuffix;

      // Vercel Serverless runtime already parses JSON/URL-encoded bodies.
      // Setting req._body = true prevents Express body-parser from hanging on consumed stream!
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
        } catch (_) {}
      } else if (Buffer.isBuffer(req.body)) {
        try {
          req.body = JSON.parse(req.body.toString('utf8'));
        } catch (_) {}
      }
      if (req.body !== undefined && req.body !== null) {
        req._body = true;
      }

      // Safety timeout: Never allow Vercel 10s invocation limit to produce an unhandled HTML 500/504 page
      const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
          try {
            res.status(504).json({ error: "অনুরোধের সময়সীমা অতিক্রম করেছে (Gateway Timeout)। অনুগ্রহ করে পুনরায় চেষ্টা করুন।" });
          } catch (_) {}
        }
        resolve(true);
      }, 8500);

      res.on('finish', () => {
        clearTimeout(timeoutId);
        resolve(true);
      });
      res.on('close', () => {
        clearTimeout(timeoutId);
        resolve(true);
      });

      const handlerApp = app || expressApp;
      handlerApp(req, res, () => {
        clearTimeout(timeoutId);
        if (!res.headersSent) {
          res.status(404).json({ error: `API endpoint পাওয়া যায়নি: ${req.method} ${targetPath}` });
        }
        resolve(true);
      });
    } catch (err: any) {
      console.error("Vercel API Serverless Handler Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: err?.message || "সার্ভার প্রসেসিং করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" 
        });
      }
      resolve(true);
    }
  });
}
