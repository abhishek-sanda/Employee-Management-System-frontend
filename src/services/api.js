import axios from 'axios';
import * as authService from './auth.service';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true ,// important so refresh cookie is sent

});

// Request: attach access token if present
api.interceptors.request.use((config) => {
  const token = authService._getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: on 401 attempt refresh once, then retry original request
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // if unauthorized and we haven't tried refreshing yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Prevent infinite loop: if the failed request was already a refresh attempt, don't retry
      if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authService
          .refresh()
          .then((r) => {
            authService._setAccessToken(r.accessToken);
            return r.accessToken;
          })
          .catch((e) => {
            // refresh failed -> make sure logout flow happens
            authService._handleRefreshFailure();
            throw e;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      try {
        const newToken = await refreshPromise;
        originalRequest._retry = true;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;