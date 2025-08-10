import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import PocketBase from 'pocketbase';
import { config } from './config/index.js';
import { startPriceUpdater } from './jobs/updatePrices.js';
import { ensureAdminAuth, listUsers, updateUserBalance } from './services/pocketbaseService.js';
import { executeBuy, executeSell } from './services/tradingService.js';
import { requireUser, requireAdmin } from './middleware/auth.js';
import { resolveCoinIdBySymbol, fetchOHLC } from './services/coingeckoService.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/cryptocurrencies', async (req, res) => {
  try {
    const pb = new PocketBase(config.pocketbaseUrl);
    const list = await pb.collection('cryptocurrencies').getList(1, 200, { sort: '-market_cap' });
    res.json(list.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const days = Number(req.query.days || 1);
    const id = await resolveCoinIdBySymbol(symbol);
    if (!id) return res.status(404).json({ error: 'Symbol not found' });
    const ohlc = await fetchOHLC(id, days);
    res.json(ohlc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/trade/buy', requireUser, async (req, res) => {
  try {
    const { cryptocurrency, amount } = req.body || {};
    const result = await executeBuy({ userId: req.user.id, symbol: cryptocurrency, amount: Number(amount) });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/trade/sell', requireUser, async (req, res) => {
  try {
    const { cryptocurrency, amount } = req.body || {};
    const result = await executeSell({ userId: req.user.id, symbol: cryptocurrency, amount: Number(amount) });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/admin/users', requireUser, requireAdmin, async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/admin/users/:id/balance', requireUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { balance } = req.body || {};
    const updated = await updateUserBalance(id, Number(balance));
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/admin/sync', requireUser, requireAdmin, async (req, res) => {
  try {
    await ensureAdminAuth();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(config.port, async () => {
  try {
    await ensureAdminAuth();
  } catch (err) {
    console.warn('Admin auth failed at startup:', err.message);
  }
  startPriceUpdater();
  console.log(`Backend listening on http://localhost:${config.port}`);
});
