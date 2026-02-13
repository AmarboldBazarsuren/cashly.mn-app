/**
 * CASHLY APP - Auth Context
 * БАЙРШИЛ: Cashly.mn/App/src/contexts/AuthContext.js
 * Global authentication state management
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginAPI, register as registerAPI, logout as logoutAPI } from '../api/services/authService';
import { getProfile } from '../api/services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App эхлэхэд token шалгах
  useEffect(() => {
    checkAuth();
  }, []);

  // Token болон user мэдээлэл шалгах
  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Profile шинэчлэх
        await refreshProfile();
      }
    } catch (error) {
      console.error('Check auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Profile шинэчлэх
  const refreshProfile = async () => {
    try {
      const result = await getProfile();
      if (result.success) {
        const userData = result.data.user;
        setUser(userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  // Нэвтрэх
  const login = async (phoneNumber, password) => {
    try {
      const result = await loginAPI({ phoneNumber, password });
      
      if (result.success) {
        const { user: userData, token: userToken } = result.data;
        
        // AsyncStorage-д хадгалах
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // State update
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Нэвтрэхэд алдаа гарлаа' };
    }
  };

  // Бүртгүүлэх
  const register = async (phoneNumber, password, name) => {
    try {
      const result = await registerAPI({ phoneNumber, password, name });
      
      if (result.success) {
        const { user: userData, token: userToken } = result.data;
        
        // AsyncStorage-д хадгалах
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // State update
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Бүртгэл үүсгэхэд алдаа гарлаа' };
    }
  };

  // Гарах
  const logout = async () => {
    try {
      await logoutAPI();
      
      // AsyncStorage цэвэрлэх
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // State reset
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Гарахад алдаа гарлаа' };
    }
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;