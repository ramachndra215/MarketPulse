import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWatchlistStocks, getSingleStock, WATCHLIST } from './stockService.js';

// Resolve directory paths in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || 'https://stock.indianapi.in';
const INDIAN_API_KEY = process.env.INDIAN_API_KEY || '';
const ENABLE_PUBLIC_FALLBACK = process.env.ENABLE_PUBLIC_FALLBACK !== 'false';

// Enable CORS for frontend Vite dev server and production origins
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

/**
 * Health check & configuration status endpoint
 */
app.get('/api/health', (req, res) => {
  const isKeyConfigured = Boolean(
    INDIAN_API_KEY &&
    INDIAN_API_KEY.trim() &&
    INDIAN_API_KEY !== 'your_indianapi_key_here'
  );

  res.json({
    status: 'ok',
    service: 'MarketPulse API Server',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    configuration: {
      provider: isKeyConfigured ? 'IndianAPI (Official)' : 'Public Live Market Feed',
      apiBaseUrl: API_BASE_URL,
      isApiKeyConfigured: isKeyConfigured,
      fallbackEnabled: ENABLE_PUBLIC_FALLBACK,
    },
    supportedExchanges: ['NSE', 'BSE'],
    watchlistCount: WATCHLIST.length,
  });
});

/**
 * Main stocks endpoint: returns watchlist stock prices for requested exchange
 * Query params:
 *   - exchange: 'NSE' | 'BSE' (default: 'NSE')
 *   - refresh: 'true' | 'false' (skip cache)
 */
app.get('/api/stocks', async (req, res) => {
  try {
    const rawExchange = (req.query.exchange || 'NSE').toString().toUpperCase();

    // Input validation
    if (rawExchange !== 'NSE' && rawExchange !== 'BSE') {
      return res.status(400).json({
        success: false,
        error: `Invalid exchange: '${rawExchange}'. Supported exchanges are 'NSE' and 'BSE'.`,
      });
    }

    const skipCache = req.query.refresh === 'true' || req.query.refresh === '1';

    const result = await getWatchlistStocks(rawExchange, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
      enableFallback: ENABLE_PUBLIC_FALLBACK,
      skipCache,
    });

    return res.json(result);
  } catch (error) {
    console.error('[API Error /api/stocks]:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching stock data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Single stock endpoint
 */
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const symbolParam = (req.params.symbol || '').toUpperCase().trim();
    const rawExchange = (req.query.exchange || 'NSE').toString().toUpperCase();

    if (rawExchange !== 'NSE' && rawExchange !== 'BSE') {
      return res.status(400).json({
        success: false,
        error: `Invalid exchange: '${rawExchange}'. Supported exchanges are 'NSE' and 'BSE'.`,
      });
    }

    const matchedStock = WATCHLIST.find(
      (s) => s.symbol === symbolParam || s.nseSymbol === symbolParam || s.apiName.toUpperCase() === symbolParam
    );

    if (!matchedStock) {
      return res.status(404).json({
        success: false,
        error: `Stock '${symbolParam}' not found in watchlist. Available: ${WATCHLIST.map((s) => s.symbol).join(', ')}`,
      });
    }

    const skipCache = req.query.refresh === 'true';

    const data = await getSingleStock(matchedStock, rawExchange, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
      enableFallback: ENABLE_PUBLIC_FALLBACK,
      skipCache,
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    console.error(`[API Error /api/stocks/${req.params.symbol}]:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch single stock details',
    });
  }
});

// Fallback 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['/api/stocks', '/api/stocks/:symbol', '/api/health'],
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MarketPulse Server running on http://localhost:${PORT}`);
  console.log(` API Base URL: ${API_BASE_URL}`);
  console.log(
    ` IndianAPI Key: ${
      INDIAN_API_KEY ? 'Configured (Active)' : 'Not set (Using Live Fallback)'
    }`
  );
  console.log(` Endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/health`);
  console.log(`   - GET http://localhost:${PORT}/api/stocks?exchange=NSE`);
  console.log(`   - GET http://localhost:${PORT}/api/stocks?exchange=BSE`);
  console.log(`====================================================`);
});
