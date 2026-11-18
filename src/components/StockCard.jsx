import React from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Star, PlusCircle, ArrowUpRight } from 'lucide-react';

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

export default function StockCard({
  stock,
  onSelectStock,
  onAddToWatchlist,
  isInWatchlist,
  onAddToPortfolio,
}) {
  const isPositive = stock.percentChange > 0;
  const isNegative = stock.percentChange < 0;
  const isNeutral = stock.percentChange === 0 || stock.percentChange === null;
  const movementClass = isPositive ? 'pos' : isNegative ? 'neg' : 'neu';

  // 52-week range percentage
  let rangePercent = 50;
  if (
    stock.yearHigh !== null &&
    stock.yearLow !== null &&
    stock.yearHigh > stock.yearLow &&
    stock.price !== null
  ) {
    rangePercent = Math.min(
      100,
      Math.max(0, ((stock.price - stock.yearLow) / (stock.yearHigh - stock.yearLow)) * 100)
    );
  }

  const updatedDate = stock.lastUpdated ? new Date(stock.lastUpdated) : null;
  const formattedTime = updatedDate
    ? updatedDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : 'Recently';

  return (
    <div className={`stock-card ${movementClass}`}>
      {/* Top Card Header */}
      <div className="card-top">
        <div className="card-identity cursor-pointer" onClick={() => onSelectStock(stock)}>
          <div className="card-title-row">
            <h3 className="stock-symbol mono-number">{stock.symbol}</h3>
            <span className="exchange-badge badge-nse">
              NSE: {stock.nseSymbol || stock.symbol}
            </span>
            {stock.bseSymbol && (
              <span className="exchange-badge badge-bse">
                BSE: {stock.bseSymbol}
              </span>
            )}
          </div>
          <h4 className="stock-company-name" title={stock.companyName}>
            {stock.companyName}
          </h4>
        </div>

        {/* Movement Badge & Quick Watchlist Star */}
        <div className="card-actions-top">
          <button
            type="button"
            className={`btn-star-card ${isInWatchlist ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToWatchlist(stock.symbol);
            }}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Star
              size={15}
              fill={isInWatchlist ? '#eab308' : 'none'}
              color={isInWatchlist ? '#eab308' : '#94a3b8'}
            />
          </button>
          <div className={`movement-pill ${movementClass}`}>
            {isPositive && <TrendingUp size={15} />}
            {isNegative && <TrendingDown size={15} />}
            {isNeutral && <Minus size={15} />}
            <span className="mono-number">{formatChange(stock.percentChange)}%</span>
          </div>
        </div>
      </div>

      {/* Sector Badge */}
      {stock.sector && (
        <div className="card-sector-row">
          <span className="card-sector-badge">{stock.sector}</span>
          {stock.industry && <span className="card-industry-tag">{stock.industry}</span>}
        </div>
      )}

      {/* Main Price Row */}
      <div
        className="card-price-section cursor-pointer"
        onClick={() => onSelectStock(stock)}
      >
        <div className="current-price mono-number">
          {stock.price !== null ? formatINR(stock.price) : 'Price Unavailable'}
        </div>
        <div className={`price-delta mono-number ${movementClass}`}>
          <span>{formatChange(stock.priceChange)}</span>
          <span className="delta-pct">({formatChange(stock.percentChange)}%)</span>
        </div>
      </div>

      {/* 52-Week High/Low Range Track */}
      <div className="range-container">
        <div className="range-labels">
          <span className="range-label">
            52W L: <strong className="mono-number">{formatINR(stock.yearLow)}</strong>
          </span>
          <span className="range-title">52-Week Range</span>
          <span className="range-label">
            52W H: <strong className="mono-number">{formatINR(stock.yearHigh)}</strong>
          </span>
        </div>
        <div className="range-track">
          <div className="range-fill" style={{ width: `${rangePercent}%` }}></div>
          <div className="range-indicator" style={{ left: `${rangePercent}%` }}></div>
        </div>
      </div>

      {/* Day Stats Row */}
      <div className="card-stats-grid">
        <div className="stat-item">
          <span className="stat-label">Day High</span>
          <span className="stat-val mono-number">
            {stock.dayHigh !== undefined && stock.dayHigh !== null
              ? formatINR(stock.dayHigh)
              : 'N/A'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Day Low</span>
          <span className="stat-val mono-number">
            {stock.dayLow !== undefined && stock.dayLow !== null
              ? formatINR(stock.dayLow)
              : 'N/A'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Prev. Close</span>
          <span className="stat-val mono-number">
            {stock.previousClose !== undefined && stock.previousClose !== null
              ? formatINR(stock.previousClose)
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Card Footer: Detailed view trigger & timestamp */}
      <div className="card-footer">
        <span className="update-time">
          <Calendar size={12} /> {formattedTime}
        </span>
        <button
          type="button"
          className="btn-card-details"
          onClick={() => onSelectStock(stock)}
        >
          <span>Deep Intelligence</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
