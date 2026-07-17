const ACCESS_KEY_STORAGE = 'mm_access_key';
const USER_STORAGE = 'mm_current_user';

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

// { name, role } for whoever's PIN is currently stored on this device.
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_STORAGE, JSON.stringify(user));
  else localStorage.removeItem(USER_STORAGE);
}

export function clearSession() {
  clearStoredKey();
  setStoredUser(null);
}
