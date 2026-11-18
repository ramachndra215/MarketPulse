import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  User,
  LogIn,
} from 'lucide-react';

export default function Header({
  selectedExchange,
  onSelectExchange,
  isKeyConfigured,
  providerName,
  user,
  onOpenAuth,
  onRefresh,
  refreshing,
}) {
  const [istTime, setIstTime] = useState('');
  const [marketStatus, setMarketStatus] = useState({
    status: 'CALCULATING',
    label: 'Checking Hours...',
    isOpen: false,
    colorClass: 'status-closed',
  });

  // Calculate Indian Market Hours (09:15 - 15:30 IST, Mon-Fri)
  useEffect(() => {
    function updateMarketStatus() {
      const now = new Date();
      // Calculate IST time (UTC + 5 hours 30 minutes)
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utcTime + 330 * 60000);

      const day = istDate.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const currentTimeInMinutes = hours * 60 + minutes;

      const timeStr = istDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setIstTime(timeStr);

      if (day === 0 || day === 6) {
        setMarketStatus({
          status: 'WEEKEND',
          label: 'Market Closed (Weekend)',
          isOpen: false,
          colorClass: 'status-closed',
        });
      } else if (currentTimeInMinutes >= 540 && currentTimeInMinutes < 555) {
        // 09:00 to 09:15
        setMarketStatus({
          status: 'PRE_OPEN',
          label: 'Pre-Market Session',
          isOpen: true,
          colorClass: 'status-pre',
        });
      } else if (currentTimeInMinutes >= 555 && currentTimeInMinutes <= 930) {
        // 09:15 to 15:30
        setMarketStatus({
          status: 'OPEN',
          label: 'Market Open (Live)',
          isOpen: true,
          colorClass: 'status-open',
        });
      } else {
        setMarketStatus({
          status: 'CLOSED',
          label: 'Market Closed',
          isOpen: false,
          colorClass: 'status-closed',
        });
      }
    }

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header-container">
      <div className="header-inner">
        {/* Brand Group */}
        <div className="brand-group">
          <div className="brand-logo">
            <Activity className="brand-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">MarketPulse</h1>
              <span className="live-tag">
                <span className="live-pulse"></span>
                INDIA (NSE & BSE)
              </span>
            </div>
            <p className="brand-subtitle">Indian Stock Market Intelligence Platform</p>
          </div>
        </div>

        {/* Center: Live Market Hours Status & IST Clock */}
        <div className="market-status-box">
          <div className="status-indicator-row">
            <span className={`status-dot ${marketStatus.colorClass}`}></span>
            <span className="status-label">{marketStatus.label}</span>
          </div>
          <div className="ist-time-row">
            <Clock size={13} className="time-icon" />
            <span className="ist-time mono-number">IST: {istTime || '--:--:--'}</span>
            <span className="hours-note">09:15 - 15:30 IST</span>
          </div>
        </div>

        {/* Exchange Selector & Top Action Buttons */}
        <div className="header-actions">
          <div className="exchange-selector">
            <span className="exchange-label">Market:</span>
            <div className="exchange-pills">
              <button
                type="button"
                className={`exchange-pill ${selectedExchange === 'ALL' ? 'active' : ''}`}
                onClick={() => onSelectExchange('ALL')}
                title="Combined NSE and BSE valuation view"
              >
                All
              </button>
              <button
                type="button"
                className={`exchange-pill ${selectedExchange === 'NSE' ? 'active' : ''}`}
                onClick={() => onSelectExchange('NSE')}
                title="National Stock Exchange of India"
              >
                NSE
              </button>
              <button
                type="button"
                className={`exchange-pill ${selectedExchange === 'BSE' ? 'active' : ''}`}
                onClick={() => onSelectExchange('BSE')}
                title="Bombay Stock Exchange"
              >
                BSE
              </button>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            className="btn-header-refresh"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh prices"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
          </button>

          {/* Provider Badge */}
          <div
            className={`provider-badge ${
              isKeyConfigured ? 'provider-official' : 'provider-fallback'
            }`}
            title="Authenticated with IndianAPI"
          >
            <ShieldCheck size={14} />
            <span>{providerName || 'IndianAPI'}</span>
          </div>

          {/* User Profile / Auth Pill */}
          {user ? (
            <div className="header-user-pill" title={`Logged in as ${user.name}`}>
              <div className="user-avatar-circle">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="header-user-name">{user.name.split(' ')[0]}</span>
            </div>
          ) : (
            <button
              type="button"
              className="btn-header-auth"
              onClick={onOpenAuth}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
