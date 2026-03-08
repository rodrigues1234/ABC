const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(password, payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const plaintext = encoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    version: 1,
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
    data: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
  };
}

export async function decryptJson(password, encryptedBlob) {
  const iv = Uint8Array.from(atob(encryptedBlob.iv), (c) => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(encryptedBlob.salt), (c) => c.charCodeAt(0));
  const data = Uint8Array.from(atob(encryptedBlob.data), (c) => c.charCodeAt(0));
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return JSON.parse(decoder.decode(plaintext));
}
