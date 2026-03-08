import { decryptJson, encryptJson } from './crypto.js';

const STORAGE_KEY = 'abc-portfolio-db';

export const emptyState = () => ({
  meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  owners: [],
  accounts: [],
  assets: [],
  transactions: [],
  prices: [],
});

export async function loadState(password) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = emptyState();
    await saveState(password, initial);
    return initial;
  }
  return decryptJson(password, JSON.parse(raw));
}

export async function saveState(password, state) {
  state.meta.updatedAt = new Date().toISOString();
  const encrypted = await encryptJson(password, state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
}

export function nextId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
