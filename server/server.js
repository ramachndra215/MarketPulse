import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getWatchlistStocks,
  getSingleStock,
  getMostActiveStocks,
  getTrendingStocks,
  getCompanyFullDetails,
  getHistoricalChartData,
  getMarketNews,
  generateAiAnalysis,
  getAiStockSuggestions,
  MASTER_STOCKS,
  WATCHLIST,
} from './stockService.js';
import {
  registerUser,
  loginUser,
  getUserByToken,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserPortfolio,
  addPortfolioItem,
  removePortfolioItem,
} from './userService.js';

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

// Enable CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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

// Helper auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Provide fallback guest user so dashboard remains immediately usable
    req.user = { id: 'guest_user', name: 'MarketPulse Guest', email: 'guest@marketpulse.in' };
    return next();
  }
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const user = getUserByToken(token);
  if (!user) {
    req.user = { id: 'guest_user', name: 'MarketPulse Guest', email: 'guest@marketpulse.in' };
  } else {
    req.user = user;
  }
  next();
}

/**
 * Health check & configuration status
 */
app.get('/api/health', (req, res) => {
  const isKeyConfigured = Boolean(
    INDIAN_API_KEY &&
    INDIAN_API_KEY.trim() &&
    INDIAN_API_KEY !== 'your_indianapi_key_here'
  );

  res.json({
    status: 'ok',
    service: 'MarketPulse Indian Stock Market Intelligence Server',
    version: '2.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    configuration: {
      provider: isKeyConfigured ? 'IndianAPI (Official)' : 'Public Live Market Feed',
      apiBaseUrl: API_BASE_URL,
      isApiKeyConfigured: isKeyConfigured,
      fallbackEnabled: ENABLE_PUBLIC_FALLBACK,
    },
    supportedExchanges: ['ALL', 'NSE', 'BSE'],
    universeCount: MASTER_STOCKS.length,
  });
});

/**
 * Main stocks endpoint: returns watchlist / master stocks
 * Query params:
 *   - exchange: 'ALL' | 'NSE' | 'BSE' (default: 'ALL')
 *   - sector: string (e.g. 'Banking', 'Information Technology')
 *   - search: string (company name, symbol, or BSE scrip code)
 *   - refresh: 'true' | 'false'
 */
app.get('/api/stocks', async (req, res) => {
  try {
    const rawExchange = (req.query.exchange || 'ALL').toString().toUpperCase();

    if (rawExchange !== 'NSE' && rawExchange !== 'BSE' && rawExchange !== 'ALL') {
      return res.status(400).json({
        success: false,
        error: `Invalid exchange: '${rawExchange}'. Supported exchanges are 'ALL', 'NSE', and 'BSE'.`,
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
 * Most active stocks on BSE or NSE (Documented /BSE_most_active, /NSE_most_active)
 */
app.get('/api/stocks/most-active', async (req, res) => {
  try {
    const exchange = (req.query.exchange || 'NSE').toString().toUpperCase();
    const data = await getMostActiveStocks(exchange, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    res.json({
      success: true,
      exchange,
      total: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch most active stocks',
    });
  }
});

/**
 * Trending stocks: Top Gainers and Top Losers (/trending)
 */
app.get('/api/stocks/trending', async (req, res) => {
  try {
    const data = await getTrendingStocks({
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch trending stocks',
    });
  }
});

/**
 * Comprehensive company details (fundamentals, financials, balance sheet, shareholding)
 */
app.get('/api/stocks/details/:symbol', async (req, res) => {
  try {
    const symbolParam = req.params.symbol.trim();
    const details = await getCompanyFullDetails(symbolParam, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    res.json({
      success: true,
      data: details,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch company details',
    });
  }
});

/**
 * Historical stock chart data (/historical_data)
 * Periods: 1D, 5D, 1M, 6M, 1Y, 3Y, 5Y, MAX
 */
app.get('/api/stocks/history/:symbol', async (req, res) => {
  try {
    const symbolParam = req.params.symbol.trim();
    const period = (req.query.period || '1M').toString();
    const chartData = await getHistoricalChartData(symbolParam, period, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    res.json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch historical chart data',
    });
  }
});

/**
 * Live Market News (/news)
 */
app.get('/api/news', async (req, res) => {
  try {
    const news = await getMarketNews({
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    res.json({
      success: true,
      total: news.length,
      data: news,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch market news',
    });
  }
});

/**
 * AI Stock Intelligence Analysis
 */
app.get('/api/stocks/ai-analysis/:symbol', async (req, res) => {
  try {
    const symbolParam = req.params.symbol.trim();
    const details = await getCompanyFullDetails(symbolParam, {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
    });
    const analysis = generateAiAnalysis(details);
    res.json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate AI stock analysis',
    });
  }
});

/**
 * AI Stock Suggestions (Related peers in same sector)
 */
app.get('/api/stocks/ai-suggestions/:symbol', async (req, res) => {
  try {
    const symbolParam = req.params.symbol.toUpperCase().trim();
    const sectorParam = req.query.sector || '';
    const suggestions = getAiStockSuggestions(symbolParam, sectorParam);
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve AI suggestions',
    });
  }
});

/**
 * Multi-Stock Comparison
 */
app.get('/api/stocks/compare', async (req, res) => {
  try {
    const rawSymbols = (req.query.symbols || 'TCS,INFY').toString();
    const symbols = rawSymbols.split(',').map((s) => s.trim().toUpperCase());

    const detailsList = await Promise.allSettled(
      symbols.map((sym) =>
        getCompanyFullDetails(sym, {
          apiKey: INDIAN_API_KEY,
          baseUrl: API_BASE_URL,
        })
      )
    );

    const successful = detailsList
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    res.json({
      success: true,
      count: successful.length,
      data: successful,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to compare stocks',
    });
  }
});

/**
 * Single stock endpoint (Preserved for compatibility)
 */
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const symbolParam = (req.params.symbol || '').toUpperCase().trim();
    const rawExchange = (req.query.exchange || 'NSE').toString().toUpperCase();

    const matchedStock = MASTER_STOCKS.find(
      (s) =>
        s.symbol === symbolParam ||
        s.nseSymbol === symbolParam ||
        s.bseSymbol === symbolParam ||
        s.apiName.toUpperCase() === symbolParam
    );

    if (!matchedStock) {
      return res.status(404).json({
        success: false,
        error: `Stock '${symbolParam}' not found in universe.`,
      });
    }

    const data = await getSingleStock(matchedStock, rawExchange === 'BSE' ? 'BSE' : 'NSE', {
      apiKey: INDIAN_API_KEY,
      baseUrl: API_BASE_URL,
      enableFallback: ENABLE_PUBLIC_FALLBACK,
    });

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch single stock details',
    });
  }
});

// ============================================================================
// User Authentication & Portfolio Routes
// ============================================================================

app.post('/api/auth/register', (req, res) => {
  try {
    const user = registerUser(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const user = loginUser(req.body);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Watchlist endpoints
app.get('/api/user/watchlist', authMiddleware, (req, res) => {
  const watchlist = getUserWatchlist(req.user.id);
  res.json({ success: true, watchlist });
});

app.post('/api/user/watchlist', authMiddleware, (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });
  const updated = addToWatchlist(req.user.id, symbol);
  res.json({ success: true, watchlist: updated });
});

app.delete('/api/user/watchlist/:symbol', authMiddleware, (req, res) => {
  const updated = removeFromWatchlist(req.user.id, req.params.symbol);
  res.json({ success: true, watchlist: updated });
});

// Portfolio endpoints
app.get('/api/user/portfolio', authMiddleware, (req, res) => {
  const portfolio = getUserPortfolio(req.user.id);
  res.json({ success: true, portfolio });
});

app.post('/api/user/portfolio', authMiddleware, (req, res) => {
  const item = req.body;
  if (!item.symbol || !item.quantity || !item.buyPrice) {
    return res.status(400).json({ error: 'Symbol, quantity, and buyPrice are required.' });
  }
  const updated = addPortfolioItem(req.user.id, item);
  res.json({ success: true, portfolio: updated });
});

app.delete('/api/user/portfolio/:id', authMiddleware, (req, res) => {
  const updated = removePortfolioItem(req.user.id, req.params.id);
  res.json({ success: true, portfolio: updated });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    service: 'MarketPulse API Server',
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` MarketPulse Server running on http://localhost:${PORT}`);
  console.log(` API Base URL: ${API_BASE_URL}`);
  console.log(
    ` IndianAPI Key: ${
      INDIAN_API_KEY ? 'Configured (Active)' : 'Not set (Using Live Fallback)'
    }`
  );
  console.log(` Available Endpoints:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/stocks?exchange=ALL|NSE|BSE`);
  console.log(`   - GET /api/stocks/most-active?exchange=NSE|BSE`);
  console.log(`   - GET /api/stocks/trending`);
  console.log(`   - GET /api/stocks/details/:symbol`);
  console.log(`   - GET /api/stocks/history/:symbol?period=1m|6m|1yr|3yr|5yr|max`);
  console.log(`   - GET /api/stocks/ai-analysis/:symbol`);
  console.log(`   - GET /api/stocks/ai-suggestions/:symbol`);
  console.log(`   - GET /api/stocks/compare?symbols=...`);
  console.log(`   - GET /api/news`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET /api/user/profile`);
  console.log(`   - GET /api/user/watchlist`);
  console.log(`   - POST /api/user/watchlist`);
  console.log(`   - GET /api/user/portfolio`);
  console.log(`   - POST /api/user/portfolio`);
  console.log(`   - DELETE /api/user/portfolio/:id`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another running process.`);
    console.error(`👉 To free port ${PORT} in PowerShell, run:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
