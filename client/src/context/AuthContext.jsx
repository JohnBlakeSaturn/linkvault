import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSession = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await parseJsonSafe(response);

      if (!response.ok || !data.authenticated) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const register = async (payload) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    setUser(data.user);
    return data.user;
  };

  const login = async (payload) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    authLoading,
    isAuthenticated: Boolean(user),
    refreshSession,
    register,
    login,
    logout,
  }), [user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
