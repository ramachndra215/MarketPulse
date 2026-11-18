import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Layers,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  BrainCircuit,
  Scale,
  Newspaper,
  Briefcase,
  Bell,
  Settings,
  User,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onLogout,
  collapsed,
  onToggleCollapse,
  watchlistCount = 0,
  portfolioCount = 0,
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'market-overview', label: 'Market Overview', icon: LineChart },
    { id: 'all-stocks', label: 'All Indian Stocks', icon: Layers },
    { id: 'watchlist', label: 'My Watchlist', icon: Star, badge: watchlistCount },
    { id: 'top-gainers', label: 'Top Gainers', icon: TrendingUp },
    { id: 'top-losers', label: 'Top Losers', icon: TrendingDown },
    { id: 'stock-analysis', label: 'Stock Analysis', icon: Search },
    { id: 'ai-intelligence', label: 'AI Intelligence', icon: BrainCircuit, tag: 'AI' },
    { id: 'comparison', label: 'Stock Comparison', icon: Scale },
    { id: 'news-reports', label: 'News & Reports', icon: Newspaper },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase, badge: portfolioCount },
    { id: 'alerts', label: 'Alerts & Notices', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">MarketPulse</span>
            <span className="sidebar-version">v2.0</span>
          </div>
        )}
        <button
          type="button"
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  type="button"
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={19} className="sidebar-icon" />
                  {!collapsed && (
                    <span className="sidebar-label">{item.label}</span>
                  )}
                  {!collapsed && item.badge > 0 && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                  {!collapsed && item.tag && (
                    <span className="sidebar-tag">{item.tag}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <div className="user-profile-strip">
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            )}
            <button
              type="button"
              className="btn-logout"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={18} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-login-trigger"
            onClick={onOpenAuth}
            title="Sign In / Register"
          >
            <LogIn size={18} />
            {!collapsed && <span>Sign In / Register</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
