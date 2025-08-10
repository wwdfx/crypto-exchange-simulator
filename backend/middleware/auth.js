import PocketBase from 'pocketbase';
import { config } from '../config/index.js';

export async function requireUser(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const pb = new PocketBase(config.pocketbaseUrl);
    pb.authStore.save(token, null);
    await pb.collection('users').authRefresh();
    req.user = pb.authStore.model;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Forbidden' });
}
