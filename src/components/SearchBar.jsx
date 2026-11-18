import React from 'react';
import { Search, X, LayoutGrid, Table, Filter } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  selectedExchange,
  onExchangeChange,
  viewMode,
  onViewModeChange,
  totalStocks,
  filteredCount,
  selectedSector,
  onSectorChange,
  sectors = [],
}) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-top">
        {/* Main Search Input */}
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by company, symbol, or BSE code (e.g. Tata Motors, RELIANCE, 500325, 544569)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Exchange Filter Radio / Buttons */}
        <div className="filter-group">
          <div className="exchange-filter-pills">
            <button
              type="button"
              className={`filter-pill ${selectedExchange === 'ALL' ? 'active' : ''}`}
              onClick={() => onExchangeChange('ALL')}
            >
              All Exchanges
            </button>
            <button
              type="button"
              className={`filter-pill ${selectedExchange === 'NSE' ? 'active' : ''}`}
              onClick={() => onExchangeChange('NSE')}
            >
              NSE
            </button>
            <button
              type="button"
              className={`filter-pill ${selectedExchange === 'BSE' ? 'active' : ''}`}
              onClick={() => onExchangeChange('BSE')}
            >
              BSE
            </button>
          </div>

          {/* View Mode Toggle: Grid Cards vs Table */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={17} />
              <span className="view-btn-text">Cards</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              <Table size={17} />
              <span className="view-btn-text">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sector Pills and Results Count Row */}
      <div className="search-bar-bottom">
        <div className="sector-chips">
          <span className="sector-label">
            <Filter size={13} /> Sector:
          </span>
          <button
            type="button"
            className={`sector-chip ${selectedSector === 'ALL' ? 'active' : ''}`}
            onClick={() => onSectorChange('ALL')}
          >
            All
          </button>
          {sectors.map((sec) => (
            <button
              key={sec}
              type="button"
              className={`sector-chip ${selectedSector === sec ? 'active' : ''}`}
              onClick={() => onSectorChange(sec)}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="results-counter">
          Showing <strong>{filteredCount}</strong> of <strong>{totalStocks}</strong> stocks
        </div>
      </div>
    </div>
  );
}
