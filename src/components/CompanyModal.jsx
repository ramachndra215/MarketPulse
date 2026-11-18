import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Star,
  PlusCircle,
  Calendar,
  Building2,
  DollarSign,
  PieChart,
  FileText,
  Newspaper,
  ShieldAlert,
  CheckCircle,
  ExternalLink,
  Loader2,
  Info,
} from 'lucide-react';

function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
}

function formatChange(val) {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${Number(val).toFixed(2)}`;
}

export default function CompanyModal({
  stock,
  onClose,
  onAddToWatchlist,
  isInWatchlist,
  onOpenPortfolioAdd,
  onSelectRelatedStock,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'financials' | 'shareholding' | 'news' | 'ai'
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const symbol = stock.symbol;

  // Fetch full details
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoadingDetails(true);
      try {
        const res = await axios.get(`/api/stocks/details/${symbol}`);
        if (isMounted && res.data?.data) {
          setDetails(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load full company details:', err);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Fetch chart data when period or symbol changes
  useEffect(() => {
    let isMounted = true;
    async function loadChart() {
      setLoadingChart(true);
      try {
        const res = await axios.get(`/api/stocks/history/${symbol}`, {
          params: { period: chartPeriod },
        });
        if (isMounted && res.data?.data?.dataPoints) {
          setChartData(res.data.data.dataPoints);
        }
      } catch (err) {
        console.error('Failed to load historical chart:', err);
      } finally {
        if (isMounted) setLoadingChart(false);
      }
    }
    loadChart();
    return () => {
      isMounted = false;
    };
  }, [symbol, chartPeriod]);

  // Fetch AI Suggestions
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await axios.get(`/api/stocks/ai-suggestions/${symbol}`, {
          params: { sector: stock.sector || '' },
        });
        if (res.data?.data) {
          setSuggestions(res.data.data);
        }
      } catch (e) {
        // quiet fail
      }
    }
    loadSuggestions();
  }, [symbol, stock.sector]);

  // Run AI Analysis
  const handleRunAiAnalysis = async () => {
    setActiveTab('ai');
    if (aiAnalysis) return;
    setLoadingAi(true);
    try {
      const res = await axios.get(`/api/stocks/ai-analysis/${symbol}`);
      if (res.data?.data) {
        setAiAnalysis(res.data.data);
      }
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const isPos = stock.percentChange > 0;
  const isNeg = stock.percentChange < 0;
  const currentPriceVal =
    details?.currentPrice?.NSE || details?.currentPrice?.BSE || stock.price;

  // Chart min/max calculation
  const prices = chartData.map((d) => d.price).filter((p) => p !== null && !isNaN(p));
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 100;
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="company-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Strip */}
        <div className="company-modal-header">
          <div className="modal-brand-info">
            <div className="modal-title-row">
              <h2 className="modal-stock-title mono-number">{symbol}</h2>
              <span className="exchange-badge badge-nse">
                NSE: {details?.exchangeCodeNse || stock.nseSymbol || symbol}
              </span>
              <span className="exchange-badge badge-bse">
                BSE: {details?.exchangeCodeBse || stock.bseSymbol || '500xxx'}
              </span>
              <span className="modal-sector-tag">{details?.sector || stock.sector}</span>
            </div>
            <h3 className="modal-company-subname">{details?.companyName || stock.companyName}</h3>
          </div>

          <div className="modal-top-actions">
            <button
              type="button"
              className={`btn-action-icon ${isInWatchlist ? 'active' : ''}`}
              onClick={() => onAddToWatchlist(symbol)}
              title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              <Star size={16} fill={isInWatchlist ? '#eab308' : 'none'} color={isInWatchlist ? '#eab308' : 'currentColor'} />
              <span>{isInWatchlist ? 'Watchlist' : '+ Watchlist'}</span>
            </button>

            <button
              type="button"
              className="btn-action-icon btn-portfolio"
              onClick={() => onOpenPortfolioAdd(stock)}
              title="Add to Portfolio"
            >
              <PlusCircle size={16} />
              <span>+ Portfolio</span>
            </button>

            <button
              type="button"
              className="btn-ai-analyze"
              onClick={handleRunAiAnalysis}
              title="Run AI Stock Intelligence"
            >
              <BrainCircuit size={16} />
              <span>ANALYZE WITH AI</span>
            </button>

            <button type="button" className="btn-close-modal" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Price Bar */}
        <div className="company-price-strip">
          <div className="price-primary">
            <span className="price-big mono-number">{formatINR(currentPriceVal)}</span>
            <div className={`price-delta-badge mono-number ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
              {isPos ? <TrendingUp size={15} /> : isNeg ? <TrendingDown size={15} /> : null}
              <span>{formatChange(stock.priceChange)} ({formatChange(stock.percentChange)}%)</span>
            </div>
          </div>

          <div className="price-grid-stats">
            <div className="stat-cell">
              <span className="cell-lbl">Day High</span>
              <span className="cell-val mono-number">{formatINR(stock.dayHigh || details?.yearHigh)}</span>
            </div>
            <div className="stat-cell">
              <span className="cell-lbl">Day Low</span>
              <span className="cell-val mono-number">{formatINR(stock.dayLow || details?.yearLow)}</span>
            </div>
            <div className="stat-cell">
              <span className="cell-lbl">52W High</span>
              <span className="cell-val mono-number">{formatINR(details?.yearHigh || stock.yearHigh)}</span>
            </div>
            <div className="stat-cell">
              <span className="cell-lbl">52W Low</span>
              <span className="cell-val mono-number">{formatINR(details?.yearLow || stock.yearLow)}</span>
            </div>
            <div className="stat-cell">
              <span className="cell-lbl">Market Cap</span>
              <span className="cell-val mono-number">{details?.keyMetrics?.marketCap || 'Large Cap'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs-bar">
          <button
            type="button"
            className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Charts
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'financials' ? 'active' : ''}`}
            onClick={() => setActiveTab('financials')}
          >
            Financial Reports
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'shareholding' ? 'active' : ''}`}
            onClick={() => setActiveTab('shareholding')}
          >
            Shareholding Pattern
          </button>
          <button
            type="button"
            className={`modal-tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            Company News ({details?.news?.length || 0})
          </button>
          <button
            type="button"
            className={`modal-tab tab-ai ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={handleRunAiAnalysis}
          >
            <BrainCircuit size={15} /> AI Intelligence
          </button>
        </div>

        {/* Tab Contents */}
        <div className="modal-body-scrollable">
          {activeTab === 'overview' && (
            <div className="tab-pane-overview">
              {/* Interactive SVG Chart */}
              <div className="chart-wrapper-box">
                <div className="chart-header-row">
                  <div className="chart-title-group">
                    <span className="chart-title">Historical Price Movement</span>
                    <span className="chart-subtitle">
                      {chartPeriod} Interval (IndianAPI Historical Data Feed)
                    </span>
                  </div>
                  <div className="period-selector-pills">
                    {['1D', '5D', '1M', '6M', '1Y', '3Y', '5Y', 'MAX'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`period-pill ${chartPeriod === p ? 'active' : ''}`}
                        onClick={() => setChartPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chart-canvas-area">
                  {loadingChart ? (
                    <div className="chart-loading-state">
                      <Loader2 className="spin-icon" size={28} />
                      <span>Loading historical stock data...</span>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="chart-empty-state">
                      <span>No historical price data available for {chartPeriod}.</span>
                    </div>
                  ) : (
                    <div className="svg-chart-container">
                      <svg viewBox="0 0 800 240" className="stock-svg-chart">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Background Grid Lines */}
                        <line x1="40" y1="20" x2="780" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="80" x2="780" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="140" x2="780" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="200" x2="780" y2="200" stroke="#f1f5f9" strokeDasharray="4 4" />

                        {/* Y-axis Labels */}
                        <text x="35" y="25" textAnchor="end" fontSize="10" fill="#94a3b8">
                          ₹{maxPrice.toFixed(0)}
                        </text>
                        <text x="35" y="115" textAnchor="end" fontSize="10" fill="#94a3b8">
                          ₹{((maxPrice + minPrice) / 2).toFixed(0)}
                        </text>
                        <text x="35" y="205" textAnchor="end" fontSize="10" fill="#94a3b8">
                          ₹{minPrice.toFixed(0)}
                        </text>

                        {/* Path Area Fill */}
                        <polygon
                          points={`
                            40,210
                            ${chartData
                              .map((pt, idx) => {
                                const x = 40 + (idx / (chartData.length - 1 || 1)) * 740;
                                const y = 200 - ((pt.price - minPrice) / priceRange) * 180 + 10;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            780,210
                          `}
                          fill="url(#chartGradient)"
                        />

                        {/* Polyline Line Stroke */}
                        <polyline
                          points={chartData
                            .map((pt, idx) => {
                              const x = 40 + (idx / (chartData.length - 1 || 1)) * 740;
                              const y = 200 - ((pt.price - minPrice) / priceRange) * 180 + 10;
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="chart-date-labels">
                        <span>{chartData[0]?.date || 'Start'}</span>
                        <span>{chartData[Math.floor(chartData.length / 2)]?.date || 'Mid'}</span>
                        <span>{chartData[chartData.length - 1]?.date || 'Latest'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Valuation Fundamentals Grid */}
              <div className="fundamentals-section">
                <h4 className="section-subtitle">Key Company Fundamentals</h4>
                <div className="fundamentals-grid">
                  <div className="f-card">
                    <span className="f-lbl">P/E Ratio</span>
                    <span className="f-val mono-number">
                      {details?.keyMetrics?.peRatio ? `${details.keyMetrics.peRatio}x` : 'N/A'}
                    </span>
                  </div>
                  <div className="f-card">
                    <span className="f-lbl">P/B Ratio</span>
                    <span className="f-val mono-number">
                      {details?.keyMetrics?.pbRatio ? `${details.keyMetrics.pbRatio}x` : 'N/A'}
                    </span>
                  </div>
                  <div className="f-card">
                    <span className="f-lbl">ROE (5-Yr Avg)</span>
                    <span className="f-val mono-number">
                      {details?.keyMetrics?.roe ? `${details.keyMetrics.roe}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="f-card">
                    <span className="f-lbl">ROCE</span>
                    <span className="f-val mono-number">
                      {details?.keyMetrics?.roce ? `${details.keyMetrics.roce}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="f-card">
                    <span className="f-lbl">Dividend Yield</span>
                    <span className="f-val mono-number">
                      {details?.keyMetrics?.dividendYield
                        ? `${details.keyMetrics.dividendYield}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="f-card">
                    <span className="f-lbl">Beta</span>
                    <span className="f-val mono-number">{details?.keyMetrics?.beta || '1.00'}</span>
                  </div>
                </div>
              </div>

              {/* Company Profile Description */}
              <div className="description-card">
                <h4 className="section-subtitle">About {details?.companyName || stock.companyName}</h4>
                <p className="desc-text">
                  {details?.description || 'Corporate overview is being retrieved from IndianAPI.'}
                </p>
                <div className="profile-meta-row">
                  <span>
                    <strong>Industry:</strong> {details?.industry || stock.industry}
                  </span>
                  <span>
                    <strong>Exchange Tracking:</strong> NSE & BSE Listed
                  </span>
                </div>
              </div>

              {/* AI Peer Suggestions */}
              {suggestions.length > 0 && (
                <div className="suggestions-section">
                  <h4 className="section-subtitle">
                    Related {stock.sector} Peer Companies (AI Suggestions)
                  </h4>
                  <div className="suggestions-grid">
                    {suggestions.map((peer) => (
                      <div
                        key={peer.symbol}
                        className="peer-card"
                        onClick={() => onSelectRelatedStock(peer.symbol)}
                      >
                        <div className="peer-top">
                          <span className="peer-sym mono-number">{peer.symbol}</span>
                          <span className="peer-sector">{peer.sector}</span>
                        </div>
                        <span className="peer-name">{peer.companyName}</span>
                        <p className="peer-reason">{peer.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="tab-pane-financials">
              <h4 className="section-subtitle">Financial Statements & Balance Sheets</h4>
              {details?.financialStatements?.annual?.length > 0 ? (
                <div className="financials-table-wrap">
                  <table className="financials-table">
                    <thead>
                      <tr>
                        <th>Statement Year</th>
                        <th>Period Type</th>
                        <th>Reporting End Date</th>
                        <th>Income Statement (P&L)</th>
                        <th>Balance Sheet (BAL)</th>
                        <th>Cash Flow (CAS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.financialStatements.annual.map((f, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold mono-number">FY {f.FiscalYear}</td>
                          <td>{f.Type}</td>
                          <td className="mono-number">{f.EndDate}</td>
                          <td>
                            <span className="badge-tag">
                              {f.stockFinancialMap?.INC?.length || 0} Line Items
                            </span>
                          </td>
                          <td>
                            <span className="badge-tag">
                              {f.stockFinancialMap?.BAL?.length || 0} Balance Items
                            </span>
                          </td>
                          <td>
                            <span className="badge-tag">
                              {f.stockFinancialMap?.CAS?.length || 0} Cash Items
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-subpane">
                  <FileText size={32} />
                  <p>Annual financial statements are available in the official IndianAPI database.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shareholding' && (
            <div className="tab-pane-shareholding">
              <h4 className="section-subtitle">Shareholding Pattern (Institutional & Promoter)</h4>
              {details?.shareholding?.length > 0 ? (
                <div className="shareholding-grid">
                  {details.shareholding.map((sh, idx) => (
                    <div key={idx} className="shareholding-card">
                      <div className="sh-header">
                        <PieChart size={18} className="sh-icon" />
                        <span className="sh-name">{sh.displayName || sh.categoryName}</span>
                      </div>
                      <span className="sh-cat-desc">{sh.categoryName}</span>
                      <div className="sh-list">
                        {(sh.categories || []).map((cat, cIdx) => (
                          <div key={cIdx} className="sh-row">
                            <span className="sh-label">{cat.categoryName || `Tranche ${cIdx + 1}`}</span>
                            <span className="sh-val mono-number">
                              {cat.percentage ? `${cat.percentage}%` : 'Reported'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-subpane">
                  <PieChart size={32} />
                  <p>Shareholding breakdown details are being loaded from exchange records.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="tab-pane-news">
              <h4 className="section-subtitle">Company Specific Announcements & Press</h4>
              {details?.news?.length > 0 ? (
                <div className="news-cards-list">
                  {details.news.map((item, idx) => (
                    <article key={idx} className="news-article-card">
                      <div className="news-content-box">
                        <span className="news-date">
                          <Calendar size={12} /> {item.date || 'Recent Announcement'}
                        </span>
                        <h5 className="news-title">{item.title}</h5>
                        {item.summary && <p className="news-summary">{item.summary}</p>}
                        <span className="news-source">Source: {item.source || 'Financial Media'}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-subpane">
                  <Newspaper size={32} />
                  <p>No recent news articles logged for {symbol} this week.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="tab-pane-ai">
              {loadingAi ? (
                <div className="ai-loading-box">
                  <BrainCircuit size={40} className="spin-icon" />
                  <h4>Generating AI Stock Intelligence...</h4>
                  <p>Synthesizing fundamental indicators, valuation ratios, and market trends.</p>
                </div>
              ) : aiAnalysis ? (
                <div className="ai-analysis-container">
                  <div className="ai-header-badge">
                    <BrainCircuit size={18} />
                    <span>AI Stock Intelligence Analysis: {symbol}</span>
                  </div>

                  <div className="ai-card">
                    <h5>1. Executive Company Introduction</h5>
                    <p>{aiAnalysis.introduction}</p>
                  </div>

                  <div className="ai-card">
                    <h5>2. Recent Price Performance</h5>
                    <p>{aiAnalysis.recentPerformance}</p>
                  </div>

                  <div className="ai-cards-two-col">
                    <div className="ai-card border-green">
                      <h5 className="text-pos">
                        <CheckCircle size={16} /> 3. Financial Strengths
                      </h5>
                      <ul>
                        {aiAnalysis.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="ai-card border-red">
                      <h5 className="text-neg">
                        <ShieldAlert size={16} /> 4. Financial Weaknesses & Risks
                      </h5>
                      <ul>
                        {aiAnalysis.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                        {aiAnalysis.risks.map((r, idx) => (
                          <li key={idx}>Risk: {r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="ai-card">
                    <h5>5. Fundamental Indicators Summary</h5>
                    <div className="ai-indicators-grid">
                      <div>
                        <span>P/E:</span> <strong>{aiAnalysis.fundamentalIndicators.pe}</strong>
                      </div>
                      <div>
                        <span>P/B:</span> <strong>{aiAnalysis.fundamentalIndicators.pb}</strong>
                      </div>
                      <div>
                        <span>ROE:</span> <strong>{aiAnalysis.fundamentalIndicators.roe}</strong>
                      </div>
                      <div>
                        <span>Dividend Yield:</span>{' '}
                        <strong>{aiAnalysis.fundamentalIndicators.dividendYield}</strong>
                      </div>
                      <div>
                        <span>Market Cap:</span>{' '}
                        <strong>{aiAnalysis.fundamentalIndicators.marketCap}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="ai-card ai-summary-highlight">
                    <h5>6. Overall Stock Analysis in Simple English</h5>
                    <p>{aiAnalysis.overallAnalysis}</p>
                    <span className="ai-disclaimer-note">{aiAnalysis.disclaimer}</span>
                  </div>
                </div>
              ) : (
                <div className="empty-subpane">
                  <BrainCircuit size={36} />
                  <p>Click "ANALYZE WITH AI" to generate real-time synthesized intelligence.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
