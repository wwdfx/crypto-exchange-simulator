import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
export const pb = new PocketBase(url);
// Disable request auto-cancellation (helps with rapid route/unmounts)
pb.autoCancellation(false);

export function isAdmin() {
  return pb.authStore?.model?.role === 'admin';
}
