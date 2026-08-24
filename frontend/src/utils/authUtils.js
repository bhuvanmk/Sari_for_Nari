import { api } from '../services/api';

/**
 * Safely writes to sessionStorage with error handling for private/restricted browsing.
 */
export function safeSetStorage(key, value) {
  try {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.warn(`Storage access blocked for key "${key}"`, e);
  }
}

/**
 * Safely reads and parses JSON from sessionStorage.
 */
export function safeGetStorage(key) {
  try {
    const item = sessionStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading/parsing storage key "${key}"`, e);
    return null;
  }
}

/**
 * Safely removes a key from sessionStorage.
 */
export function safeRemoveStorage(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn(`Error removing storage key "${key}"`, e);
  }
}

/**
 * Checks authentication status. If unauthenticated, queues action in storage and navigates to login.
 * Returns true if authenticated, false if redirected.
 */
export function requireAuthOrQueue(actionPayload, navigate) {
  if (api.isAuthenticated()) {
    return true;
  }
  safeSetStorage('pendingGuestAction', actionPayload);
  navigate('/login');
  return false;
}
