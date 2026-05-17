import { useCallback, useMemo, useState } from 'react';

import { AuthContext } from '@/hooks/authContext';
import { authenticateGithubCallback, getGithubAuthUrl } from '@/services/authService';

const AUTH_STORAGE_KEY = 'vibecheck.auth';

function readStoredAuth() {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(auth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const startGithubLogin = useCallback(async (returnTo = '/') => {
    setIsLoading(true);
    setError('');

    try {
      window.sessionStorage.setItem('auth.returnTo', returnTo);
      const authUrl = await getGithubAuthUrl(returnTo);
      window.location.assign(authUrl);
    } catch (requestError) {
      setError(requestError.message);
      setIsLoading(false);
      throw requestError;
    }
  }, []);

  const completeGithubLogin = useCallback(async (code) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await authenticateGithubCallback(code);
      const nextAuth = {
        accessToken: data.accessToken,
        user: data.user,
      };

      setAuth(nextAuth);
      writeStoredAuth(nextAuth);
      return nextAuth;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthData = useCallback((data) => {
    const nextAuth = {
      accessToken: data.accessToken,
      user: data.user,
    };

    setAuth(nextAuth);
    writeStoredAuth(nextAuth);
    return nextAuth;
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      accessToken: auth?.accessToken || '',
      completeGithubLogin,
      error,
      isAuthenticated: Boolean(auth?.accessToken),
      isLoading,
      logout,
      saveAuthData,
      startGithubLogin,
      user: auth?.user || null,
    }),
    [auth, completeGithubLogin, error, isLoading, logout, saveAuthData, startGithubLogin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
