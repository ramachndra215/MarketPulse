import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Database,
  BarChart3,
  Layers,
  Info,
  Key,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import StockCard from './components/StockCard';
import StockTable from './components/StockTable';
import './App.css';

const AUTO_REFRESH_INTERVAL_SEC = 300; // 5 minutes periodic refresh

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExchange, setSelectedExchange] = useState('NSE');
  const [filterExchange, setFilterExchange] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiMetadata, setApiMetadata] = useState({
    provider: 'Checking...',
    isKeyConfigured: false,
    successfulCount: 0,
    total: 8,
  });

  // Auto-refresh control state
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL_SEC);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Reference to prevent race conditions during concurrent refreshes
  const isFetchingRef = useRef(false);

  /**
   * Main stock fetcher using Axios
   * Connects to /api/stocks which is proxied by Vite to the Express server
   */
  const fetchStocks = useCallback(
    async (isManual = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isManual) {
        setRefreshing(true);
      }

      try {
        const response = await axios.get('/api/stocks', {
          params: {
            exchange: selectedExchange,
            refresh: isManual ? 'true' : 'false',
          },
          timeout: 15000,
        });

        const resData = response.data;
        if (resData && Array.isArray(resData.data)) {
          setStocks(resData.data);
          setLastUpdated(resData.timestamp || new Date().toISOString());
          setApiMetadata({
            provider: resData.provider || 'Live Market Feed',
            isKeyConfigured: Boolean(resData.isKeyConfigured),
            successfulCount: resData.successfulCount || resData.data.length,
            total: resData.total || 8,
          });
          setError(null);
        } else {
          throw new Error('Invalid response structure received from stock server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        const errMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load live stock prices. Verify backend server is running.';
        setError(errMsg);
        // Note: Keep previous valid stocks if already loaded!
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
        setCountdown(AUTO_REFRESH_INTERVAL_SEC);
      }
    },
    [selectedExchange]
  );

  // Initial fetch and fetch on exchange switch
  useEffect(() => {
    fetchStocks(false);
  }, [fetchStocks]);

  // Periodic automatic update timer (countdown every second, fetch when 0)
  useEffect(() => {
    if (!isAutoRefreshActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStocks(false);
          return AUTO_REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefreshActive, fetchStocks]);

  // Extract distinct sectors for filtering
  const sectors = useMemo(() => {
    const set = new Set();
    stocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set).sort();
  }, [stocks]);

  // Filter and sort stocks
  const processedStocks = useMemo(() => {
    let result = [...stocks];

    // Filter by Exchange (if filterExchange !== 'ALL')
    if (filterExchange !== 'ALL') {
      result = result.filter(
        (s) => s.exchange?.toUpperCase() === filterExchange.toUpperCase()
      );
    }

    // Filter by Sector
    if (selectedSector !== 'ALL') {
      result = result.filter((s) => s.sector === selectedSector);
    }

    // Filter by Search Query (Company Name or Symbol)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle strings vs numbers
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      valA = valA === null || valA === undefined ? -Infinity : valA;
      valB = valB === null || valB === undefined ? -Infinity : valB;

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [stocks, filterExchange, selectedSector, searchQuery, sortField, sortDirection]);

  // Summary statistics calculated strictly from loaded stock records
  const summaryStats = useMemo(() => {
    const total = stocks.length;
    const positive = stocks.filter((s) => s.percentChange > 0).length;
    const negative = stocks.filter((s) => s.percentChange < 0).length;
    const neutral = stocks.filter(
      (s) => s.percentChange === 0 || s.percentChange === null
    ).length;

    let avgChange = 0;
    if (total > 0) {
      const sum = stocks.reduce((acc, s) => acc + (s.percentChange || 0), 0);
      avgChange = sum / total;
    }

    return {
      total,
      positive,
      negative,
      neutral,
      avgChange: avgChange.toFixed(2),
      loadedCount: apiMetadata.successfulCount,
    };
  }, [stocks, apiMetadata]);

  // Handle column header sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format countdown mm:ss
  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-container">
      {/* 1. Dark Navy Professional Header */}
      <Header
        selectedExchange={selectedExchange}
        onSelectExchange={(ex) => {
          setSelectedExchange(ex);
          setFilterExchange('ALL'); // Reset filter when exchange tabs change
        }}
        isKeyConfigured={apiMetadata.isKeyConfigured}
        providerName={apiMetadata.provider}
      />

      <main className="main-content">
        {/* 2. Dashboard Overview & Action Toolbar */}
        <div className="overview-card">
          <div className="overview-left">
            <div className="overview-title-row">
              <h2 className="overview-title">
                {selectedExchange === 'NSE'
                  ? 'National Stock Exchange (NSE)'
                  : 'Bombay Stock Exchange (BSE)'}{' '}
                Watchlist
              </h2>
              <span className="overview-badge">
                Primary Benchmark: NIFTY 50 / SENSEX
              </span>
            </div>
            <p className="overview-desc">
              Real-time quotes, intraday movements, and 52-week metrics for India's leading
              blue-chip enterprises.
            </p>
          </div>

          <div className="overview-actions">
            {/* Auto-refresh indicator & toggle */}
            <div className="auto-refresh-pill">
              <button
                type="button"
                className="btn-pause-play"
                onClick={() => setIsAutoRefreshActive((prev) => !prev)}
                title={
                  isAutoRefreshActive
                    ? 'Pause automatic 5-min updates'
                    : 'Resume automatic updates'
                }
              >
                {isAutoRefreshActive ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <span className="auto-refresh-text">
                {isAutoRefreshActive ? (
                  <>
                    Auto-refresh in{' '}
                    <strong className="mono-number">{formatCountdown(countdown)}</strong>
                  </>
                ) : (
                  'Auto-refresh Paused'
                )}
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              className={`btn-refresh ${refreshing ? 'loading' : ''}`}
              onClick={() => fetchStocks(true)}
              disabled={refreshing || loading}
            >
              <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
              <span>{refreshing ? 'Fetching...' : 'Refresh Prices'}</span>
            </button>

            {/* Configure Key Dialog Button */}
            <button
              type="button"
              className="btn-config"
              onClick={() => setShowConfigModal(true)}
              title="API Integration Settings"
            >
              <Key size={15} />
              <span className="btn-config-label">API Config</span>
            </button>
          </div>
        </div>

        {/* API Notification Banner */}
        {!apiMetadata.isKeyConfigured && (
          <div className="api-notice-banner">
            <div className="notice-icon">
              <Info size={18} />
            </div>
            <div className="notice-body">
              <strong>IndianAPI Integration Ready:</strong> Running in Live Public Market
              Feed mode. To authenticate directly with your official IndianAPI account, add your
              key to <code className="inline-code">server/.env</code> as{' '}
              <code className="inline-code">INDIAN_API_KEY=your_key</code>.
            </div>
            <button
              type="button"
              className="btn-notice-action"
              onClick={() => setShowConfigModal(true)}
            >
              Setup Guide
            </button>
          </div>
        )}

        {/* Error Alert Display */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={20} className="error-icon" />
            <div className="error-content">
              <strong>Data Fetch Notice:</strong> {error}
              {stocks.length > 0 && (
                <span className="error-subtext">
                  {' '}
                  (Showing previously cached live market data)
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn-retry"
              onClick={() => fetchStocks(true)}
            >
              <RotateCcw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* 3. Summary Metric Cards */}
        <section className="summary-grid">
          <div className="summary-card">
            <div className="summary-card-inner">
              <div>
                <span className="summary-label">Total Tracked</span>
                <div className="summary-val mono-number">{summaryStats.total}</div>
                <span className="summary-subtext">Core Indian Bluechips</span>
              </div>
              <div className="summary-icon-box bg-blue">
                <Layers size={22} />
              </div>
            </div>
          </div>

          <div className="summary-card border-pos">
            <div className="summary-card-inner">
              <div>
                <span className="summary-label">Positive Movers</span>
                <div className="summary-val text-pos mono-number">
                  {summaryStats.positive}
                </div>
                <span className="summary-subtext text-pos">Gainers Today</span>
              </div>
              <div className="summary-icon-box bg-pos">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="summary-card border-neg">
            <div className="summary-card-inner">
              <div>
                <span className="summary-label">Negative Movers</span>
                <div className="summary-val text-neg mono-number">
                  {summaryStats.negative}
                </div>
                <span className="summary-subtext text-neg">Losers Today</span>
              </div>
              <div className="summary-icon-box bg-neg">
                <TrendingDown size={22} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-inner">
              <div>
                <span className="summary-label">Loaded Records</span>
                <div className="summary-val mono-number">
                  {summaryStats.loadedCount} / {apiMetadata.total}
                </div>
                <span className="summary-subtext">
                  {summaryStats.loadedCount === apiMetadata.total
                    ? '100% Data Available'
                    : 'Partial Feed'}
                </span>
              </div>
              <div className="summary-icon-box bg-emerald">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-card-inner">
              <div>
                <span className="summary-label">Average Move</span>
                <div
                  className={`summary-val mono-number ${
                    Number(summaryStats.avgChange) > 0
                      ? 'text-pos'
                      : Number(summaryStats.avgChange) < 0
                      ? 'text-neg'
                      : ''
                  }`}
                >
                  {Number(summaryStats.avgChange) > 0 ? '+' : ''}
                  {summaryStats.avgChange}%
                </div>
                <span className="summary-subtext">Watchlist Breadth</span>
              </div>
              <div className="summary-icon-box bg-purple">
                <BarChart3 size={22} />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Search, Filter & View Controls */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedExchange={filterExchange}
          onExchangeChange={setFilterExchange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalStocks={stocks.length}
          filteredCount={processedStocks.length}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
          sectors={sectors}
        />

        {/* 5. Main Content: Stock Cards Grid or Table */}
        <section className="stock-display-container">
          {loading && stocks.length === 0 ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-line skeleton-title"></div>
                  <div className="skeleton-line skeleton-subtitle"></div>
                  <div className="skeleton-line skeleton-price"></div>
                  <div className="skeleton-line skeleton-bar"></div>
                </div>
              ))}
            </div>
          ) : processedStocks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <AlertCircle size={36} />
              </div>
              <h3>No Matching Stocks Found</h3>
              <p>
                No stocks match your current query "{searchQuery}" or selected sector.
              </p>
              <button
                type="button"
                className="btn-clear-filters"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('ALL');
                  setFilterExchange('ALL');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="stocks-grid">
              {processedStocks.map((stock) => (
                <StockCard
                  key={`${stock.symbol}-${stock.exchange}`}
                  stock={stock}
                />
              ))}
            </div>
          ) : (
            <StockTable
              stocks={processedStocks}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </section>

        {/* 6. Educational Disclaimer Banner */}
        <div className="disclaimer-banner">
          <Info size={18} className="disclaimer-icon" />
          <p>
            <strong>Educational & Informational Disclaimer:</strong> MarketPulse is an
            academic and informational financial technology interface. Stock prices are fetched
            dynamically via external stock market APIs and are subject to exchange latency or
            provider update frequencies. Never make real financial or capital investment
            decisions solely based on unverified web feeds.
          </p>
        </div>
      </main>

      {/* 7. Comprehensive Professional Footer */}
      <footer className="footer-container">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-brand">
              <div className="footer-logo">
                <TrendingUp size={18} />
              </div>
              <span className="footer-title">MarketPulse</span>
            </div>
            <p className="footer-desc">
              High-performance real-time Indian stock market dashboard monitoring core
              instruments on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Technology Architecture</h4>
            <ul className="footer-list">
              <li>Frontend: React 18, Vite, ES6+, CSS3</li>
              <li>Backend: Node.js, Express.js, Axios</li>
              <li>Provider: IndianAPI (https://indianapi.in)</li>
              <li>Deployment: Vercel Serverless Architecture</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Market Information</h4>
            <ul className="footer-list">
              <li>Regular Hours: 09:15 AM – 03:30 PM IST</li>
              <li>Pre-Market: 09:00 AM – 09:08 AM IST</li>
              <li>Exchanges: NSE India & BSE India</li>
              <li>Currency: Indian Rupee (₹ - INR)</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MarketPulse. Designed for Indian Stock Market Analytics.</p>
          <div className="footer-badges">
            <span className="badge-tag">REST API v1</span>
            <span className="badge-tag">CORS Enabled</span>
            <span className="badge-tag">Promise.allSettled</span>
          </div>
        </div>
      </footer>

      {/* API Configuration Modal */}
      {showConfigModal && (
        <div className="modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={20} className="modal-icon" />
                <h3>API Configuration & Credentials</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setShowConfigModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-intro">
                MarketPulse integrates directly with <strong>IndianAPI</strong>{' '}
                (<a href="https://indianapi.in" target="_blank" rel="noreferrer">indianapi.in</a>)
                to retrieve official Indian stock market quotes.
              </p>

              <div className="config-status-box">
                <div className="config-status-row">
                  <span>Current Provider:</span>
                  <strong>{apiMetadata.provider}</strong>
                </div>
                <div className="config-status-row">
                  <span>IndianAPI Key Status:</span>
                  <span
                    className={`badge-status ${
                      apiMetadata.isKeyConfigured ? 'status-ok' : 'status-pending'
                    }`}
                  >
                    {apiMetadata.isKeyConfigured
                      ? 'Configured & Active'
                      : 'Unset (Using Live Public Fallback)'}
                  </span>
                </div>
              </div>

              <h4 className="modal-step-title">How to Add Your IndianAPI Key:</h4>
              <ol className="modal-steps-list">
                <li>
                  Sign up for a free or developer account at{' '}
                  <a href="https://indianapi.in" target="_blank" rel="noreferrer">
                    indianapi.in
                  </a>
                  .
                </li>
                <li>Generate your API Key from your dashboard.</li>
                <li>
                  Open <code className="inline-code">server/.env</code> in your project:
                  <pre className="code-block">
{`PORT=5000
API_BASE_URL=https://stock.indianapi.in
INDIAN_API_KEY=your_actual_api_key_here`}
                  </pre>
                </li>
                <li>
                  Restart the server (<code className="inline-code">npm start</code>) and refresh!
                </li>
                <li>
                  For <strong>Vercel Deployment</strong>, add{' '}
                  <code className="inline-code">INDIAN_API_KEY</code> under Project Settings →
                  Environment Variables.
                </li>
              </ol>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowConfigModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
