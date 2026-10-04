import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    const res = await api.login({ username, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const hasPermission = (code) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return Boolean(user.permissions && user.permissions.includes(code));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin: user?.role === 'ADMIN',
    isStaff: user?.role === 'STAFF',
    isUser: user?.role === 'USER',
    isAuthenticated: Boolean(token && user)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
