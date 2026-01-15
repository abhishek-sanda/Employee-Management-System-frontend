import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, role }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // expose token helpers to services
  useEffect(() => {
    authService._setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  // Attempt to refresh on app start to get user session if cookie present
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authService.refresh();
        if (!mounted) return;
        setAccessToken(res.accessToken);
        setUser(res.user);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        isAuthenticated: Boolean(user),
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);