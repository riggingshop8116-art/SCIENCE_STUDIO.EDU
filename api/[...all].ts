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

    const matchedPath = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri']) as string | undefined;
    if (matchedPath && typeof matchedPath === 'string') {
      req.url = matchedPath;
    } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
      req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }

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
