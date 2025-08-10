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

export async function fetchOHLC(coinId, days = 1) {
  const url = `${config.coingeckoApiUrl}/coins/${coinId}/ohlc`;
  const res = await axios.get(url, {
    params: { vs_currency: 'usd', days },
    timeout: 15000,
  });
  // Returns array of [timestamp, open, high, low, close]
  return res.data;
}
