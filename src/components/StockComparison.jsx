import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Scale, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';

function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
}

export default function StockComparison({ initialSymbols = ['TCS', 'INFY'], onSelectStock }) {
  const [symbols, setSymbols] = useState(initialSymbols);
  const [inputSymbol, setInputSymbol] = useState('');
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompare() {
      if (symbols.length === 0) {
        setComparisonData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get('/api/stocks/compare', {
          params: { symbols: symbols.join(',') },
        });
        if (res.data?.data) {
          setComparisonData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to compare stocks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompare();
  }, [symbols]);

  const handleAddSymbol = (e) => {
    e.preventDefault();
    const clean = inputSymbol.toUpperCase().trim();
    if (clean && !symbols.includes(clean) && symbols.length < 4) {
      setSymbols([...symbols, clean]);
      setInputSymbol('');
    }
  };

  const handleRemoveSymbol = (sym) => {
    setSymbols(symbols.filter((s) => s !== sym));
  };

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div>
          <h3 className="section-heading">Multi-Stock Comparison Matrix</h3>
          <p className="section-subtext">
            Side-by-side valuation, financial health, and operational performance analysis.
          </p>
        </div>

        <form onSubmit={handleAddSymbol} className="comparison-add-form">
          <input
            type="text"
            placeholder="Add symbol (e.g. WIPRO, SBIN)..."
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="search-input compare-input"
          />
          <button type="submit" className="btn-add-compare" disabled={symbols.length >= 4}>
            <Plus size={16} /> Add Stock
          </button>
        </form>
      </div>

      {loading ? (
        <div className="overview-loading-state">
          <Loader2 className="spin-icon" size={28} />
          <span>Synthesizing multi-company comparison metrics...</span>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="empty-subpane">
          <Scale size={36} />
          <p>Add 2 or more stocks to compare their fundamental metrics.</p>
        </div>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="metric-col">Metric</th>
                {comparisonData.map((s) => (
                  <th key={s.symbol} className="company-col">
                    <div className="th-comp-header">
                      <div>
                        <span className="th-symbol mono-number">{s.symbol}</span>
                        <span className="th-name">{s.companyName}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-col"
                        onClick={() => handleRemoveSymbol(s.symbol)}
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="metric-label">Sector</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol}>{s.sector}</td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Current Price (NSE)</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number font-semibold">
                    {formatINR(s.currentPrice?.NSE)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Current Price (BSE)</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number font-semibold">
                    {formatINR(s.currentPrice?.BSE)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Today's Move</td>
                {comparisonData.map((s) => {
                  const isPos = s.percentChange >= 0;
                  return (
                    <td
                      key={s.symbol}
                      className={`mono-number font-semibold ${isPos ? 'text-pos' : 'text-neg'}`}
                    >
                      {isPos ? '+' : ''}{s.percentChange}%
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="metric-label">Market Capitalization</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number font-semibold">
                    {s.keyMetrics?.marketCap || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">P/E Ratio (Trailing)</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {s.keyMetrics?.peRatio ? `${s.keyMetrics.peRatio}x` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">P/B Ratio</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {s.keyMetrics?.pbRatio ? `${s.keyMetrics.pbRatio}x` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Return on Equity (ROE)</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {s.keyMetrics?.roe ? `${s.keyMetrics.roe}%` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Dividend Yield</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {s.keyMetrics?.dividendYield ? `${s.keyMetrics.dividendYield}%` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">52-Week High</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {formatINR(s.yearHigh)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">52-Week Low</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {formatINR(s.yearLow)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">BSE Scrip Code</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol} className="mono-number">
                    {s.exchangeCodeBse}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="metric-label">Action</td>
                {comparisonData.map((s) => (
                  <td key={s.symbol}>
                    <button
                      type="button"
                      className="btn-view-details"
                      onClick={() => onSelectStock(s)}
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
