import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  pocketbaseUrl: process.env.POCKETBASE_URL || 'http://localhost:8090',
  coingeckoApiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  updateIntervalMs: Number(process.env.UPDATE_INTERVAL || 30000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  feeRate: Number(process.env.FEE_RATE || 0.0015),
  startBalance: Number(process.env.START_BALANCE || 10000),
  adminEmail: process.env.PB_ADMIN_EMAIL || '',
  adminPassword: process.env.PB_ADMIN_PASSWORD || '',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 1000),
};
