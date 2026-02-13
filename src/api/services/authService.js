/**
 * CASHLY APP - Auth API Service
 * БАЙРШИЛ: Cashly.mn/App/src/api/services/authService.js
 * Бүртгэл, нэвтрэх, гарах
 */

import api from '../config';

/**
 * Хэрэглэгч бүртгүүлэх
 * @param {Object} data - { phoneNumber, password, name }
 */
export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Бүртгэл үүсгэхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Хэрэглэгч нэвтрэх
 * @param {Object} data - { phoneNumber, password }
 */
export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Хэрэглэгч гарах
 */
export const logout = async () => {
  try {
    // Server дээр logout endpoint байвал энд дуудна
    // await api.post('/auth/logout');
    return {
      success: true,
      message: 'Амжилттай гарлаа',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Гарахад алдаа гарлаа',
    };
  }
};

/**
 * FCM Token update
 * @param {String} fcmToken
 */
export const updateFCMToken = async (fcmToken) => {
  try {
    const response = await api.post('/user/update-fcm-token', { fcmToken });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Token update алдаатай',
    };
  }
};

export default {
  register,
  login,
  logout,
  updateFCMToken,
};