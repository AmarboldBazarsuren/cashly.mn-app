/**
 * CASHLY APP - API Configuration
 * БАЙРШИЛ: Cashly.mn/App/src/api/config.js
 * Backend холболт, axios тохиргоо
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

// Base API URL
const BASE_URL = API_URL || 'http://192.168.1.5:5000/api';

// Axios instance үүсгэх
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 секунд
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Token нэмэх
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Алдаа боловсруулах
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 401 буюу token хүчингүй бол logout хийх
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        // Navigation reset - AuthContext дотор хийгдэнэ
      } catch (asyncError) {
        console.error('Error removing tokens:', asyncError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };