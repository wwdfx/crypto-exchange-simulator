import axios from 'axios';
import { config } from '../config/index.js';

export async function fetchTopMarketCoins() {
  const url = `${config.coingeckoApiUrl}/coins/markets`;
  const res = await axios.get(url, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h',
    },
    timeout: 15000,
  });
  return res.data;
}

export async function resolveCoinIdBySymbol(symbol) {
  const url = `${config.coingeckoApiUrl}/coins/markets`;
  const res = await axios.get(url, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 250,
      page: 1,
      sparkline: false,
    },
    timeout: 15000,
  });
  const sym = (symbol || '').toLowerCase();
  const match = res.data.find(c => String(c.symbol).toLowerCase() === sym);
  return match?.id || null;
}

const ohlcCache = new Map(); // key: `${id}:${days}` -> { ts, data }
const OHLC_TTL_MS = 60_000; // 60s cache

export async function fetchOHLC(coinId, days = 1) {
  const key = `${coinId}:${days}`;
  const now = Date.now();
  const cached = ohlcCache.get(key);
  if (cached && now - cached.ts < OHLC_TTL_MS) return cached.data;

  const url = `${config.coingeckoApiUrl}/coins/${coinId}/ohlc`;
  const res = await axios.get(url, {
    params: { vs_currency: 'usd', days },
    timeout: 15000,
  });
  ohlcCache.set(key, { ts: now, data: res.data });
  return res.data;
}
