import { fetchTopMarketCoins } from '../services/coingeckoService.js';
import { upsertCryptocurrencies } from '../services/pocketbaseService.js';
import { config } from '../config/index.js';

export function startPriceUpdater() {
  const run = async () => {
    try {
      const data = await fetchTopMarketCoins();
      await upsertCryptocurrencies(data);
    } catch (err) {
      console.error('Price update error:', err.message);
    }
  };
  run();
  setInterval(run, config.updateIntervalMs);
}
