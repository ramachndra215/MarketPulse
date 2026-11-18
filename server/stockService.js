import axios from 'axios';

/**
 * Comprehensive Master Stock Universe of Indian Listed Blue-Chips
 * Spans premier companies with verified NSE Symbols and BSE Scrip Codes across 10 sectors.
 */
export const MASTER_STOCKS = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    apiName: 'Reliance',
    nseSymbol: 'RELIANCE',
    bseSymbol: '500325',
    sector: 'Energy',
    industry: 'Oil & Gas Operations',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    apiName: 'TCS',
    nseSymbol: 'TCS',
    bseSymbol: '532540',
    sector: 'Information Technology',
    industry: 'IT Consulting & Services',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    apiName: 'Infosys',
    nseSymbol: 'INFY',
    bseSymbol: '500209',
    sector: 'Information Technology',
    industry: 'IT Consulting & Services',
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    apiName: 'Tata Motors',
    nseSymbol: 'TATAMOTORS',
    bseSymbol: '544569',
    sector: 'Automobile',
    industry: 'Auto & Truck Manufacturers',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    apiName: 'State Bank of India',
    nseSymbol: 'SBIN',
    bseSymbol: '500112',
    sector: 'Banking',
    industry: 'Public Sector Banking',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    apiName: 'HDFC Bank',
    nseSymbol: 'HDFCBANK',
    bseSymbol: '500180',
    sector: 'Banking',
    industry: 'Private Sector Banking',
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    apiName: 'ICICI Bank',
    nseSymbol: 'ICICIBANK',
    bseSymbol: '532174',
    sector: 'Banking',
    industry: 'Private Sector Banking',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    apiName: 'Larsen & Toubro',
    nseSymbol: 'LT',
    bseSymbol: '500510',
    sector: 'Infrastructure',
    industry: 'Engineering & Construction',
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    apiName: 'ITC',
    nseSymbol: 'ITC',
    bseSymbol: '500875',
    sector: 'Consumer Goods',
    industry: 'Tobacco & FMCG Conglomerate',
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    apiName: 'Wipro',
    nseSymbol: 'WIPRO',
    bseSymbol: '507685',
    sector: 'Information Technology',
    industry: 'IT Consulting & Services',
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    apiName: 'Bharti Airtel',
    nseSymbol: 'BHARTIARTL',
    bseSymbol: '532454',
    sector: 'Telecommunications',
    industry: 'Wireless Telecommunications',
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    apiName: 'Maruti Suzuki',
    nseSymbol: 'MARUTI',
    bseSymbol: '532500',
    sector: 'Automobile',
    industry: 'Passenger Vehicles',
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Limited',
    apiName: 'Bajaj Finance',
    nseSymbol: 'BAJFINANCE',
    bseSymbol: '500034',
    sector: 'Financial Services',
    industry: 'Consumer Lending & NBFC',
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    apiName: 'Tata Steel',
    nseSymbol: 'TATASTEEL',
    bseSymbol: '500470',
    sector: 'Metals & Mining',
    industry: 'Steel Production',
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd',
    apiName: 'Sun Pharma',
    nseSymbol: 'SUNPHARMA',
    bseSymbol: '524715',
    sector: 'Healthcare',
    industry: 'Pharmaceuticals',
  },
  {
    symbol: 'M&M',
    name: 'Mahindra & Mahindra Limited',
    apiName: 'Mahindra & Mahindra',
    nseSymbol: 'M&M',
    bseSymbol: '500520',
    sector: 'Automobile',
    industry: 'Automotive & Farm Equipment',
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Limited',
    apiName: 'Kotak Mahindra Bank',
    nseSymbol: 'KOTAKBANK',
    bseSymbol: '500247',
    sector: 'Banking',
    industry: 'Private Sector Banking',
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Limited',
    apiName: 'Axis Bank',
    nseSymbol: 'AXISBANK',
    bseSymbol: '532215',
    sector: 'Banking',
    industry: 'Private Sector Banking',
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Limited',
    apiName: 'Asian Paints',
    nseSymbol: 'ASIANPAINT',
    bseSymbol: '500820',
    sector: 'Consumer Goods',
    industry: 'Paints & Chemical Coatings',
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Limited',
    apiName: 'HCL Technologies',
    nseSymbol: 'HCLTECH',
    bseSymbol: '532281',
    sector: 'Information Technology',
    industry: 'IT Services & Software',
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Limited',
    apiName: 'NTPC',
    nseSymbol: 'NTPC',
    bseSymbol: '532555',
    sector: 'Energy',
    industry: 'Electric Utilities & Power Generation',
  },
  {
    symbol: 'ONGC',
    name: 'Oil and Natural Gas Corporation Ltd',
    apiName: 'ONGC',
    nseSymbol: 'ONGC',
    bseSymbol: '500312',
    sector: 'Energy',
    industry: 'Oil & Gas Exploration',
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation of India Ltd',
    apiName: 'Power Grid',
    nseSymbol: 'POWERGRID',
    bseSymbol: '532898',
    sector: 'Energy',
    industry: 'Power Transmission',
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Limited',
    apiName: 'Titan',
    nseSymbol: 'TITAN',
    bseSymbol: '500114',
    sector: 'Consumer Goods',
    industry: 'Jewelry & Watches',
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Limited',
    apiName: 'UltraTech Cement',
    nseSymbol: 'ULTRACEMCO',
    bseSymbol: '532538',
    sector: 'Infrastructure',
    industry: 'Building Materials & Cement',
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Limited',
    apiName: 'Adani Enterprises',
    nseSymbol: 'ADANIENT',
    bseSymbol: '512599',
    sector: 'Infrastructure',
    industry: 'Diversified Infrastructure',
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Limited',
    apiName: 'Coal India',
    nseSymbol: 'COALINDIA',
    bseSymbol: '533278',
    sector: 'Energy',
    industry: 'Coal Mining',
  },
];

// Retain alias for existing imports
export const WATCHLIST = MASTER_STOCKS;

// In-memory cache to respect API rate limits and keep frontend snappy
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Format numeric value safely
 */
export function toNum(val, fallback = null) {
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

  // Parse exchange-specific price
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
    bseSymbol: d.companyProfile?.exchangeCodeBse || stock.bseSymbol,
    nseSymbol: d.companyProfile?.exchangeCodeNse || stock.nseSymbol,
    currency: '₹',
    price,
    priceChange,
    percentChange,
    movement,
    yearHigh,
    yearLow,
    sector: d.companyProfile?.sector || stock.sector,
    industry: d.industry || stock.industry,
    dataSource: 'IndianAPI (Official)',
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Live market public feed fallback (Yahoo Finance API for Indian quotes)
 */
async function fetchFromLivePublicApi(stock, exchange) {
  const tickerSuffix = exchange === 'BSE' ? '.BO' : '.NS';
  const querySymbol = `${stock.symbol}${tickerSuffix}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?interval=1d&range=1d`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
  const volume = toNum(meta.regularMarketVolume);
  const movement = percentChange > 0 ? 'positive' : percentChange < 0 ? 'negative' : 'neutral';

  return {
    symbol: stock.symbol,
    companyName: meta.longName || meta.shortName || stock.name,
    exchange: exchange.toUpperCase(),
    bseSymbol: stock.bseSymbol,
    nseSymbol: stock.nseSymbol,
    currency: '₹',
    price,
    priceChange: priceChange || 0,
    percentChange,
    movement,
    yearHigh,
    yearLow,
    dayHigh,
    dayLow,
    volume,
    previousClose: prevClose,
    sector: stock.sector,
    industry: stock.industry,
    dataSource: 'Public Live Market Feed',
    lastUpdated: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * Fetch a single stock with provider fallback and caching
 */
export async function getSingleStock(stock, exchange = 'NSE', options = {}) {
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
      lastError = err;
      if (!enableFallback) throw err;
    }
  }

  if (!result && enableFallback) {
    try {
      result = await fetchFromLivePublicApi(stock, exchange);
    } catch (err) {
      throw lastError || err;
    }
  }

  if (!result) {
    throw new Error(`API key required to fetch ${stock.symbol}`);
  }

  cache.set(cacheKey, { time: Date.now(), data: result });
  return result;
}

/**
 * Fetch documented /BSE_most_active or /NSE_most_active directly from IndianAPI
 */
export async function getMostActiveStocks(exchange = 'NSE', options = {}) {
  const { apiKey, baseUrl } = options;
  const isBse = exchange.toUpperCase() === 'BSE';
  const endpoint = isBse ? '/BSE_most_active' : '/NSE_most_active';
  const cacheKey = `most_active_${exchange}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `${baseUrl || 'https://stock.indianapi.in'}${endpoint}`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey },
    timeout: 10000,
  });

  const rawList = Array.isArray(response.data) ? response.data : [];

  const normalized = rawList.map((item) => {
    const rawTicker = item.ticker || '';
    const cleanSymbol = rawTicker.replace(/\.(BO|NS)$/i, '');
    const price = toNum(item.price);
    const percentChange = toNum(item.percent_change, 0);
    const priceChange = toNum(item.net_change, 0);
    const yearHigh = toNum(item['52_week_high']);
    const yearLow = toNum(item['52_week_low']);
    const volume = toNum(item.volume);
    const movement = percentChange > 0 ? 'positive' : percentChange < 0 ? 'negative' : 'neutral';

    return {
      symbol: cleanSymbol,
      companyName: item.company || cleanSymbol,
      exchange: isBse ? 'BSE' : 'NSE',
      ticker: item.ticker,
      price,
      priceChange,
      percentChange,
      movement,
      dayHigh: toNum(item.high),
      dayLow: toNum(item.low),
      open: toNum(item.open),
      close: toNum(item.close),
      yearHigh,
      yearLow,
      volume,
      overallRating: item.overall_rating || 'Neutral',
      shortTermTrend: item.short_term_trend || 'Neutral',
      longTermTrend: item.long_term_trend || 'Neutral',
      currency: '₹',
      dataSource: `IndianAPI (${isBse ? 'BSE' : 'NSE'} Most Active)`,
      lastUpdated: new Date().toISOString(),
    };
  });

  cache.set(cacheKey, { time: Date.now(), data: normalized });
  return normalized;
}

/**
 * Fetch trending top gainers and losers from IndianAPI /trending
 */
export async function getTrendingStocks(options = {}) {
  const { apiKey, baseUrl } = options;
  const cacheKey = 'trending_stocks';

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `${baseUrl || 'https://stock.indianapi.in'}/trending`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey },
    timeout: 10000,
  });

  const trending = response.data?.trending_stocks || {};

  const mapItem = (item) => ({
    symbol: (item.ric || item.ticker_id || '').replace(/\.(BO|NS)$/i, ''),
    companyName: item.company_name,
    exchange: item.exchange_type || 'NSE',
    price: toNum(item.price),
    percentChange: toNum(item.percent_change, 0),
    priceChange: toNum(item.net_change, 0),
    yearHigh: toNum(item.year_high),
    yearLow: toNum(item.year_low),
    dayHigh: toNum(item.high),
    dayLow: toNum(item.low),
    volume: toNum(item.volume),
    overallRating: item.overall_rating || 'Bullish',
    currency: '₹',
  });

  const result = {
    topGainers: (trending.top_gainers || []).map(mapItem),
    topLosers: (trending.top_losers || []).map(mapItem),
  };

  cache.set(cacheKey, { time: Date.now(), data: result });
  return result;
}

/**
 * Fetch detailed fundamentals, reports, and financials for a single company
 */
export async function getCompanyFullDetails(symbolOrName, options = {}) {
  const { apiKey, baseUrl } = options;
  const matched = MASTER_STOCKS.find(
    (s) =>
      s.symbol.toUpperCase() === symbolOrName.toUpperCase() ||
      s.nseSymbol.toUpperCase() === symbolOrName.toUpperCase() ||
      s.bseSymbol === symbolOrName ||
      s.name.toLowerCase().includes(symbolOrName.toLowerCase()) ||
      s.apiName.toLowerCase() === symbolOrName.toLowerCase()
  );

  const queryName = matched ? matched.apiName : symbolOrName;
  const cacheKey = `details_${queryName}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `${baseUrl || 'https://stock.indianapi.in'}/stock?name=${encodeURIComponent(queryName)}`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey },
    timeout: 15000,
  });

  const d = response.data;
  if (!d || d.error) {
    throw new Error(d?.error || `Company details not found for ${symbolOrName}`);
  }

  // Extract financial statements
  const rawFinancials = Array.isArray(d.financials) ? d.financials : [];
  const annualReports = rawFinancials.filter((f) => f.Type === 'Annual');
  const interimReports = rawFinancials.filter((f) => f.Type === 'Interim');

  // Key valuation metrics
  const keyMetrics = d.keyMetrics || {};
  const ratios = keyMetrics.ratios || [];
  const mgmt = keyMetrics.mgmtEffectiveness || [];
  const priceVolume = keyMetrics.priceandVolume || [];

  const getMetricVal = (list, keyName) => {
    const item = list.find((m) => m.key?.toLowerCase() === keyName.toLowerCase());
    return item ? toNum(item.value) : null;
  };

  const peRatio = getMetricVal(ratios, 'priceToEarningsTrailing12Month') || getMetricVal(ratios, 'peRatio');
  const pbRatio = getMetricVal(ratios, 'priceToBookValueTrailing12Month') || getMetricVal(ratios, 'pbRatio');
  const dividendYield = getMetricVal(ratios, 'dividendYieldIndicatedAnnualDividend');
  const roe = getMetricVal(mgmt, 'returnOnAverageEquity5YearAverage');
  const roce = getMetricVal(mgmt, 'returnOnInvestmentTrailing12Month');
  const marketCap = getMetricVal(priceVolume, 'marketCap');
  const beta = getMetricVal(priceVolume, 'beta');

  const result = {
    symbol: d.tickerId || matched?.symbol || symbolOrName.toUpperCase(),
    companyName: d.companyName || matched?.name,
    exchangeCodeBse: d.companyProfile?.exchangeCodeBse || matched?.bseSymbol || 'N/A',
    exchangeCodeNse: d.companyProfile?.exchangeCodeNse || matched?.nseSymbol || 'N/A',
    industry: d.industry || matched?.industry,
    sector: d.companyProfile?.sector || matched?.sector,
    description: d.companyProfile?.companyDescription || 'No company overview available.',
    currentPrice: {
      NSE: toNum(d.currentPrice?.NSE),
      BSE: toNum(d.currentPrice?.BSE),
    },
    percentChange: toNum(d.percentChange, 0),
    yearHigh: toNum(d.yearHigh),
    yearLow: toNum(d.yearLow),
    officers: d.companyProfile?.officers?.officer || [],
    keyMetrics: {
      peRatio,
      pbRatio,
      dividendYield,
      roe,
      roce,
      marketCap: marketCap ? `₹${marketCap.toLocaleString('en-IN')} Cr` : 'N/A',
      beta,
    },
    financialStatements: {
      annual: annualReports,
      quarterly: interimReports,
    },
    shareholding: d.shareholding || [],
    news: d.recentNews || [],
    technicalRating: d.peerCompanyList?.[0]?.overallRating || 'Bullish',
    dataSource: 'IndianAPI (Official)',
  };

  cache.set(cacheKey, { time: Date.now(), data: result });
  return result;
}

/**
 * Fetch historical chart data from /historical_data
 * Valid IndianAPI periods: 1m, 6m, 1yr, 3yr, 5yr, max
 */
export async function getHistoricalChartData(symbolOrName, period = '1m', options = {}) {
  const { apiKey, baseUrl } = options;
  const matched = MASTER_STOCKS.find(
    (s) =>
      s.symbol.toUpperCase() === symbolOrName.toUpperCase() ||
      s.nseSymbol.toUpperCase() === symbolOrName.toUpperCase() ||
      s.name.toLowerCase().includes(symbolOrName.toLowerCase()) ||
      s.apiName.toLowerCase() === symbolOrName.toLowerCase()
  );
  const queryName = matched ? matched.apiName : symbolOrName;
  const periodMap = {
    '1D': '1m',
    '5D': '1m',
    '1M': '1m',
    '6M': '6m',
    '1Y': '1yr',
    '3Y': '3yr',
    '5Y': '5yr',
    'MAX': 'max',
  };
  const validPeriod = periodMap[period.toUpperCase()] || '1m';

  const cacheKey = `hist_${queryName}_${validPeriod}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS * 5) {
    return cached.data;
  }

  const url = `${baseUrl || 'https://stock.indianapi.in'}/historical_data?stock_name=${encodeURIComponent(queryName)}&period=${validPeriod}&filter=price`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey },
    timeout: 12000,
  });

  const datasets = response.data?.datasets || [];
  const priceSet = datasets.find((d) => d.metric === 'Price') || datasets[0];
  const volumeSet = datasets.find((d) => d.metric === 'Volume');

  const points = (priceSet?.values || []).map((v) => ({
    date: v[0],
    price: toNum(v[1]),
  }));

  const result = {
    symbol: symbolOrName,
    period: validPeriod,
    dataPoints: points,
    totalPoints: points.length,
    volumePoints: (volumeSet?.values || []).map((v) => ({
      date: v[0],
      volume: toNum(v[1]),
    })),
  };

  cache.set(cacheKey, { time: Date.now(), data: result });
  return result;
}

/**
 * Fetch live market news
 */
export async function getMarketNews(options = {}) {
  const { apiKey, baseUrl } = options;
  const cacheKey = 'market_news';

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS * 2) {
    return cached.data;
  }

  const url = `${baseUrl || 'https://stock.indianapi.in'}/news`;
  const response = await axios.get(url, {
    headers: { 'x-api-key': apiKey },
    timeout: 10000,
  });

  const articles = Array.isArray(response.data) ? response.data : [];
  cache.set(cacheKey, { time: Date.now(), data: articles });
  return articles;
}

/**
 * AI Stock Intelligence Synthesizer
 * Formulates structured fundamental analysis and clear English interpretation.
 */
export function generateAiAnalysis(stockDetails) {
  if (!stockDetails) return null;

  const { companyName, symbol, sector, currentPrice, percentChange, keyMetrics, yearHigh, yearLow, description } =
    stockDetails;

  const price = currentPrice?.NSE || currentPrice?.BSE || 0;
  const pe = keyMetrics?.peRatio;
  const pb = keyMetrics?.pbRatio;
  const roe = keyMetrics?.roe;
  const yieldVal = keyMetrics?.dividendYield;

  const isValuationHigh = pe && pe > 35;
  const isRoeStrong = roe && roe > 15;
  const isDividendPayer = yieldVal && yieldVal > 1.0;

  // Range position
  let rangePos = 50;
  if (yearHigh && yearLow && yearHigh > yearLow && price) {
    rangePos = Math.round(((price - yearLow) / (yearHigh - yearLow)) * 100);
  }

  const strengths = [];
  const weaknesses = [];
  const risks = [];

  if (isRoeStrong) strengths.push(`Robust Return on Equity (ROE: ${roe}%), signaling effective capital compounding.`);
  if (isDividendPayer) strengths.push(`Consistent shareholder return with an indicated dividend yield of ${yieldVal}%.`);
  if (rangePos > 70) strengths.push(`Trading within top 30% of its 52-week range (${rangePos}%), demonstrating strong buyer momentum.`);
  if (!strengths.length) strengths.push(`Established market leadership as a premier constituent in the Indian ${sector} space.`);

  if (isValuationHigh) weaknesses.push(`Elevated P/E ratio (${pe}x) indicates substantial growth expectations already baked into current price.`);
  if (rangePos < 30) weaknesses.push(`Price is under technical pressure, trading near the lower end of its 52-week range (${rangePos}%).`);
  if (!weaknesses.length) weaknesses.push(`Subject to cyclical demand variations and raw input cost pressures.`);

  risks.push(`Macroeconomic sensitivity to Reserve Bank of India (RBI) repo rate trajectories and domestic inflation.`);
  risks.push(`Exchange rate fluctuations and foreign institutional investor (FII) liquidity rotations in emerging markets.`);

  const outlook =
    percentChange >= 0
      ? `The stock demonstrates constructive market traction (+${percentChange}%). Core operational metrics in the ${sector} industry indicate stability, though investors should monitor quarterly margins.`
      : `The stock is currently consolidating with a ${percentChange}% pullback. While fundamental positioning remains sound, near-term range resistance should be observed.`;

  return {
    symbol,
    companyName,
    sector,
    introduction: `${companyName} (${symbol}) is a cornerstone enterprise operating in the Indian ${sector} sector. ${description.slice(0, 220)}...`,
    recentPerformance: `${symbol} currently trades at ₹${price.toLocaleString('en-IN')}, recording a ${percentChange >= 0 ? '+' : ''}${percentChange}% move today. Position in 52-week range is ${rangePos}%.`,
    strengths,
    weaknesses,
    risks,
    fundamentalIndicators: {
      pe: pe ? `${pe}x` : 'N/A',
      pb: pb ? `${pb}x` : 'N/A',
      roe: roe ? `${roe}%` : 'N/A',
      marketCap: keyMetrics?.marketCap || 'N/A',
      dividendYield: yieldVal ? `${yieldVal}%` : 'N/A',
    },
    positiveFactors: [
      `High institutional visibility and inclusion in benchmark indices.`,
      `Strong domestic market penetration across Indian consumer and industrial corridors.`,
    ],
    negativeFactors: [
      `Global commodity and supply chain headwinds.`,
      `Intense competitive pricing within the ${sector} landscape.`,
    ],
    overallAnalysis: outlook,
    disclaimer:
      'AI Analysis is generated algorithmically for educational and analytical purposes based on public API information. It does not constitute certified financial or investment advice.',
  };
}

/**
 * AI Stock Suggestions: suggests related peers in the same sector
 */
export function getAiStockSuggestions(currentSymbol, sector) {
  const peers = MASTER_STOCKS.filter(
    (s) => s.symbol !== currentSymbol && (s.sector === sector || !sector)
  ).slice(0, 4);

  return peers.map((p) => ({
    symbol: p.symbol,
    companyName: p.name,
    sector: p.sector,
    bseSymbol: p.bseSymbol,
    nseSymbol: p.nseSymbol,
    reason: `Shares exposure to the Indian ${p.sector} sector with comparable market capitalization.`,
  }));
}

/**
 * Main stock fetcher supporting ALL, NSE, and BSE exchanges
 */
export async function getWatchlistStocks(exchange = 'ALL', options = {}) {
  const reqExchange = exchange.toUpperCase();
  const { apiKey, baseUrl, enableFallback = true, skipCache = false } = options;
  const hasApiKey = Boolean(apiKey && apiKey.trim() && apiKey !== 'your_indianapi_key_here');

  // If exchange is ALL: load both NSE and BSE representations or master stocks
  const targetExchange = reqExchange === 'BSE' ? 'BSE' : reqExchange === 'ALL' ? 'ALL' : 'NSE';

  const fetchPromises = MASTER_STOCKS.map(async (stock) => {
    // If user selected BSE, fetch BSE; if NSE, fetch NSE; if ALL, default to dual-exchange view
    const exToFetch = targetExchange === 'BSE' ? 'BSE' : 'NSE';
    const data = await getSingleStock(stock, exToFetch, {
      apiKey,
      baseUrl,
      enableFallback,
      skipCache,
    });

    if (targetExchange === 'ALL') {
      return {
        ...data,
        exchange: 'NSE / BSE',
      };
    }
    return data;
  });

  const results = await Promise.allSettled(fetchPromises);
  const successfulStocks = [];
  const errors = [];

  results.forEach((res, index) => {
    const meta = MASTER_STOCKS[index];
    if (res.status === 'fulfilled') {
      successfulStocks.push(res.value);
    } else {
      errors.push({
        symbol: meta.symbol,
        name: meta.name,
        exchange: targetExchange,
        error: res.reason?.message || 'Failed to fetch quote',
      });
    }
  });

  return {
    success: successfulStocks.length > 0,
    exchange: targetExchange,
    timestamp: new Date().toISOString(),
    provider: hasApiKey ? 'IndianAPI (Official)' : 'Public Live Market Feed',
    isKeyConfigured: hasApiKey,
    total: MASTER_STOCKS.length,
    successfulCount: successfulStocks.length,
    failedCount: errors.length,
    data: successfulStocks,
    errors,
  };
}
