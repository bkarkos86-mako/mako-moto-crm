const ACCESS_KEY_STORAGE = 'mm_access_key';

export function getStoredKey() {
  return localStorage.getItem(ACCESS_KEY_STORAGE) || '';
}

export function setStoredKey(key) {
  if (key) localStorage.setItem(ACCESS_KEY_STORAGE, key);
  else localStorage.removeItem(ACCESS_KEY_STORAGE);
}

export function clearStoredKey() {
  localStorage.removeItem(ACCESS_KEY_STORAGE);
}
