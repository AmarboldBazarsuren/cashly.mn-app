/**
 * CASHLY APP - Transaction API Service
 * БАЙРШИЛ: Cashly.mn/App/src/api/services/transactionService.js
 * Гүйлгээний түүх
 */

import api from '../config';

/**
 * Гүйлгээний түүх татах
 * @param {Object} params - { page, limit, type }
 */
export const getTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transaction/history', { params });
    return {
      success: true,
      data: response.data.data.transactions,
      pagination: {
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Гүйлгээ татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Гүйлгээний дэлгэрэнгүй
 * @param {String} transactionId
 */
export const getTransactionDetails = async (transactionId) => {
  try {
    const response = await api.get(`/transaction/${transactionId}`);
    return {
      success: true,
      data: response.data.data.transaction,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Гүйлгээ татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

export default {
  getTransactions,
  getTransactionDetails,
};