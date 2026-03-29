import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';

  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || 'Login failed';
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        fullName
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || 'Registration failed';
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = '';
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      axios.defaults.headers.common['Authorization'] = '';
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      getCurrentUser();
    }
  }, [token, user, getCurrentUser]);

  const updateUser = useCallback(async (data) => {
    try {
      const response = await axios.put('/api/auth/update', data);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || 'Update failed';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        getCurrentUser,
        updateUser,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
