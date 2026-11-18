import React from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  ExternalLink,
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

export default function StockTable({
  stocks,
  sortField,
  sortDirection,
  onSort,
  onSelectStock,
  onAddToWatchlist,
  watchlist = [],
}) {
  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="sort-icon-muted" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} className="sort-icon-active" />
    ) : (
      <ArrowDown size={13} className="sort-icon-active" />
    );
  };

  return (
    <div className="table-responsive-wrapper">
      <table className="stock-table">
        <thead>
          <tr>
            <th className="text-center w-star">★</th>
            <th onClick={() => onSort('symbol')} className="sortable-th">
              <div className="th-content">
                <span>Symbol</span>
                {renderSortIcon('symbol')}
              </div>
            </th>
            <th onClick={() => onSort('companyName')} className="sortable-th">
              <div className="th-content">
                <span>Company Name</span>
                {renderSortIcon('companyName')}
              </div>
            </th>
            <th>Exchange</th>
            <th onClick={() => onSort('sector')} className="sortable-th">
              <div className="th-content">
                <span>Sector</span>
                {renderSortIcon('sector')}
              </div>
            </th>
            <th onClick={() => onSort('price')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>Current Price (₹)</span>
                {renderSortIcon('price')}
              </div>
            </th>
            <th className="text-right">Prev. Close</th>
            <th onClick={() => onSort('priceChange')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>Change (₹)</span>
                {renderSortIcon('priceChange')}
              </div>
            </th>
            <th onClick={() => onSort('percentChange')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>% Change</span>
                {renderSortIcon('percentChange')}
              </div>
            </th>
            <th className="text-right">Day High</th>
            <th className="text-right">Day Low</th>
            <th onClick={() => onSort('yearHigh')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>52W High</span>
                {renderSortIcon('yearHigh')}
              </div>
            </th>
            <th onClick={() => onSort('yearLow')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>52W Low</span>
                {renderSortIcon('yearLow')}
              </div>
            </th>
            <th onClick={() => onSort('volume')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>Volume</span>
                {renderSortIcon('volume')}
              </div>
            </th>
            <th className="text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isPos = stock.percentChange > 0;
            const isNeg = stock.percentChange < 0;
            const moveClass = isPos ? 'text-pos' : isNeg ? 'text-neg' : 'text-neutral';
            const inWatchlist = watchlist.includes(stock.symbol);

            return (
              <tr key={`${stock.symbol}-${stock.exchange}`} className="stock-table-row">
                <td className="text-center">
                  <button
                    type="button"
                    className={`btn-star-table ${inWatchlist ? 'active' : ''}`}
                    onClick={() => onAddToWatchlist(stock.symbol)}
                    title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    <Star
                      size={15}
                      fill={inWatchlist ? '#eab308' : 'none'}
                      color={inWatchlist ? '#eab308' : '#cbd5e1'}
                    />
                  </button>
                </td>
                <td className="font-semibold mono-number text-primary">
                  <span
                    className="clickable-link font-bold text-accent"
                    onClick={() => onSelectStock(stock)}
                  >
                    {stock.symbol}
                  </span>
                </td>
                <td>
                  <div className="table-company-cell">
                    <span
                      className="table-company-name clickable-link"
                      onClick={() => onSelectStock(stock)}
                    >
                      {stock.companyName}
                    </span>
                    <div className="table-subids">
                      {stock.nseSymbol && <span className="id-sub">NSE: {stock.nseSymbol}</span>}
                      {stock.bseSymbol && <span className="id-sub">BSE: {stock.bseSymbol}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`exchange-badge badge-${stock.exchange?.toLowerCase()}`}>
                    {stock.exchange}
                  </span>
                </td>
                <td>
                  <span className="table-sector-tag">{stock.sector || 'General'}</span>
                </td>
                <td className="text-right mono-number font-semibold">
                  {formatINR(stock.price)}
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.previousClose)}
                </td>
                <td className={`text-right mono-number ${moveClass}`}>
                  {formatChange(stock.priceChange)}
                </td>
                <td className={`text-right mono-number font-semibold ${moveClass}`}>
                  <span className={`table-pct-badge ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                    {formatChange(stock.percentChange)}%
                  </span>
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.dayHigh)}
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.dayLow)}
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.yearHigh)}
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.yearLow)}
                </td>
                <td className="text-right mono-number text-muted">
                  {stock.volume ? stock.volume.toLocaleString('en-IN') : 'Active'}
                </td>
                <td className="text-center">
                  <span className={`trend-icon-box ${moveClass}`}>
                    {isPos && <TrendingUp size={16} />}
                    {isNeg && <TrendingDown size={16} />}
                    {!isPos && !isNeg && <Minus size={16} />}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
