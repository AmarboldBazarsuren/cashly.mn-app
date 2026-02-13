/**
 * CASHLY APP - Wallet API Service
 * БАЙРШИЛ: Cashly.mn/App/src/api/services/walletService.js
 * Хэтэвч, цэнэглэлт, татах хүсэлт
 */

import api from '../config';

/**
 * Хэтэвчний үлдэгдэл татах
 */
export const getWallet = async () => {
  try {
    const response = await api.get('/wallet/balance');
    return {
      success: true,
      data: response.data.data.wallet,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Хэтэвч татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Хэтэвч цэнэглэх (Test/Manual)
 * @param {Object} data - { amount, paymentMethod, referenceNumber }
 */
export const deposit = async (data) => {
  try {
    const response = await api.post('/wallet/deposit', data);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Цэнэглэхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Мөнгө татах хүсэлт илгээх
 * @param {Object} data - { amount }
 */
export const requestWithdrawal = async (data) => {
  try {
    const response = await api.post('/wallet/request-withdrawal', data);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Татах хүсэлт илгээхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Миний татах хүсэлтүүд
 */
export const getWithdrawalRequests = async () => {
  try {
    const response = await api.get('/wallet/withdrawal-requests');
    return {
      success: true,
      data: response.data.data.requests,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Хүсэлт татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

export default {
  getWallet,
  deposit,
  requestWithdrawal,
  getWithdrawalRequests,
};