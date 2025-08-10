import axios from 'axios';
import { pb } from './pb';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = pb?.authStore?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
