import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
export const pb = new PocketBase(url);

export function isAdmin() {
  return pb.authStore?.model?.role === 'admin';
}
