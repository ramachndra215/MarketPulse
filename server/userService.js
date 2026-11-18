import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_DATA_FILE = path.join(DATA_DIR, 'userData.json');

// Ensure data files exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USER_DATA_FILE)) {
    fs.writeFileSync(USER_DATA_FILE, JSON.stringify({}, null, 2));
  }
}

initStorage();

function readJson(file, fallback) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to write to ${file}:`, err.message);
  }
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = readJson(USERS_FILE, []);

  if (users.find((u) => u.email === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const id = 'usr_' + crypto.randomUUID().slice(0, 8);
  const token = 'token_' + crypto.randomBytes(24).toString('hex');

  const newUser = {
    id,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    salt,
    token,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeJson(USERS_FILE, users);

  // Initialize user portfolio and watchlist
  const userData = readJson(USER_DATA_FILE, {});
  userData[id] = {
    watchlist: ['RELIANCE', 'TCS', 'TATAMOTORS', 'HDFCBANK'],
    portfolio: [
      {
        id: 'port_1',
        symbol: 'TATAMOTORS',
        companyName: 'Tata Motors Limited',
        exchange: 'NSE',
        quantity: 25,
        buyPrice: 410.5,
        buyDate: '2026-09-15',
      },
      {
        id: 'port_2',
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        exchange: 'NSE',
        quantity: 15,
        buyPrice: 1120.0,
        buyDate: '2026-10-02',
      },
    ],
    alerts: [],
    preferences: { defaultExchange: 'NSE', theme: 'navy' },
  };
  writeJson(USER_DATA_FILE, userData);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    token: newUser.token,
  };
}

export function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const users = readJson(USERS_FILE, []);
  const user = users.find((u) => u.email === cleanEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const checkHash = hashPassword(password, user.salt);
  if (checkHash !== user.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  // Refresh token on login
  user.token = 'token_' + crypto.randomBytes(24).toString('hex');
  writeJson(USERS_FILE, users);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    token: user.token,
  };
}

export function getUserByToken(token) {
  if (!token) return null;
  const users = readJson(USERS_FILE, []);
  const user = users.find((u) => u.token === token);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function getUserWatchlist(userId) {
  const userData = readJson(USER_DATA_FILE, {});
  return userData[userId]?.watchlist || ['RELIANCE', 'TCS', 'TATAMOTORS'];
}

export function addToWatchlist(userId, symbol) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const userData = readJson(USER_DATA_FILE, {});
  if (!userData[userId]) userData[userId] = { watchlist: [], portfolio: [] };

  if (!userData[userId].watchlist.includes(cleanSymbol)) {
    userData[userId].watchlist.push(cleanSymbol);
    writeJson(USER_DATA_FILE, userData);
  }
  return userData[userId].watchlist;
}

export function removeFromWatchlist(userId, symbol) {
  const cleanSymbol = symbol.toUpperCase().trim();
  const userData = readJson(USER_DATA_FILE, {});
  if (!userData[userId]) return [];

  userData[userId].watchlist = userData[userId].watchlist.filter(
    (s) => s !== cleanSymbol
  );
  writeJson(USER_DATA_FILE, userData);
  return userData[userId].watchlist;
}

export function getUserPortfolio(userId) {
  const userData = readJson(USER_DATA_FILE, {});
  return userData[userId]?.portfolio || [];
}

export function addPortfolioItem(userId, item) {
  const userData = readJson(USER_DATA_FILE, {});
  if (!userData[userId]) userData[userId] = { watchlist: [], portfolio: [] };

  const newItem = {
    id: 'port_' + Date.now().toString(36),
    symbol: item.symbol.toUpperCase(),
    companyName: item.companyName || item.symbol,
    exchange: item.exchange || 'NSE',
    quantity: Number(item.quantity) || 1,
    buyPrice: Number(item.buyPrice) || 0,
    buyDate: item.buyDate || new Date().toISOString().split('T')[0],
  };

  userData[userId].portfolio.push(newItem);
  writeJson(USER_DATA_FILE, userData);
  return userData[userId].portfolio;
}

export function removePortfolioItem(userId, itemId) {
  const userData = readJson(USER_DATA_FILE, {});
  if (!userData[userId]) return [];

  userData[userId].portfolio = userData[userId].portfolio.filter(
    (p) => p.id !== itemId
  );
  writeJson(USER_DATA_FILE, userData);
  return userData[userId].portfolio;
}
