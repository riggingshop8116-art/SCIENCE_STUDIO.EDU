import app, { app as expressApp } from '../server';

export default function handler(req: any, res: any) {
  try {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Auth-Token'
    );

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    let targetPath = req.url || '/api';
    const forwardedUri = (req.headers['x-forwarded-uri'] || req.headers['x-original-url']) as string | undefined;
    const matchedPath = req.headers['x-matched-path'] as string | undefined;

    if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri !== '/api' && forwardedUri !== '/') {
      targetPath = forwardedUri;
    } else if (matchedPath && typeof matchedPath === 'string' && matchedPath !== '/api' && matchedPath !== '/') {
      targetPath = matchedPath;
    }

    if (targetPath === '/api' || targetPath === '/') {
      const matchHeader = req.headers['x-now-route-matches'] as string | undefined;
      if (matchHeader && typeof matchHeader === 'string') {
        const match = matchHeader.match(/1=([^&]+)/);
        if (match && match[1]) {
          targetPath = '/api/' + decodeURIComponent(match[1]);
        }
      }
    }

    if (targetPath && !targetPath.startsWith('/api') && !targetPath.startsWith('/_')) {
      targetPath = '/api' + (targetPath.startsWith('/') ? '' : '/') + targetPath;
    }
    req.url = targetPath;

    const handlerApp = app || expressApp;
    return handlerApp(req, res);
  } catch (err: any) {
    console.error("Vercel API Catch-All Handler Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: err?.message || "সার্ভার প্রসেসিং করতে সাময়িক সমস্যা হয়েছে।" 
      });
    }
  }
}
