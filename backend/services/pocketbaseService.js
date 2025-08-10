import PocketBase from 'pocketbase';
import { config } from '../config/index.js';

const adminPb = new PocketBase(config.pocketbaseUrl);
let adminReady = false;

export async function ensureAdminAuth() {
  if (adminReady && adminPb.authStore.isValid) return adminPb;
  await adminPb.admins.authWithPassword(config.adminEmail, config.adminPassword);
  adminReady = true;
  return adminPb;
}

export function createUserClient(token) {
  const pb = new PocketBase(config.pocketbaseUrl);
  pb.authStore.save(token, null);
  return pb;
}

export async function upsertCryptocurrencies(coinList) {
  const pb = await ensureAdminAuth();
  for (const coin of coinList) {
    const { symbol, name, current_price, price_change_percentage_24h, market_cap, total_volume, last_updated } = coin;
    const symbolUpper = (symbol || '').toUpperCase();
    try {
      const existing = await pb.collection('cryptocurrencies').getFirstListItem(`symbol = "${symbolUpper}"`);
      await pb.collection('cryptocurrencies').update(existing.id, {
        symbol: symbolUpper,
        name,
        current_price,
        price_change_24h: price_change_percentage_24h || 0,
        market_cap,
        volume_24h: total_volume,
        last_updated,
      });
    } catch (err) {
      await pb.collection('cryptocurrencies').create({
        symbol: symbolUpper,
        name,
        current_price,
        price_change_24h: price_change_percentage_24h || 0,
        market_cap,
        volume_24h: total_volume,
        last_updated,
      });
    }
  }
}

export async function getCryptocurrencyBySymbol(symbol) {
  const pb = await ensureAdminAuth();
  const symbolUpper = (symbol || '').toUpperCase();
  return pb.collection('cryptocurrencies').getFirstListItem(`symbol = "${symbolUpper}"`);
}

export async function getUserById(userId) {
  const pb = await ensureAdminAuth();
  return pb.collection('users').getOne(userId);
}

export async function updateUserBalance(userId, newBalance) {
  const pb = await ensureAdminAuth();
  return pb.collection('users').update(userId, { balance: newBalance });
}

export async function getUserPortfolio(userId, symbol) {
  const pb = await ensureAdminAuth();
  const filter = `user.id = "${userId}" && cryptocurrency = "${(symbol || '').toUpperCase()}"`;
  const list = await pb.collection('portfolios').getList(1, 1, { filter });
  return list.items[0] || null;
}

export async function upsertUserPortfolio(userId, symbol, amount, averagePrice, currentValue) {
  const pb = await ensureAdminAuth();
  const existing = await getUserPortfolio(userId, symbol);
  if (existing) {
    return pb.collection('portfolios').update(existing.id, {
      amount,
      average_price: averagePrice,
      current_value: currentValue,
    });
  }
  return pb.collection('portfolios').create({
    user: userId,
    cryptocurrency: (symbol || '').toUpperCase(),
    amount,
    average_price: averagePrice,
    current_value: currentValue,
  });
}

export async function createTransaction(tx) {
  const pb = await ensureAdminAuth();
  return pb.collection('transactions').create(tx);
}

export async function listUsers() {
  const pb = await ensureAdminAuth();
  const page = await pb.collection('users').getList(1, 200, { sort: '-created' });
  return page.items;
}
