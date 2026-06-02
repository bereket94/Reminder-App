import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ ...data.user, _id: data.user._id || data.user.id });
        } else {
          await AsyncStorage.removeItem('token');
          setUser(null);
        }
      } catch (e) {
        console.error('Token verify failed', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (userData, token) => {
    await AsyncStorage.setItem('token', token);
    setUser({ ...userData, _id: userData._id || userData.id });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);