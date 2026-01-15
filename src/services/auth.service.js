import api from './api';

let inMemoryAccessToken = null;

// Internal helpers for api module
export function _setAccessTokenGetter(getter) {
  // Not used in this minimal adapter, but kept for compatibility
}
export function _getAccessToken() {
  return inMemoryAccessToken;
}
export function _setAccessToken(token) {
  inMemoryAccessToken = token;
}
export function _handleRefreshFailure() {
  inMemoryAccessToken = null;
  // optionally redirect to /login handled by app using fetch failures
}

// Public methods
export async function login(email, password) {
  const res = await api.post('/api/auth/login', { email, password });
  // backend responds with accessToken and sets refresh cookie
  const { accessToken, user } = res.data.data;
  _setAccessToken(accessToken);
  return { accessToken, user };
}

export async function refresh() {
  const res = await api.post('/api/auth/refresh');
  const { accessToken, user } = res.data.data;
  _setAccessToken(accessToken);
  return { accessToken, user };
}

export async function logout() {
  try {
    await api.post('/api/auth/logout');
  } catch (err) {
    // ignore
  } finally {
    _setAccessToken(null);
  }
}