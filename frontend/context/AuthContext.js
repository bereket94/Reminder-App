// frontend/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      console.log('Loading stored data - token:', !!storedToken);
      console.log('Loading stored data - user:', storedUser);
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('User set from storage:', parsedUser);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userData) => {
    try {
      console.log('Login function called');
      console.log('Token received:', !!token);
      console.log('User data:', userData);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state - THIS SHOULD TRIGGER NAVIGATION
      setUser(userData);
      
      console.log('User state updated to:', userData);
      
      // Verify storage
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      console.log('Verification - token stored:', !!storedToken);
      console.log('Verification - user stored:', storedUser);
      
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('User set to null');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};