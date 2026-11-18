import React from 'react';
import { X, CheckCircle2, AlertCircle, Layers, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
}

export default function InteractiveSummaryModal({ modalType, data, onClose, onSelectStock }) {
  if (!modalType) return null;

  let title = '';
  let content = null;

  if (modalType === 'total-tracked') {
    title = 'Total Tracked Equities Breakdown';
    content = (
      <div>
        <div className="summary-breakdown-row">
          <div className="mini-box">
            <span className="lbl">Unique Companies</span>
            <strong className="mono-number">{data.totalUnique}</strong>
          </div>
          <div className="mini-box">
            <span className="lbl">NSE Symbols</span>
            <strong className="mono-number">{data.nseCount}</strong>
          </div>
          <div className="mini-box">
            <span className="lbl">BSE Scrip Codes</span>
            <strong className="mono-number">{data.bseCount}</strong>
          </div>
        </div>
        <h5 className="sub-title">Monitored Indian Companies:</h5>
        <div className="modal-stocks-list">
          {data.stocks.map((s) => (
            <div
              key={s.symbol}
              className="list-stock-item"
              onClick={() => {
                onSelectStock(s);
                onClose();
              }}
            >
              <div>
                <span className="stock-sym mono-number">{s.symbol}</span>
                <span className="stock-comp">{s.companyName}</span>
              </div>
              <div className="text-right">
                <span className="mono-number font-semibold">{formatINR(s.price)}</span>
                <span className="exchange-badge badge-nse">NSE: {s.nseSymbol || s.symbol}</span>
                <span className="exchange-badge badge-bse">BSE: {s.bseSymbol || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (modalType === 'positive-movers') {
    const posStocks = data.stocks.filter((s) => s.percentChange > 0);
    title = `Positive Movers (${posStocks.length} Stocks / ${data.positivePct}%)`;
    content = (
      <div>
        <p className="modal-desc">Companies demonstrating intraday price appreciation on the exchanges.</p>
        <div className="modal-stocks-list">
          {posStocks.map((s) => (
            <div
              key={s.symbol}
              className="list-stock-item"
              onClick={() => {
                onSelectStock(s);
                onClose();
              }}
            >
              <div>
                <span className="stock-sym mono-number">{s.symbol}</span>
                <span className="stock-comp">{s.companyName}</span>
              </div>
              <div className="text-right">
                <span className="mono-number font-semibold">{formatINR(s.price)}</span>
                <span className="text-pos mono-number font-bold">+{s.percentChange}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (modalType === 'negative-movers') {
    const negStocks = data.stocks.filter((s) => s.percentChange < 0);
    title = `Negative Movers (${negStocks.length} Stocks / ${data.negativePct}%)`;
    content = (
      <div>
        <p className="modal-desc">Companies trading below previous session closing marks today.</p>
        <div className="modal-stocks-list">
          {negStocks.map((s) => (
            <div
              key={s.symbol}
              className="list-stock-item"
              onClick={() => {
                onSelectStock(s);
                onClose();
              }}
            >
              <div>
                <span className="stock-sym mono-number">{s.symbol}</span>
                <span className="stock-comp">{s.companyName}</span>
              </div>
              <div className="text-right">
                <span className="mono-number font-semibold">{formatINR(s.price)}</span>
                <span className="text-neg mono-number font-bold">{s.percentChange}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (modalType === 'loaded-records') {
    title = 'Data Feed Diagnostics & Availability';
    content = (
      <div>
        <div className="summary-breakdown-row">
          <div className="mini-box">
            <span className="lbl">Total Requested</span>
            <strong className="mono-number">{data.totalRequested}</strong>
          </div>
          <div className="mini-box">
            <span className="lbl">Successfully Loaded</span>
            <strong className="mono-number text-pos">{data.loadedCount}</strong>
          </div>
          <div className="mini-box">
            <span className="lbl">Failed / Pending</span>
            <strong className="mono-number">{data.failedCount}</strong>
          </div>
          <div className="mini-box">
            <span className="lbl">Availability</span>
            <strong className="mono-number">{data.availabilityPct}%</strong>
          </div>
        </div>
        <p className="modal-desc">
          Provider: <strong>{data.provider}</strong> with server-side in-memory caching and resilient Promise.allSettled query resolution.
        </p>
      </div>
    );
  } else if (modalType === 'average-move') {
    title = `Watchlist Market Breadth (Avg Move: ${data.avgChange >= 0 ? '+' : ''}${data.avgChange}%)`;
    content = (
      <div>
        <p className="modal-desc">
          Arithmetic mean of percentage changes computed strictly across all {data.stocks.length} valid loaded stock records.
        </p>
        <div className="market-breadth-pills">
          <span className="breadth-pill pill-pos">Advancing: {data.positiveCount}</span>
          <span className="breadth-pill pill-neg">Declining: {data.negativeCount}</span>
          <span className="breadth-pill pill-neu">Unchanged: {data.neutralCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="interactive-summary-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{content}</div>
      </div>
    </div>
  );
}
