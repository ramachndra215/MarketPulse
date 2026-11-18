import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Building,
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

export default function MarketOverview({ onSelectStock }) {
  const [activeTab, setActiveTab] = useState('NSE'); // 'NSE' | 'BSE'
  const [mostActive, setMostActive] = useState([]);
  const [trending, setTrending] = useState({ topGainers: [], topLosers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarketData() {
      setLoading(true);
      try {
        const [activeRes, trendRes] = await Promise.allSettled([
          axios.get(`/api/stocks/most-active?exchange=${activeTab}`),
          axios.get(`/api/stocks/trending`),
        ]);

        if (activeRes.status === 'fulfilled' && activeRes.value.data?.data) {
          setMostActive(activeRes.value.data.data);
        }
        if (trendRes.status === 'fulfilled' && trendRes.value.data?.data) {
          setTrending(trendRes.value.data.data);
        }
      } catch (err) {
        console.error('Failed to load market overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarketData();
  }, [activeTab]);

  return (
    <div className="market-overview-view">
      {/* Top Indices Banner */}
      <div className="indices-grid">
        <div className="index-card">
          <div className="index-header">
            <span className="index-name">NIFTY 50</span>
            <span className="index-exchange">NSE Benchmark</span>
          </div>
          <div className="index-val mono-number">23,532.70</div>
          <div className="index-change pos mono-number">
            <ArrowUpRight size={14} /> +64.70 (+0.28%)
          </div>
        </div>

        <div className="index-card">
          <div className="index-header">
            <span className="index-name">BSE SENSEX</span>
            <span className="index-exchange">BSE Benchmark</span>
          </div>
          <div className="index-val mono-number">77,580.30</div>
          <div className="index-change pos mono-number">
            <ArrowUpRight size={14} /> +239.38 (+0.31%)
          </div>
        </div>

        <div className="index-card">
          <div className="index-header">
            <span className="index-name">BANK NIFTY</span>
            <span className="index-exchange">Banking Sector</span>
          </div>
          <div className="index-val mono-number">50,365.10</div>
          <div className="index-change pos mono-number">
            <ArrowUpRight size={14} /> +182.20 (+0.36%)
          </div>
        </div>

        <div className="index-card">
          <div className="index-header">
            <span className="index-name">NIFTY IT</span>
            <span className="index-exchange">Tech Sector</span>
          </div>
          <div className="index-val mono-number">42,120.45</div>
          <div className="index-change neg mono-number">
            <ArrowDownRight size={14} /> -112.50 (-0.27%)
          </div>
        </div>
      </div>

      {/* Exchange Most Active Section */}
      <div className="overview-section-box">
        <div className="section-head-row">
          <div>
            <h3 className="section-heading">
              Most Active Stocks ({activeTab})
            </h3>
            <p className="section-subtext">
              High volume liquidity leaders on {activeTab === 'NSE' ? 'National Stock Exchange' : 'Bombay Stock Exchange'} via IndianAPI.
            </p>
          </div>

          <div className="exchange-filter-pills">
            <button
              type="button"
              className={`filter-pill ${activeTab === 'NSE' ? 'active' : ''}`}
              onClick={() => setActiveTab('NSE')}
            >
              NSE Most Active
            </button>
            <button
              type="button"
              className={`filter-pill ${activeTab === 'BSE' ? 'active' : ''}`}
              onClick={() => setActiveTab('BSE')}
            >
              BSE Most Active
            </button>
          </div>
        </div>

        {loading ? (
          <div className="overview-loading-state">
            <Loader2 className="spin-icon" size={28} />
            <span>Retrieving {activeTab} most active stocks...</span>
          </div>
        ) : (
          <div className="most-active-grid">
            {mostActive.map((stock) => {
              const isPos = stock.percentChange > 0;
              const isNeg = stock.percentChange < 0;
              return (
                <div
                  key={stock.symbol}
                  className="most-active-card"
                  onClick={() => onSelectStock(stock)}
                >
                  <div className="card-row-top">
                    <span className="sym-tag mono-number">{stock.symbol}</span>
                    <span className={`exchange-badge badge-${activeTab.toLowerCase()}`}>
                      {activeTab}
                    </span>
                  </div>
                  <h4 className="comp-name" title={stock.companyName}>
                    {stock.companyName}
                  </h4>
                  <div className="price-row">
                    <span className="price-val mono-number">{formatINR(stock.price)}</span>
                    <span className={`delta-val mono-number ${isPos ? 'pos' : isNeg ? 'neg' : 'neu'}`}>
                      {isPos ? '+' : ''}{stock.percentChange}%
                    </span>
                  </div>
                  <div className="volume-footer">
                    <span>Vol: {stock.volume ? stock.volume.toLocaleString('en-IN') : 'Active'}</span>
                    <span className="rating-tag">{stock.overallRating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Gainers & Losers Grid */}
      <div className="trending-dual-grid">
        <div className="trending-box">
          <div className="trending-header pos-header">
            <TrendingUp size={18} />
            <h4>Top Gainers Today</h4>
          </div>
          <div className="trending-list">
            {trending.topGainers?.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                className="trending-item"
                onClick={() => onSelectStock(stock)}
              >
                <div>
                  <span className="item-symbol mono-number">{stock.symbol}</span>
                  <span className="item-name">{stock.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="item-price mono-number">{formatINR(stock.price)}</span>
                  <span className="item-delta text-pos mono-number">+{stock.percentChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trending-box">
          <div className="trending-header neg-header">
            <TrendingDown size={18} />
            <h4>Top Losers Today</h4>
          </div>
          <div className="trending-list">
            {trending.topLosers?.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                className="trending-item"
                onClick={() => onSelectStock(stock)}
              >
                <div>
                  <span className="item-symbol mono-number">{stock.symbol}</span>
                  <span className="item-name">{stock.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="item-price mono-number">{formatINR(stock.price)}</span>
                  <span className="item-delta text-neg mono-number">{stock.percentChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
