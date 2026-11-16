import axios from 'axios';

export const WATCHLIST = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    apiName: 'Reliance',
    nseSymbol: 'RELIANCE',
    bseSymbol: '500325',
    sector: 'Energy & Oil/Gas',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    apiName: 'TCS',
    nseSymbol: 'TCS',
    bseSymbol: '532540',
    sector: 'Information Technology',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    apiName: 'Infosys',
    nseSymbol: 'INFY',
    bseSymbol: '500209',
    sector: 'Information Technology',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    apiName: 'State Bank of India',
    nseSymbol: 'SBIN',
    bseSymbol: '500112',
    sector: 'Financial Services',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    apiName: 'HDFC Bank',
    nseSymbol: 'HDFCBANK',
    bseSymbol: '500180',
    sector: 'Financial Services',
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    apiName: 'ICICI Bank',
    nseSymbol: 'ICICIBANK',
    bseSymbol: '532174',
    sector: 'Financial Services',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    apiName: 'Larsen & Toubro',
    nseSymbol: 'LT',
    bseSymbol: '500510',
    sector: 'Capital Goods / Infrastructure',
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    apiName: 'ITC',
    nseSymbol: 'ITC',
    bseSymbol: '500875',
    sector: 'Consumer Goods (FMCG)',
  },
];

// In-memory cache to prevent excessive requests and comply with API limits
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Format numeric value to 2 decimal places safely
 */
function toNum(val, fallback = null) {
  if (val === undefined || val === null || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
  return isNaN(num) ? fallback : Math.round(num * 100) / 100;
}

/**
 * Fetch genuine stock data from IndianAPI (https://stock.indianapi.in)
 */
async function fetchFromIndianApi(stock, exchange, apiKey, baseUrl) {
  const url = `${baseUrl || 'https://stock.indianapi.in'}/stock`;
  const response = await axios.get(url, {
    params: { name: stock.apiName },
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json',
    },
    timeout: 15000,
  });

  const d = response.data;
  if (!d || d.error) {
    throw new Error(d?.error || `IndianAPI returned no data for ${stock.symbol}`);
  }

  // Parse exchange-specific current price
  let price = null;
  if (typeof d.currentPrice === 'object' && d.currentPrice !== null) {
    if (exchange === 'BSE') {
      price = toNum(d.currentPrice.BSE) || toNum(d.currentPrice.NSE);
    } else {
      price = toNum(d.currentPrice.NSE) || toNum(d.currentPrice.BSE);
    }
  } else {
    price = toNum(d.currentPrice) || toNum(d.price);
  }

  const percentChange = toNum(d.percentChange, 0);
  let priceChange = toNum(d.net_change || d.netChange || d.priceChange);

  // If priceChange is not given directly by API, compute from percentChange and current price
  if (priceChange === null && price !== null && percentChange !== 0) {
    const prevClose = price / (1 + percentChange / 100);
    priceChange = toNum(price - prevClose);
  } else if (priceChange === null) {
    priceChange = 0;
  }

  const yearHigh = toNum(d.yearHigh || d.high52Week);
  const yearLow = toNum(d.yearLow || d.low52Week);

  const movement = percentChange > 0 ? 'positive' : percentChange < 0 ? 'negative' : 'neutral';

  return {
    symbol: stock.symbol,
    companyName: d.companyName || stock.name,
    exchange: exchange.toUpperCase(),
    currency: '₹',
    price,
    priceChange,
    percentChange,
    movement,
    yearHigh,
    yearLow,
    sector: d.companyProfile?.sector || stock.sector,
    dataSource: 'IndianAPI (Official)',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch genuine real-time market quote from Public Financial API (NSE/BSE)
 * Provides genuine, non-fabricated market data when IndianAPI key is unconfigured.
 */
async function fetchFromLivePublicApi(stock, exchange) {
  const tickerSuffix = exchange === 'BSE' ? '.BO' : '.NS';
  const querySymbol = `${stock.symbol}${tickerSuffix}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?interval=1d&range=1d`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
    timeout: 15000,
  });

  const chart = response.data?.chart?.result?.[0];
  if (!chart || !chart.meta) {
    throw new Error(`Public feed returned no quote metadata for ${querySymbol}`);
  }

  const meta = chart.meta;
  const price = toNum(meta.regularMarketPrice);
  const prevClose = toNum(meta.chartPreviousClose);
  const percentChange = toNum(meta.regularMarketChangePercent, 0);
  let priceChange = toNum(meta.fulldayChange);
  if (priceChange === null && price !== null && prevClose !== null) {
    priceChange = toNum(price - prevClose);
  }

  const yearHigh = toNum(meta.fiftyTwoWeekHigh);
  const yearLow = toNum(meta.fiftyTwoWeekLow);
  const dayHigh = toNum(meta.regularMarketDayHigh);
  const dayLow = toNum(meta.regularMarketDayLow);

  const movement = percentChange > 0 ? 'positive' : percentChange < 0 ? 'negative' : 'neutral';

  return {
    symbol: stock.symbol,
    companyName: meta.longName || meta.shortName || stock.name,
    exchange: exchange.toUpperCase(),
    currency: '₹',
    price,
    priceChange: priceChange || 0,
    percentChange,
    movement,
    yearHigh,
    yearLow,
    dayHigh,
    dayLow,
    previousClose: prevClose,
    sector: stock.sector,
    dataSource: 'Public Live Market Feed',
    lastUpdated: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Fetch a single stock with provider fallback and caching
 */
export async function getSingleStock(stock, exchange, options = {}) {
  const { apiKey, baseUrl, enableFallback = true, skipCache = false } = options;
  const cacheKey = `${stock.symbol}_${exchange}`;

  if (!skipCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const hasApiKey = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_indianapi_key_here');

  let result = null;
  let lastError = null;

  if (hasApiKey) {
    try {
      result = await fetchFromIndianApi(stock, exchange, apiKey, baseUrl);
    } catch (err) {
      console.warn(`[StockService] IndianAPI error for ${stock.symbol}:`, err.message);
      lastError = err;
      if (!enableFallback) {
        throw err;
      }
    }
  }

  if (!result && enableFallback) {
    try {
      result = await fetchFromLivePublicApi(stock, exchange);
    } catch (err) {
      console.error(`[StockService] Live public feed error for ${stock.symbol}:`, err.message);
      throw lastError || err;
    }
  }

  if (!result) {
    throw new Error(
      `API key required: Please configure INDIAN_API_KEY in server/.env to fetch ${stock.symbol}`
    );
  }

  cache.set(cacheKey, { time: Date.now(), data: result });
  return result;
}

/**
 * Fetch all watchlist stocks with Promise.allSettled to ensure resilient batch fetching.
 * If one stock request fails, other successfully fetched stocks still display.
 */
export async function getWatchlistStocks(exchange = 'NSE', options = {}) {
  const currentExchange = exchange.toUpperCase() === 'BSE' ? 'BSE' : 'NSE';
  const { apiKey, baseUrl, enableFallback = true, skipCache = false } = options;
  const hasApiKey = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_indianapi_key_here');

  const fetchPromises = WATCHLIST.map((stock) =>
    getSingleStock(stock, currentExchange, { apiKey, baseUrl, enableFallback, skipCache })
  );

  const results = await Promise.allSettled(fetchPromises);

  const successfulStocks = [];
  const errors = [];

  results.forEach((res, index) => {
    const stockMeta = WATCHLIST[index];
    if (res.status === 'fulfilled') {
      successfulStocks.push(res.value);
    } else {
      errors.push({
        symbol: stockMeta.symbol,
        name: stockMeta.name,
        exchange: currentExchange,
        error: res.reason?.message || 'Failed to fetch stock information',
      });
    }
  });

  return {
    success: successfulStocks.length > 0,
    exchange: currentExchange,
    timestamp: new Date().toISOString(),
    provider: hasApiKey ? 'IndianAPI (Official)' : 'Public Live Market Feed',
    isKeyConfigured: hasApiKey,
    total: WATCHLIST.length,
    successfulCount: successfulStocks.length,
    failedCount: errors.length,
    data: successfulStocks,
    errors,
  };
}
