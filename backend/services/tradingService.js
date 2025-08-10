import { config } from '../config/index.js';
import { getCryptocurrencyBySymbol, getUserById, updateUserBalance, getUserPortfolio, upsertUserPortfolio, createTransaction } from './pocketbaseService.js';

export async function executeBuy({ userId, symbol, amount }) {
  if (!amount || amount <= 0) throw new Error('Amount must be positive');
  const crypto = await getCryptocurrencyBySymbol(symbol);
  const user = await getUserById(userId);
  const price = Number(crypto.current_price);
  const total = price * amount;
  const fee = total * config.feeRate;
  const cost = total + fee;
  const balance = Number(user.balance || 0);
  if (balance < cost) throw new Error('Insufficient balance');

  const existing = await getUserPortfolio(userId, crypto.symbol);
  let newAmount, newAveragePrice;
  if (existing) {
    const prevAmount = Number(existing.amount || 0);
    const prevAvgPrice = Number(existing.average_price || 0);
    newAmount = prevAmount + amount;
    newAveragePrice = newAmount > 0 ? (prevAmount * prevAvgPrice + total) / newAmount : 0;
  } else {
    newAmount = amount;
    newAveragePrice = price;
  }
  const newBalance = balance - cost;
  const currentValue = newAmount * price;

  await updateUserBalance(userId, newBalance);
  await upsertUserPortfolio(userId, crypto.symbol, newAmount, newAveragePrice, currentValue);
  await createTransaction({
    user: userId,
    type: 'buy',
    cryptocurrency: crypto.symbol,
    amount,
    price,
    total,
    fee,
    profit_loss: 0,
  });
  return { balance: newBalance };
}

export async function executeSell({ userId, symbol, amount }) {
  if (!amount || amount <= 0) throw new Error('Amount must be positive');
  const crypto = await getCryptocurrencyBySymbol(symbol);
  const user = await getUserById(userId);
  const price = Number(crypto.current_price);
  const portfolio = await getUserPortfolio(userId, crypto.symbol);
  if (!portfolio) throw new Error('No position to sell');
  const prevAmount = Number(portfolio.amount || 0);
  const avgPrice = Number(portfolio.average_price || 0);
  if (prevAmount < amount) throw new Error('Insufficient asset amount');

  const total = price * amount;
  const fee = total * config.feeRate;
  const proceeds = total - fee;
  const newAmount = prevAmount - amount;
  const newAveragePrice = newAmount > 0 ? avgPrice : 0;
  const newBalance = Number(user.balance || 0) + proceeds;
  const profitLoss = (price - avgPrice) * amount - fee;
  const currentValue = newAmount * price;

  await updateUserBalance(userId, newBalance);
  await upsertUserPortfolio(userId, crypto.symbol, newAmount, newAveragePrice, currentValue);
  await createTransaction({
    user: userId,
    type: 'sell',
    cryptocurrency: crypto.symbol,
    amount,
    price,
    total,
    fee,
    profit_loss: profitLoss,
  });
  return { balance: newBalance, profit_loss: profitLoss };
}
