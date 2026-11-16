import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  return `${prefix}${val.toFixed(2)}`;
}

export default function StockTable({
  stocks,
  sortField,
  sortDirection,
  onSort,
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
            <th onClick={() => onSort('price')} className="sortable-th text-right">
              <div className="th-content justify-end">
                <span>Current Price (₹)</span>
                {renderSortIcon('price')}
              </div>
            </th>
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
            <th className="text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const isPos = stock.percentChange > 0;
            const isNeg = stock.percentChange < 0;
            const moveClass = isPos ? 'text-pos' : isNeg ? 'text-neg' : 'text-neutral';

            return (
              <tr key={`${stock.symbol}-${stock.exchange}`} className="stock-table-row">
                <td className="font-semibold mono-number text-primary">
                  {stock.symbol}
                </td>
                <td>
                  <div className="table-company-cell">
                    <span className="table-company-name">{stock.companyName}</span>
                    {stock.sector && (
                      <span className="table-sector-tag">{stock.sector}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`exchange-badge badge-${stock.exchange?.toLowerCase()}`}>
                    {stock.exchange}
                  </span>
                </td>
                <td className="text-right mono-number font-semibold">
                  {formatINR(stock.price)}
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
                  {formatINR(stock.yearHigh)}
                </td>
                <td className="text-right mono-number text-muted">
                  {formatINR(stock.yearLow)}
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
