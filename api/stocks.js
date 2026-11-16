import { getWatchlistStocks } from '../server/stockService.js';

/**
 * Vercel Serverless Function handler for /api/stocks
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawExchange = (req.query.exchange || 'NSE').toString().toUpperCase();

    if (rawExchange !== 'NSE' && rawExchange !== 'BSE') {
      return res.status(400).json({
        success: false,
        error: `Invalid exchange: '${rawExchange}'. Supported exchanges are 'NSE' and 'BSE'.`,
      });
    }

    const skipCache = req.query.refresh === 'true' || req.query.refresh === '1';

    const result = await getWatchlistStocks(rawExchange, {
      apiKey: process.env.INDIAN_API_KEY || '',
      baseUrl: process.env.API_BASE_URL || 'https://stock.indianapi.in',
      enableFallback: process.env.ENABLE_PUBLIC_FALLBACK !== 'false',
      skipCache,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[Vercel Serverless /api/stocks Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching stock data',
      timestamp: new Date().toISOString(),
    });
  }
}
