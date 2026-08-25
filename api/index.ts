import { app } from '../server.js';

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

    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
      req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
    }

    return app(req, res);
  } catch (err: any) {
    console.error("Vercel API Serverless Handler Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: err?.message || "সার্ভার প্রসেসিং করতে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" 
      });
    }
  }
}


