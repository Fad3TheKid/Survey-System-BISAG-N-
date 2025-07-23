import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const UserContext = createContext({
  profile: null,
  setProfile: () => {},
  refreshProfile: () => {},
  loading: true,
  error: null,
});

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getProfile();
      console.log('UserContext refreshProfile data:', data);
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError(error);
      if (error === 'Invalid or expired token' || (error && error.toString().includes('401'))) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        alert('Session expired or unauthorized. Please login again.');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>Loading user profile...</div>;
  }

  return (
    <UserContext.Provider value={{ profile, setProfile, refreshProfile, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
