import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Briefcase,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
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

export default function PortfolioView({ token, livePrices = {}, onSelectStock }) {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    exchange: 'NSE',
    quantity: 10,
    buyPrice: 420,
    buyDate: new Date().toISOString().split('T')[0],
  });

  const fetchPortfolio = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/user/portfolio', { headers });
      if (res.data?.portfolio) {
        setPortfolio(res.data.portfolio);
      }
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('/api/user/portfolio', form, { headers });
      if (res.data?.portfolio) {
        setPortfolio(res.data.portfolio);
        setShowAddForm(false);
        setForm({
          symbol: '',
          companyName: '',
          exchange: 'NSE',
          quantity: 1,
          buyPrice: 100,
          buyDate: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteHolding = async (id) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(`/api/user/portfolio/${id}`, { headers });
      if (res.data?.portfolio) {
        setPortfolio(res.data.portfolio);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Calculations
  let totalInvested = 0;
  let totalCurrentValue = 0;

  const holdingsWithMetrics = portfolio.map((item) => {
    const qty = Number(item.quantity) || 0;
    const buyPrice = Number(item.buyPrice) || 0;
    const invested = qty * buyPrice;

    // Look up live price from dashboard state or fallback to buyPrice
    const currentPrice = livePrices[item.symbol.toUpperCase()] || buyPrice;
    const currentVal = qty * currentPrice;
    const pnl = currentVal - invested;
    const returnPct = invested > 0 ? (pnl / invested) * 100 : 0;

    totalInvested += invested;
    totalCurrentValue += currentVal;

    return {
      ...item,
      currentPrice,
      invested,
      currentVal,
      pnl,
      returnPct,
    };
  });

  const overallPnl = totalCurrentValue - totalInvested;
  const overallReturnPct = totalInvested > 0 ? (overallPnl / totalInvested) * 100 : 0;
  const isOverallPos = overallPnl >= 0;

  return (
    <div className="portfolio-view">
      <div className="portfolio-header-strip">
        <div>
          <h3 className="section-heading">My Indian Equities Portfolio</h3>
          <p className="section-subtext">
            Track investments, live valuation, and absolute P&L returns across NSE & BSE holdings.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-holding"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel' : 'Add Holding'}</span>
        </button>
      </div>

      {/* Portfolio Aggregated Summary Cards */}
      <div className="portfolio-summary-grid">
        <div className="port-summary-card">
          <span className="port-card-lbl">Total Invested</span>
          <div className="port-card-val mono-number">{formatINR(totalInvested)}</div>
          <span className="port-card-sub">Cost basis</span>
        </div>

        <div className="port-summary-card">
          <span className="port-card-lbl">Current Value</span>
          <div className="port-card-val mono-number">{formatINR(totalCurrentValue)}</div>
          <span className="port-card-sub">Market valuation</span>
        </div>

        <div className={`port-summary-card ${isOverallPos ? 'border-pos' : 'border-neg'}`}>
          <span className="port-card-lbl">Overall Profit / Loss</span>
          <div className={`port-card-val mono-number ${isOverallPos ? 'text-pos' : 'text-neg'}`}>
            {isOverallPos ? '+' : ''}{formatINR(overallPnl)}
          </div>
          <span className={`port-card-sub ${isOverallPos ? 'text-pos' : 'text-neg'}`}>
            {isOverallPos ? '+' : ''}{overallReturnPct.toFixed(2)}% Return
          </span>
        </div>
      </div>

      {/* Add Holding Form Dialog */}
      {showAddForm && (
        <form onSubmit={handleAddHolding} className="add-holding-form">
          <h4 className="form-title">Enter Transaction Details</h4>
          <div className="form-fields-grid">
            <div className="form-group">
              <label>Stock Symbol</label>
              <input
                type="text"
                required
                value={form.symbol}
                onChange={(e) =>
                  setForm({ ...form, symbol: e.target.value.toUpperCase() })
                }
                placeholder="e.g. RELIANCE, TATAMOTORS"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Company Name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Exchange</label>
              <select
                value={form.exchange}
                onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                className="form-input"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Purchase Price (₹)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                required
                value={form.buyPrice}
                onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Buy Date</label>
              <input
                type="date"
                value={form.buyDate}
                onChange={(e) => setForm({ ...form, buyDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn-submit-holding">
              Save Holding
            </button>
            <button
              type="button"
              className="btn-cancel-holding"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Holdings Table */}
      {holdingsWithMetrics.length === 0 ? (
        <div className="empty-subpane">
          <Briefcase size={36} />
          <p>No holdings added yet. Click "+ Add Holding" to record your trades.</p>
        </div>
      ) : (
        <div className="portfolio-table-wrap">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Symbol & Company</th>
                <th>Exchange</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Avg Buy (₹)</th>
                <th className="text-right">Current Price (₹)</th>
                <th className="text-right">Total Invested</th>
                <th className="text-right">Current Value</th>
                <th className="text-right">P&L (₹)</th>
                <th className="text-right">Returns</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {holdingsWithMetrics.map((item) => {
                const isPos = item.pnl >= 0;
                return (
                  <tr key={item.id} className="stock-table-row">
                    <td>
                      <div className="table-company-cell">
                        <span
                          className="table-company-name cursor-pointer font-bold"
                          onClick={() => onSelectStock({ symbol: item.symbol, companyName: item.companyName })}
                        >
                          {item.symbol}
                        </span>
                        <span className="table-sector-tag">{item.companyName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`exchange-badge badge-${item.exchange.toLowerCase()}`}>
                        {item.exchange}
                      </span>
                    </td>
                    <td className="text-right mono-number">{item.quantity}</td>
                    <td className="text-right mono-number">{formatINR(item.buyPrice)}</td>
                    <td className="text-right mono-number font-semibold">
                      {formatINR(item.currentPrice)}
                    </td>
                    <td className="text-right mono-number">{formatINR(item.invested)}</td>
                    <td className="text-right mono-number font-semibold">
                      {formatINR(item.currentVal)}
                    </td>
                    <td
                      className={`text-right mono-number font-semibold ${
                        isPos ? 'text-pos' : 'text-neg'
                      }`}
                    >
                      {isPos ? '+' : ''}{formatINR(item.pnl)}
                    </td>
                    <td className="text-right">
                      <span className={`table-pct-badge ${isPos ? 'pos' : 'neg'}`}>
                        {isPos ? '+' : ''}{item.returnPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-delete-row"
                        onClick={() => handleDeleteHolding(item.id)}
                        title="Delete holding"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
