# MarketPulse – Real-Time Indian Stock Market Price Display & Intelligence Platform

![MarketPulse Banner](https://img.shields.io/badge/MarketPulse-v2.0%20Intelligence%20Platform-0284c7?style=for-the-badge)
![NSE & BSE](https://img.shields.io/badge/Exchanges-NSE%20%7C%20BSE-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite)
![IndianAPI](https://img.shields.io/badge/API-IndianAPI%20Official-orange?style=for-the-badge)

MarketPulse is an enterprise-grade financial technology and stock market intelligence web platform designed to track, analyze, and display real-time and intraday stock market prices for premier blue-chip corporations listed across India's primary exchanges:

- **NSE** – National Stock Exchange of India
- **BSE** – Bombay Stock Exchange

The application integrates with **IndianAPI** (`https://stock.indianapi.in`) with secure server-side authorization, in-memory caching, multi-exchange support, interactive SVG multi-period price charts, fundamental financial statements, an AI Stock Intelligence engine, portfolio management, and persistent user watchlists.

---

## What's New in v2.0 (Phase 1–13 Implementation)

1. **Complete Diagnosis and Fix for BSE Stocks**:
   - Resolved the issue where BSE stocks were previously returning 0 records when filtered.
   - Discovered and integrated native IndianAPI BSE endpoints:
     - `GET /BSE_most_active` (returns live quotes with `.BO` BSE tickers)
     - `GET /stock?name=...` (returns dual `currentPrice.NSE` and `currentPrice.BSE`, plus BSE Scrip Codes)
   - Created a 3-way exchange toggle: **All Exchanges**, **NSE**, and **BSE**.
   - Dual exchange identifier support (e.g. Reliance: NSE `RELIANCE` / BSE `500325`, Tata Motors: NSE `TATAMOTORS` / BSE `500570`).

2. **Master Stock Universe Expansion**:
   - Expanded to 27+ premier Indian blue chips across 10 sectors (Banking, IT, Energy, FMCG, Auto, Telecom, Pharma, Infra, Metals, Conglomerate).
   - Each stock tracks verified NSE symbol, BSE scrip code, official company name, sector, and 52-week metrics.

3. **Interactive Summary Cards (5 Key Metrics)**:
   - **Total Tracked**: Opens the full equities table modal with market breakdown.
   - **Positive Movers**: Automatically filters the dashboard to show advancing stocks.
   - **Negative Movers**: Automatically filters the dashboard to show declining stocks.
   - **Loaded Records**: Opens API health, cache status, and latency diagnostics modal.
   - **Market Breadth / Average Movement**: Opens an advance-to-decline ratio and breadth modal.

4. **15-Item Functional Sidebar Navigation**:
   - Collapsible desktop & mobile sidebar supporting:
     1. Dashboard Overview
     2. Market Overview (Indices + Most Active + Trending)
     3. All Stocks (Universe)
     4. Personal Watchlist
     5. Top Gainers
     6. Top Losers
     7. Stock Analysis
     8. AI Intelligence
     9. Stock Comparison (Up to 4 stocks side-by-side)
     10. News & Market Reports
     11. Portfolio Tracker
     12. Price Alerts
     13. Platform Settings
     14. User Profile
     15. User Authentication / Logout

5. **Company Details Modal & Interactive SVG Price Charts**:
   - Multi-period historical charts (`1D`, `5D`, `1M`, `6M`, `1Y`, `3Y`, `5Y`, `MAX`).
   - Resolves valid IndianAPI `/historical_data` periods (`1m, 6m, 1yr, 3yr, 5yr, max`).
   - Dynamic SVG rendering with price path, gradient area fill, and high/low points.
   - Key fundamental metrics: Market Cap, P/E Ratio, P/B Ratio, Dividend Yield, EPS, Beta, 52W High/Low.
   - Financial statements: Annual & Quarterly P&L, Balance Sheets, and Cash Flow statements.
   - Shareholding pattern distribution (Promoter, FII, DII, Public, Others).

6. **AI Stock Intelligence Engine**:
   - Built-in financial intelligence algorithm generating 8 structured analytical dimensions:
     1. Executive Summary & Company Profile
     2. Recent Price Performance & Intraday Momentum
     3. Core Strengths & Moats
     4. Weaknesses & Operational Headwinds
     5. Key Risk Factors
     6. Fundamental Valuation Indicators (P/E vs. Sector, 52W Range)
     7. Growth Drivers & Catalysts
     8. Plain-English Strategic Outlook (Bullish / Neutral / Bearish)
   - AI Sector Peer Suggestions with one-click comparison.

7. **Multi-Stock Comparison Matrix**:
   - Compare up to 4 equities side-by-side across Price, Change %, 52-Week Range, Valuation, Sector, and Exchange availability.

8. **User Portfolio & Watchlist Tracker**:
   - Lightweight file-based persistent backend storage (`server/data/users.json` and `server/data/userData.json`).
   - Secure salted PBKDF2 password hashing.
   - Add/delete portfolio holdings with Buy Price, Quantity, Investment Value, Current Valuation, Absolute P&L, and Percentage Return.
   - Toggle stock watchlist with instant star icon sync.

9. **Live Market News & Trending Equities**:
   - Native integration with IndianAPI `GET /news` and `GET /trending`.
   - Displays top 10 intraday gainers, top 10 losers, and categorized market news articles.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript ES6+, HTML5, Modern CSS3 Flexbox/Grid, Axios, Lucide React Icons |
| **Backend** | Node.js (v18+), Express.js, Axios, dotenv, CORS, Crypto (PBKDF2) |
| **API Provider** | IndianAPI (`https://stock.indianapi.in`) with genuine live market endpoints |
| **Deployment** | Vercel Serverless Functions (`api/stocks.js`), Vite Single-Page Application |

---

## Project Structure

```text
stock-market-app/
│
├── api/
│   └── stocks.js                       # Vercel Serverless Function handler
│
├── server/
│   ├── data/
│   │   ├── users.json                  # Persistent registered user credentials
│   │   └── userData.json               # Persistent user watchlists & portfolios
│   ├── .env.example                    # Environment variable template
│   ├── .env                            # Local secrets (git-ignored)
│   ├── package.json                    # Backend dependencies
│   ├── server.js                       # RESTful Express backend server
│   ├── stockService.js                 # IndianAPI service & stock normalization
│   └── userService.js                  # User authentication & portfolio service
│
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx               # Login & Register modal dialog
│   │   ├── CompanyModal.jsx            # Deep fundamentals, SVG charts & AI analysis
│   │   ├── Header.jsx                  # Navy header, IST clock, exchange selector
│   │   ├── InteractiveSummaryModal.jsx # Detail modals for the 5 summary cards
│   │   ├── MarketOverview.jsx          # Live indices, most active & trending
│   │   ├── NewsSection.jsx             # Live financial news grid
│   │   ├── PortfolioView.jsx           # Portfolio tracking & P&L calculator
│   │   ├── SearchBar.jsx               # Universal search, filters & view toggle
│   │   ├── Sidebar.jsx                 # 15-item collapsible navigation sidebar
│   │   ├── StockCard.jsx               # Equity card with 52W gauge & dual badges
│   │   ├── StockComparison.jsx         # Multi-stock side-by-side comparison
│   │   └── StockTable.jsx              # 15-column sortable table with star toggle
│   │
│   ├── App.jsx                         # Main application state orchestration
│   ├── App.css                         # FinTech design system styles
│   ├── index.css                       # Global CSS variables & typography
│   └── main.jsx                        # React root entry
│
├── index.html                          # HTML5 shell (Plus Jakarta Sans & JetBrains Mono)
├── package.json                        # Frontend dependencies & scripts
├── vite.config.js                      # Vite proxy configuration
├── vercel.json                         # Vercel deployment routing
├── .gitignore                          # Git ignore rules
└── README.md                           # Master documentation
```

---

## Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, API key verification, and server uptime |
| `GET` | `/api/stocks` | Watchlist stocks with `exchange=ALL`, `NSE`, or `BSE` |
| `GET` | `/api/stocks/most-active` | Most active stocks on `BSE` or `NSE` |
| `GET` | `/api/stocks/trending` | Top 10 gainers and top 10 losers |
| `GET` | `/api/stocks/details/:symbol`| Comprehensive financials, statements & ratios |
| `GET` | `/api/stocks/history/:symbol`| Historical prices for SVG chart (`1m, 6m, 1yr, 3yr, 5yr, max`) |
| `GET` | `/api/stocks/ai-analysis/:symbol`| 8-dimension structured AI financial analysis |
| `GET` | `/api/stocks/ai-suggestions/:symbol`| AI sector peer recommendations |
| `GET` | `/api/stocks/compare` | Multi-stock comparison matrix (`symbols=RELIANCE,TCS,INFY`) |
| `GET` | `/api/news` | Real-time Indian market news articles |
| `POST` | `/api/auth/register` | User account registration |
| `POST` | `/api/auth/login` | User login & session token generation |
| `GET` | `/api/user/profile` | Current user profile details |
| `GET` | `/api/user/watchlist` | Get user's saved stock symbols |
| `POST` | `/api/user/watchlist` | Toggle stock in user's watchlist |
| `GET` | `/api/user/portfolio` | Get user's portfolio holdings |
| `POST` | `/api/user/portfolio` | Add equity purchase to portfolio |
| `DELETE`| `/api/user/portfolio/:id` | Remove holding from portfolio |

---

## Running the Application Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Windows PowerShell / macOS Terminal

### Step 1: Open the Project Directory
```powershell
cd "stock-market-app"
```

### Step 2: Install Dependencies
```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `server/.env` and add your IndianAPI key:
```powershell
Copy-Item server/.env.example server/.env
```
Ensure `server/.env` contains:
```env
PORT=5000
API_BASE_URL=https://stock.indianapi.in
INDIAN_API_KEY=your_actual_api_key_here
ENABLE_PUBLIC_FALLBACK=true
```

### Step 4: Start the Backend Server (Terminal 1)
```powershell
cd server
node server.js
```
The backend starts on `http://localhost:5000`.

### Step 5: Start the Frontend Application (Terminal 2)
```powershell
npm run dev
```
The Vite development server starts on `http://localhost:5173`. Open your browser to explore the dashboard.

### Step 6: Verify Production Build
```powershell
npm run build
```
Builds optimized production assets to `dist/` with 0 errors.

---

## Testing the BSE Integration

To verify that BSE stocks are operating correctly:

1. In the top Header or Search Bar, click the **BSE** filter pill.
2. The dashboard updates to display BSE quotes and scrip codes (`500325`, `500570`, `532540`, etc.).
3. Open the **Market Overview** tab in the sidebar and click **BSE Most Active** to see live high-volume BSE equities like `YESB.BO`, `SUZL.BO`, `PNBK.BO`, and `RELI.BO`.
4. Click on any stock card to open the **Company Details Modal** and view live BSE pricing alongside NSE.

---

## Security & Best Practices

- **Zero Client Credential Leakage**: The `INDIAN_API_KEY` is isolated strictly in `server/.env` and is never exposed to the client or embedded in the bundle.
- **In-Memory Cache**: 60-second caching prevents hitting IndianAPI rate limits on frequent user requests.
- **Safe Fallback**: Resilient `Promise.allSettled` fetching ensures single-symbol failures never break the entire dashboard.
- **Salted Password Storage**: User passwords in `server/data/users.json` are hashed using PBKDF2 with unique cryptographic salts.

---

## Indian Stock Market Trading Hours Reference

| Session | Hours (IST / UTC+5:30) |
| :--- | :--- |
| **Pre-Market Session** | 09:00 AM – 09:15 AM IST |
| **Regular Trading Hours** | 09:15 AM – 03:30 PM IST (Monday through Friday) |
| **Post-Market / Closed** | 03:30 PM onwards, Weekends, and Official NSE/BSE Holidays |

The dashboard header automatically evaluates Indian Standard Time (IST) and displays market status with color-coded live indicators.

---

## Disclaimer

**Educational & Informational Use Only:** MarketPulse is built for educational, analytical, and research purposes. Stock prices, market movements, and financial indicators displayed within this application are sourced from third-party APIs and are subject to market volatility and provider quotas. Do not use this software for active commercial trading or financial investment execution.
