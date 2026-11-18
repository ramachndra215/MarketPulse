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
  Star,
  Activity,
  Search,
  Scale,
  BrainCircuit,
  PieChart,
} from 'lucide-react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import StockCard from './components/StockCard';
import StockTable from './components/StockTable';
import CompanyModal from './components/CompanyModal';
import MarketOverview from './components/MarketOverview';
import StockComparison from './components/StockComparison';
import PortfolioView from './components/PortfolioView';
import NewsSection from './components/NewsSection';
import AuthModal from './components/AuthModal';
import InteractiveSummaryModal from './components/InteractiveSummaryModal';
import './App.css';

const AUTO_REFRESH_INTERVAL_SEC = 300; // 5 minutes

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Stock list state
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExchange, setSelectedExchange] = useState('ALL'); // 'ALL' | 'NSE' | 'BSE'
  const [filterExchange, setFilterExchange] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Metadata & API status
  const [apiMetadata, setApiMetadata] = useState({
    provider: 'IndianAPI (Official)',
    isKeyConfigured: true,
    successfulCount: 0,
    total: 27,
  });

  // User & Watchlist
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('marketpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [watchlist, setWatchlist] = useState(['RELIANCE', 'TCS', 'TATAMOTORS', 'HDFCBANK']);
  const [portfolioCount, setPortfolioCount] = useState(2);

  // Modals state
  const [selectedStock, setSelectedStock] = useState(null);
  const [summaryModalType, setSummaryModalType] = useState(null); // 'total-tracked' | 'positive-movers' | etc.
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Auto-refresh timer
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL_SEC);
  const isFetchingRef = useRef(false);

  // Fetch stocks
  const fetchStocks = useCallback(
    async (isManual = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      if (isManual) setRefreshing(true);

      try {
        const response = await axios.get('/api/stocks', {
          params: {
            exchange: selectedExchange,
            refresh: isManual ? 'true' : 'false',
          },
          timeout: 20000,
        });

        const resData = response.data;
        if (resData && Array.isArray(resData.data)) {
          setStocks(resData.data);
          setLastUpdated(resData.timestamp || new Date().toISOString());
          setApiMetadata({
            provider: resData.provider || 'IndianAPI (Official)',
            isKeyConfigured: Boolean(resData.isKeyConfigured),
            successfulCount: resData.successfulCount || resData.data.length,
            total: resData.total || 27,
          });
          setError(null);
        } else {
          throw new Error('Invalid response received from stock backend server');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        const errMsg =
          err.response?.data?.error ||
          err.message ||
          'Failed to load live stock prices. Verify backend server is running.';
        setError(errMsg);
      } finally {
        setLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
        setCountdown(AUTO_REFRESH_INTERVAL_SEC);
      }
    },
    [selectedExchange]
  );

  // Load stocks on mount and exchange switch
  useEffect(() => {
    fetchStocks(false);
  }, [fetchStocks]);

  // Load user watchlist
  useEffect(() => {
    async function loadWatchlist() {
      try {
        const token = user?.token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('/api/user/watchlist', { headers });
        if (res.data?.watchlist) {
          setWatchlist(res.data.watchlist);
        }
      } catch (err) {
        // quiet fail
      }
    }
    loadWatchlist();
  }, [user]);

  // Auto-refresh countdown
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

  // Distinct sectors
  const sectors = useMemo(() => {
    const set = new Set();
    stocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return Array.from(set).sort();
  }, [stocks]);

  // Live prices lookup map
  const livePrices = useMemo(() => {
    const map = {};
    stocks.forEach((s) => {
      if (s.symbol && s.price) map[s.symbol.toUpperCase()] = s.price;
    });
    return map;
  }, [stocks]);

  // Filter and sort stocks
  const processedStocks = useMemo(() => {
    let result = [...stocks];

    // Filter by active navigation tab
    if (activeTab === 'watchlist') {
      result = result.filter((s) => watchlist.includes(s.symbol.toUpperCase()));
    } else if (activeTab === 'top-gainers') {
      result = result.filter((s) => s.percentChange > 0);
    } else if (activeTab === 'top-losers') {
      result = result.filter((s) => s.percentChange < 0);
    }

    // Filter by Exchange
    if (filterExchange !== 'ALL') {
      result = result.filter(
        (s) =>
          s.exchange?.toUpperCase() === filterExchange.toUpperCase() ||
          s.exchange?.includes(filterExchange.toUpperCase())
      );
    }

    // Filter by Sector
    if (selectedSector !== 'ALL') {
      result = result.filter((s) => s.sector === selectedSector);
    }

    // Filter by Search Query (Company Name, Symbol, or BSE Scrip Code)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.companyName.toLowerCase().includes(q) ||
          (s.nseSymbol && s.nseSymbol.toLowerCase().includes(q)) ||
          (s.bseSymbol && String(s.bseSymbol).includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

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
  }, [
    stocks,
    activeTab,
    watchlist,
    filterExchange,
    selectedSector,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  // Summary statistics calculated strictly from loaded stock records
  const summaryStats = useMemo(() => {
    const totalUnique = new Set(stocks.map((s) => s.symbol)).size;
    const nseCount = stocks.filter((s) => s.nseSymbol || s.exchange === 'NSE').length;
    const bseCount = stocks.filter((s) => s.bseSymbol || s.exchange === 'BSE').length;

    const positive = stocks.filter((s) => s.percentChange > 0).length;
    const negative = stocks.filter((s) => s.percentChange < 0).length;
    const neutral = stocks.filter((s) => s.percentChange === 0 || s.percentChange === null).length;

    const total = stocks.length;
    const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
    const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;

    let avgChange = 0;
    if (total > 0) {
      const sum = stocks.reduce((acc, s) => acc + (s.percentChange || 0), 0);
      avgChange = (sum / total).toFixed(2);
    }

    const availabilityPct =
      apiMetadata.total > 0
        ? Math.round((apiMetadata.successfulCount / apiMetadata.total) * 100)
        : 100;

    return {
      totalUnique,
      nseCount,
      bseCount,
      positive,
      positivePct,
      negative,
      negativePct,
      neutral,
      avgChange,
      loadedCount: apiMetadata.successfulCount,
      totalRequested: apiMetadata.total,
      failedCount: apiMetadata.total - apiMetadata.successfulCount,
      availabilityPct,
    };
  }, [stocks, apiMetadata]);

  // Toggle watchlist
  const handleToggleWatchlist = async (symbol) => {
    const sym = symbol.toUpperCase();
    const token = user?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (watchlist.includes(sym)) {
      setWatchlist(watchlist.filter((s) => s !== sym));
      try {
        await axios.delete(`/api/user/watchlist/${sym}`, { headers });
      } catch (e) {}
    } else {
      setWatchlist([...watchlist, sym]);
      try {
        await axios.post('/api/user/watchlist', { symbol: sym }, { headers });
      } catch (e) {}
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('marketpulse_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('marketpulse_user');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <Header
        selectedExchange={selectedExchange}
        onSelectExchange={(ex) => {
          setSelectedExchange(ex);
          setFilterExchange('ALL');
        }}
        isKeyConfigured={apiMetadata.isKeyConfigured}
        providerName={apiMetadata.provider}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onRefresh={() => fetchStocks(true)}
        refreshing={refreshing}
      />

      <div className="layout-body">
        {/* 2. Sidebar Navigation (15 items) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          watchlistCount={watchlist.length}
          portfolioCount={portfolioCount}
        />

        {/* 3. Main Dashboard Work Area */}
        <main className="main-content">
          {/* Conditional View: Market Overview Tab */}
          {activeTab === 'market-overview' && (
            <MarketOverview onSelectStock={(s) => setSelectedStock(s)} />
          )}

          {/* Conditional View: Stock Comparison Tab */}
          {activeTab === 'comparison' && (
            <StockComparison onSelectStock={(s) => setSelectedStock(s)} />
          )}

          {/* Conditional View: Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <PortfolioView
              token={user?.token}
              livePrices={livePrices}
              onSelectStock={(s) => setSelectedStock(s)}
            />
          )}

          {/* Conditional View: News and Reports Tab */}
          {activeTab === 'news-reports' && <NewsSection />}

          {/* Conditional View: Alerts & Notifications */}
          {activeTab === 'alerts' && (
            <div className="placeholder-view">
              <div className="view-header">
                <h3 className="section-heading">Alerts & System Notifications</h3>
                <p className="section-subtext">Automated triggers and exchange notifications.</p>
              </div>
              <div className="alert-cards-wrap">
                <div className="alert-item-card">
                  <span className="alert-time">Market Session Alert</span>
                  <h4>NSE & BSE Pre-market Order Matching Trigger</h4>
                  <p>Pre-market session successfully opens at 09:00 AM IST on regular trading sessions.</p>
                </div>
                <div className="alert-item-card">
                  <span className="alert-time">API Status Notice</span>
                  <h4>IndianAPI Live Feed Connection Active</h4>
                  <p>Authenticated directly via X-Api-Key credentials. Data cache refresh period is 60s.</p>
                </div>
              </div>
            </div>
          )}

          {/* Conditional View: Settings Tab */}
          {activeTab === 'settings' && (
            <div className="placeholder-view">
              <div className="view-header">
                <h3 className="section-heading">Platform Settings & Data Configurations</h3>
                <p className="section-subtext">Manage local environment parameters and exchange views.</p>
              </div>
              <div className="settings-box">
                <div className="settings-row">
                  <div>
                    <strong>Default Benchmark Exchange:</strong>
                    <p className="text-muted">Choose your default trading market for quote initialization.</p>
                  </div>
                  <div className="exchange-filter-pills">
                    <button
                      type="button"
                      className={`filter-pill ${selectedExchange === 'ALL' ? 'active' : ''}`}
                      onClick={() => setSelectedExchange('ALL')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedExchange === 'NSE' ? 'active' : ''}`}
                      onClick={() => setSelectedExchange('NSE')}
                    >
                      NSE
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${selectedExchange === 'BSE' ? 'active' : ''}`}
                      onClick={() => setSelectedExchange('BSE')}
                    >
                      BSE
                    </button>
                  </div>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>Auto-Refresh Interval:</strong>
                    <p className="text-muted">Configure polling frequency (default: 5 minutes / 300 seconds).</p>
                  </div>
                  <span className="mono-number font-semibold">300 Seconds (5 Min)</span>
                </div>

                <div className="settings-row">
                  <div>
                    <strong>API Provider:</strong>
                    <p className="text-muted">Indian Stock Market API (https://stock.indianapi.in)</p>
                  </div>
                  <button
                    type="button"
                    className="btn-config"
                    onClick={() => setShowConfigModal(true)}
                  >
                    <Key size={14} /> View API Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conditional View: User Profile Tab */}
          {activeTab === 'profile' && (
            <div className="placeholder-view">
              <div className="view-header">
                <h3 className="section-heading">User Account Profile</h3>
                <p className="section-subtext">Personalized credentials and market activity.</p>
              </div>
              {user ? (
                <div className="profile-details-card">
                  <div className="profile-avatar-big">{user.name.charAt(0).toUpperCase()}</div>
                  <h4 className="profile-name">{user.name}</h4>
                  <span className="profile-email">{user.email}</span>
                  <div className="profile-stats-row">
                    <div>
                      <span>Watchlist Stocks:</span> <strong>{watchlist.length}</strong>
                    </div>
                    <div>
                      <span>Portfolio Holdings:</span> <strong>{portfolioCount}</strong>
                    </div>
                  </div>
                  <button type="button" className="btn-logout-big" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="empty-subpane">
                  <p>You are currently browsing as a guest.</p>
                  <button
                    type="button"
                    className="btn-login-trigger"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Sign In or Create Account
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Default Equities Dashboard (Active for dashboard, all-stocks, watchlist, top-gainers, top-losers, stock-analysis, ai-intelligence) */}
          {(activeTab === 'dashboard' ||
            activeTab === 'all-stocks' ||
            activeTab === 'watchlist' ||
            activeTab === 'top-gainers' ||
            activeTab === 'top-losers' ||
            activeTab === 'stock-analysis' ||
            activeTab === 'ai-intelligence') && (
            <>
              {/* Dashboard Overview Bar */}
              <div className="overview-card">
                <div className="overview-left">
                  <div className="overview-title-row">
                    <h2 className="overview-title">
                      {activeTab === 'watchlist'
                        ? 'My Personal Watchlist'
                        : activeTab === 'top-gainers'
                        ? 'Top Advancing Stocks Today'
                        : activeTab === 'top-losers'
                        ? 'Top Declining Stocks Today'
                        : activeTab === 'ai-intelligence'
                        ? 'AI Stock Intelligence Hub'
                        : selectedExchange === 'ALL'
                        ? 'Indian Equities Master Board (NSE & BSE)'
                        : selectedExchange === 'NSE'
                        ? 'National Stock Exchange (NSE) Watchlist'
                        : 'Bombay Stock Exchange (BSE) Watchlist'}
                    </h2>
                    <span className="overview-badge">
                      {selectedExchange === 'ALL'
                        ? 'Dual-Exchange Mode'
                        : selectedExchange === 'NSE'
                        ? 'NSE NIFTY Index'
                        : 'BSE SENSEX Index'}
                    </span>
                  </div>
                  <p className="overview-desc">
                    Live valuations, market breadth, and fundamental intelligence for India's leading enterprises.
                  </p>
                </div>

                <div className="overview-actions">
                  <div className="auto-refresh-pill">
                    <button
                      type="button"
                      className="btn-pause-play"
                      onClick={() => setIsAutoRefreshActive((prev) => !prev)}
                      title={isAutoRefreshActive ? 'Pause auto-refresh' : 'Resume auto-refresh'}
                    >
                      {isAutoRefreshActive ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <span className="auto-refresh-text">
                      {isAutoRefreshActive ? (
                        <>
                          Refresh in <strong className="mono-number">{formatCountdown(countdown)}</strong>
                        </>
                      ) : (
                        'Auto-refresh Paused'
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`btn-refresh ${refreshing ? 'loading' : ''}`}
                    onClick={() => fetchStocks(true)}
                    disabled={refreshing || loading}
                  >
                    <RefreshCw size={16} className={refreshing ? 'spin-icon' : ''} />
                    <span>{refreshing ? 'Fetching...' : 'Refresh Quotes'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-config"
                    onClick={() => setShowConfigModal(true)}
                    title="API Details"
                  >
                    <Key size={15} />
                    <span className="btn-config-label">API Config</span>
                  </button>
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="error-alert">
                  <AlertCircle size={20} className="error-icon" />
                  <div className="error-content">
                    <strong>Notice:</strong> {error}
                  </div>
                  <button type="button" className="btn-retry" onClick={() => fetchStocks(true)}>
                    <RotateCcw size={14} /> Retry
                  </button>
                </div>
              )}

              {/* 5 Interactive Summary Cards (Phase 3) */}
              <section className="summary-grid">
                {/* 1. TOTAL TRACKED */}
                <div
                  className="summary-card cursor-pointer"
                  onClick={() => setSummaryModalType('total-tracked')}
                  title="Click to view total tracked stocks breakdown"
                >
                  <div className="summary-card-inner">
                    <div>
                      <span className="summary-label">Total Tracked</span>
                      <div className="summary-val mono-number">{summaryStats.totalUnique}</div>
                      <span className="summary-subtext">
                        NSE: {summaryStats.nseCount} | BSE: {summaryStats.bseCount}
                      </span>
                    </div>
                    <div className="summary-icon-box bg-blue">
                      <Layers size={22} />
                    </div>
                  </div>
                </div>

                {/* 2. POSITIVE MOVERS */}
                <div
                  className="summary-card border-pos cursor-pointer"
                  onClick={() => setSummaryModalType('positive-movers')}
                  title="Click to view advancing stocks list"
                >
                  <div className="summary-card-inner">
                    <div>
                      <span className="summary-label">Positive Movers</span>
                      <div className="summary-val text-pos mono-number">
                        {summaryStats.positive}
                      </div>
                      <span className="summary-subtext text-pos">
                        {summaryStats.positivePct}% of Equities
                      </span>
                    </div>
                    <div className="summary-icon-box bg-pos">
                      <TrendingUp size={22} />
                    </div>
                  </div>
                </div>

                {/* 3. NEGATIVE MOVERS */}
                <div
                  className="summary-card border-neg cursor-pointer"
                  onClick={() => setSummaryModalType('negative-movers')}
                  title="Click to view declining stocks list"
                >
                  <div className="summary-card-inner">
                    <div>
                      <span className="summary-label">Negative Movers</span>
                      <div className="summary-val text-neg mono-number">
                        {summaryStats.negative}
                      </div>
                      <span className="summary-subtext text-neg">
                        {summaryStats.negativePct}% of Equities
                      </span>
                    </div>
                    <div className="summary-icon-box bg-neg">
                      <TrendingDown size={22} />
                    </div>
                  </div>
                </div>

                {/* 4. LOADED RECORDS */}
                <div
                  className="summary-card cursor-pointer"
                  onClick={() => setSummaryModalType('loaded-records')}
                  title="Click to view data availability report"
                >
                  <div className="summary-card-inner">
                    <div>
                      <span className="summary-label">Loaded Records</span>
                      <div className="summary-val mono-number">
                        {summaryStats.loadedCount} / {summaryStats.totalRequested}
                      </div>
                      <span className="summary-subtext text-pos">
                        {summaryStats.availabilityPct}% Data Available
                      </span>
                    </div>
                    <div className="summary-icon-box bg-emerald">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                </div>

                {/* 5. AVERAGE MOVE */}
                <div
                  className="summary-card cursor-pointer"
                  onClick={() => setSummaryModalType('average-move')}
                  title="Click to view market breadth details"
                >
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

              {/* Market Breadth Indicator Row */}
              <div className="market-breadth-bar">
                <span className="breadth-title">Market Breadth:</span>
                <span className="breadth-tag tag-adv">
                  Advancing: <strong>{summaryStats.positive}</strong>
                </span>
                <span className="breadth-tag tag-dec">
                  Declining: <strong>{summaryStats.negative}</strong>
                </span>
                <span className="breadth-tag tag-unc">
                  Unchanged: <strong>{summaryStats.neutral}</strong>
                </span>
              </div>

              {/* Search, Filter & View Controls */}
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

              {/* Stock Cards or Table Display */}
              <section className="stock-display-container">
                {loading && stocks.length === 0 ? (
                  <div className="loading-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                    <AlertCircle size={36} />
                    <h3>No Matching Equities Found</h3>
                    <p>No stocks match query "{searchQuery}" under the selected filters.</p>
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
                        onSelectStock={(s) => setSelectedStock(s)}
                        onAddToWatchlist={handleToggleWatchlist}
                        isInWatchlist={watchlist.includes(stock.symbol.toUpperCase())}
                        onAddToPortfolio={(s) => setActiveTab('portfolio')}
                      />
                    ))}
                  </div>
                ) : (
                  <StockTable
                    stocks={processedStocks}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onSelectStock={(s) => setSelectedStock(s)}
                    onAddToWatchlist={handleToggleWatchlist}
                    watchlist={watchlist}
                  />
                )}
              </section>
            </>
          )}

          {/* Educational Disclaimer */}
          <div className="disclaimer-banner">
            <Info size={18} className="disclaimer-icon" />
            <p>
              <strong>Educational & Informational Disclaimer:</strong> MarketPulse is an
              academic and financial technology platform. Stock prices and fundamentals are
              retrieved directly via IndianAPI REST endpoints. Do not execute capital transactions
              solely based on unverified internet quotes.
            </p>
          </div>
        </main>
      </div>

      {/* Comprehensive Footer */}
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
              Real-time Indian Stock Market Intelligence Platform monitoring core instruments on
              the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Architecture & Feeds</h4>
            <ul className="footer-list">
              <li>Provider: IndianAPI (https://stock.indianapi.in)</li>
              <li>Endpoints: /BSE_most_active, /NSE_most_active, /trending, /stock</li>
              <li>Frontend: React 18, Vite 6, CSS3</li>
              <li>Backend: Node.js, Express.js REST API</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Trading Session Hours</h4>
            <ul className="footer-list">
              <li>Regular Session: 09:15 AM – 03:30 PM IST</li>
              <li>Pre-Market: 09:00 AM – 09:08 AM IST</li>
              <li>Primary Currency: Indian Rupee (₹ - INR)</li>
              <li>Exchanges: NSE & BSE India</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MarketPulse. Academic & Developer Demonstration Project.</p>
          <div className="footer-badges">
            <span className="badge-tag">NSE Verified</span>
            <span className="badge-tag">BSE Verified</span>
            <span className="badge-tag">AI Intelligence v2</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedStock && (
        <CompanyModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onAddToWatchlist={handleToggleWatchlist}
          isInWatchlist={watchlist.includes(selectedStock.symbol.toUpperCase())}
          onOpenPortfolioAdd={(s) => {
            setSelectedStock(null);
            setActiveTab('portfolio');
          }}
          onSelectRelatedStock={(sym) => {
            const found = stocks.find((s) => s.symbol === sym);
            if (found) setSelectedStock(found);
            else setSelectedStock({ symbol: sym, companyName: sym });
          }}
        />
      )}

      {summaryModalType && (
        <InteractiveSummaryModal
          modalType={summaryModalType}
          data={{
            stocks,
            totalUnique: summaryStats.totalUnique,
            nseCount: summaryStats.nseCount,
            bseCount: summaryStats.bseCount,
            positiveCount: summaryStats.positive,
            positivePct: summaryStats.positivePct,
            negativeCount: summaryStats.negative,
            negativePct: summaryStats.negativePct,
            neutralCount: summaryStats.neutral,
            loadedCount: summaryStats.loadedCount,
            totalRequested: summaryStats.totalRequested,
            failedCount: summaryStats.failedCount,
            availabilityPct: summaryStats.availabilityPct,
            avgChange: summaryStats.avgChange,
            provider: apiMetadata.provider,
          }}
          onClose={() => setSummaryModalType(null)}
          onSelectStock={(s) => setSelectedStock(s)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showConfigModal && (
        <div className="modal-backdrop" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={20} className="modal-icon" />
                <h3>IndianAPI Integration Credentials</h3>
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
              <p>
                MarketPulse connects directly to <strong>IndianAPI</strong> (
                <a href="https://indianapi.in" target="_blank" rel="noreferrer">
                  indianapi.in
                </a>
                ) using verified <code className="inline-code">X-Api-Key</code> headers.
              </p>
              <div className="config-status-box">
                <div className="config-status-row">
                  <span>API Status:</span>
                  <span className="badge-status status-ok">Connected & Verified</span>
                </div>
                <div className="config-status-row">
                  <span>Endpoints Integrated:</span>
                  <strong>/NSE_most_active, /BSE_most_active, /trending, /stock, /historical_data, /news</strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowConfigModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
