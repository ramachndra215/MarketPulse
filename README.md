# MarketPulse – Real-Time Indian Stock Market Price Display

![MarketPulse Banner](https://img.shields.io/badge/MarketPulse-Indian%20Stock%20Market-0284c7?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite)
![Vercel](https://img.shields.io/badge/Vercel-Serverless%20Ready-black?style=for-the-badge&logo=vercel)

MarketPulse is a financial technology web application designed to track and display real-time and intraday stock market prices for premier blue-chip corporations listed on India's primary exchanges:

- **NSE** – National Stock Exchange of India
- **BSE** – Bombay Stock Exchange

The application integrates with **IndianAPI** (`https://indianapi.in`) as its primary provider with secure server-side authorization and resilient multi-source market quote fetching, providing genuine price discovery, 52-week metrics, dynamic search, multi-exchange filtering, and interactive sorting.

---

## Key Features

1. **Dual Exchange Support (NSE & BSE)**
   - Toggle instantly between National Stock Exchange and Bombay Stock Exchange valuations.
   - Distinctive visual identifiers and currency formatting in Indian Rupees (₹).

2. **Genuine Live Market Data**
   - Direct integration with **IndianAPI** (`https://stock.indianapi.in/stock`).
   - Secure server-side credential isolation (API key never exposed to client/browser).
   - Multi-source resilience via `Promise.allSettled`: if any single stock query encounters a provider limitation, all other successfully resolved stocks display without interruption.
   - Built-in live public quote fallback for instant out-of-the-box local testing.

3. **Core Indian Blue-Chip Watchlist**
   - **Reliance Industries** (`RELIANCE`) – Energy & Oil/Gas
   - **Tata Consultancy Services** (`TCS`) – Information Technology
   - **Infosys** (`INFY`) – Information Technology
   - **State Bank of India** (`SBIN`) – Financial Services
   - **HDFC Bank** (`HDFCBANK`) – Financial Services
   - **ICICI Bank** (`ICICIBANK`) – Financial Services
   - **Larsen & Toubro** (`LT`) – Capital Goods / Infrastructure
   - **ITC** (`ITC`) – FMCG

4. **Dynamic FinTech Dashboard UI**
   - **Dark Navy Executive Header** with live Indian Standard Time (IST) clock and trading session status (Market Open, Pre-Market, Market Closed, Weekend).
   - **Summary Cards**: Real-time counts for Total Tracked, Positive Movers (Advancing), Negative Movers (Declining), Loaded Records, and Average Watchlist Movement (Breadth).
   - **52-Week Range Bar**: Visual gauge illustrating where current trading values sit relative to 52-week lows and highs.
   - **Search & Sector Filtering**: Instant query by symbol or company name, plus sector filtering (IT, Banking, Energy, FMCG, Infra).
   - **Dual Display Modes**: Switch between responsive **Card Grid** and **Sortable Data Table** (sort by symbol, name, price, change, %, 52W high/low).

5. **Automated & Manual Refresh Controls**
   - 5-minute periodic auto-refresh countdown with pause/resume controls.
   - Manual one-click refresh with visual loading animations and background cache refresh.
   - Cache protection: retains previously loaded prices if a network disconnection occurs.

6. **Vercel Serverless Ready**
   - Native `/api/stocks` serverless function configuration (`api/stocks.js` + `vercel.json`).
   - Reusable stock normalization architecture shared between local Express server and Vercel cloud runtime.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript ES6+, HTML5, CSS3 (Modern Flexbox/Grid), Axios, Lucide React Icons |
| **Backend** | Node.js (v18+), Express.js, Axios, dotenv, CORS |
| **API Provider** | IndianAPI (`https://stock.indianapi.in`), Live Market Feed |
| **Deployment** | Vercel Serverless Functions, Vite Static Single-Page Application (SPA) |

---

## Project Structure

```text
stock-market-app/
│
├── api/
│   └── stocks.js           # Vercel Serverless Function handler
│
├── server/
│   ├── .env.example        # Environment variable template
│   ├── .env                # Local secrets (git-ignored)
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Local Express development server
│   └── stockService.js     # Shared stock fetching & normalization logic
│
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Dark navy header, market status, IST clock
│   │   ├── SearchBar.jsx   # Search input, exchange toggle, sector chips
│   │   ├── StockCard.jsx   # Stock card with 52W range gauge & metrics
│   │   └── StockTable.jsx  # Sortable tabular view for equities
│   │
│   ├── App.jsx             # Main dashboard state & orchestration
│   ├── App.css             # FinTech component design styles
│   ├── index.css           # Global typography & root variables
│   └── main.jsx            # React root mount
│
├── index.html              # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json            # Frontend Vite dependencies and scripts
├── vite.config.js          # Vite configuration with /api backend proxy
├── vercel.json             # Vercel deployment routing specification
├── .gitignore              # Git ignore rules for node_modules and .env
└── README.md               # Complete setup, API, and deployment documentation
```

---

## Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18.0.0 or higher recommended, tested on v24)
- **npm** (v9.0.0 or higher)
- PowerShell (Windows) or Bash (macOS/Linux)

---

## Step-by-Step Installation & Execution (PowerShell)

### Step 1: Open the Project Folder

```powershell
cd stock-market-app
```

### Step 2: Install Frontend Dependencies

```powershell
npm install
```

### Step 3: Install Backend Dependencies

```powershell
cd server
npm install
cd ..
```

### Step 4: Configure the API Key

Create your local backend environment configuration:

```powershell
Copy-Item server/.env.example server/.env
```

Open `server/.env` in your text editor. It contains:

```env
PORT=5000
API_BASE_URL=https://stock.indianapi.in
INDIAN_API_KEY=your_actual_api_key_here
ENABLE_PUBLIC_FALLBACK=true
```

> **API Key Setup:**
> 1. Visit [https://indianapi.in/](https://indianapi.in/) and sign up for an API account.
> 2. Copy your API Key from the IndianAPI developer console.
> 3. Paste it as `INDIAN_API_KEY=your_key_here` in `server/.env`.
> 4. If you leave `INDIAN_API_KEY` blank, MarketPulse automatically activates its genuine Live Public Market Feed so you can test and view live Indian equity prices immediately.

### Step 5: Start the Backend Server (Terminal 1)

Open **Terminal 1** in VS Code / PowerShell:

```powershell
cd stock-market-app/server
npm start
```

The Express server will start on:

```text
http://localhost:5000
```

Verify the backend health at:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/stocks?exchange=NSE`

### Step 6: Start the Frontend Application (Terminal 2)

Open **Terminal 2** in VS Code / PowerShell:

```powershell
cd stock-market-app
npm run dev
```

The Vite development server will start at:

```text
http://localhost:5173
```

Vite is configured with a reverse proxy: all requests from React to `/api/*` are forwarded seamlessly to `http://localhost:5000/api/*`.

---

## Production Build & Preview

To verify the production build locally:

### Step 7: Build for Production

```powershell
npm run build
```

This compiles optimized static assets into the `dist/` directory.

### Step 8: Preview the Production Build

```powershell
npm run preview
```

---

## Vercel Deployment Guide

MarketPulse is architected for zero-configuration Vercel deployment:

1. **Push to GitHub**:
   Ensure you commit only tracked source code. Never commit `.env` or `server/.env` (guarded by `.gitignore`).
   ```powershell
   git init
   git add .
   git commit -m "Initial commit: MarketPulse Indian Stock Market Dashboard"
   git branch -M main
   git remote add origin https://github.com/<your-username>/marketpulse.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
   - Select your GitHub repository (`marketpulse`).
   - If the root directory is `stock-market-app`, set **Root Directory** to `stock-market-app` (or deploy from repository root).
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.

3. **Configure Environment Variables in Vercel**:
   In Vercel **Settings → Environment Variables**, add:
   - `INDIAN_API_KEY` = `your_actual_indianapi_key`
   - `API_BASE_URL` = `https://stock.indianapi.in`
   - `ENABLE_PUBLIC_FALLBACK` = `true`

4. **Deploy**:
   Click **Deploy**. Vercel will build the React SPA and deploy `api/stocks.js` as a serverless endpoint handling `/api/stocks`.

---

## API Architecture & Response Normalization

### Endpoint: `GET /api/stocks`

**Query Parameters:**
- `exchange` (optional): `NSE` (default) or `BSE`
- `refresh` (optional): `true` to bypass cache

**Normalized JSON Response Structure:**

```json
{
  "success": true,
  "exchange": "NSE",
  "timestamp": "2026-11-16T15:15:00.000Z",
  "provider": "IndianAPI (Official)",
  "isKeyConfigured": true,
  "total": 8,
  "successfulCount": 8,
  "failedCount": 0,
  "data": [
    {
      "symbol": "RELIANCE",
      "companyName": "Reliance Industries Limited",
      "exchange": "NSE",
      "currency": "₹",
      "price": 1340.10,
      "priceChange": 0.40,
      "percentChange": 0.03,
      "movement": "positive",
      "yearHigh": 1611.80,
      "yearLow": 1152.20,
      "dayHigh": 1347.30,
      "dayLow": 1333.80,
      "previousClose": 1339.70,
      "sector": "Energy & Oil/Gas",
      "dataSource": "IndianAPI (Official)",
      "lastUpdated": "2026-11-16T15:15:00.000Z"
    }
  ],
  "errors": []
}
```

---

## Security & Best Practices

- **Zero Client Credential Leakage**: The IndianAPI key is stored strictly on the server (`server/.env` or Vercel serverless environment variables). No `VITE_` prefix is used, preventing browser bundling.
- **In-Memory Cache**: 60-second server cache prevents exhausting API rate limits on rapid refreshes.
- **Input Validation**: Validates all incoming exchange parameters (`NSE` or `BSE`) and sanitizes inputs.
- **Resilient Batch Processing**: Utilizes `Promise.allSettled` so individual provider errors never cause complete dashboard failure.

---

## Indian Stock Market Hours Reference

| Session | Hours (Indian Standard Time - IST / UTC+5:30) |
| :--- | :--- |
| **Pre-Market Session** | 09:00 AM – 09:08 AM IST (Order entry) / 09:08 AM – 09:15 AM (Order matching) |
| **Regular Trading Hours** | 09:15 AM – 03:30 PM IST (Monday through Friday) |
| **Market Closed** | Evenings, Nights, Saturdays, Sundays, and NSE/BSE Official Holidays |

The dashboard header automatically evaluates current IST time and highlights market trading session status in real time.

---

## Disclaimer

**Educational & Informational Use Only:** MarketPulse is built for educational, analytical, and portfolio presentation purposes. Stock prices, market movements, and financial indicators displayed within this application are sourced from third-party APIs and are subject to network latency, exchange delays, or provider quotas. Do not use this software for active commercial trading or investment execution.
