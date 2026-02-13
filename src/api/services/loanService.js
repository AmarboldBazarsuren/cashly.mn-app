/**
 * CASHLY APP - Loan API Service
 * БАЙРШИЛ: Cashly.mn/App/src/api/services/loanService.js
 * Зээл авах, төлөх, сунгах
 */

import api from '../config';

/**
 * Зээлийн хүсэлт илгээх
 * @param {Object} data - { amount, term, purpose }
 */
export const applyLoan = async (data) => {
  try {
    const response = await api.post('/loan/apply', data);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Зээлийн хүсэлт илгээхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Миний бүх зээлүүд
 */
export const getMyLoans = async () => {
  try {
    const response = await api.get('/loan/my-loans');
    return {
      success: true,
      data: response.data.data.loans,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Зээл татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Идэвхтэй зээлүүд
 */
export const getActiveLoans = async () => {
  try {
    const response = await api.get('/loan/active-loans');
    return {
      success: true,
      data: response.data.data.loans,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Зээл татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Зээлийн дэлгэрэнгүй
 * @param {String} loanId
 */
export const getLoanDetails = async (loanId) => {
  try {
    const response = await api.get(`/loan/${loanId}`);
    return {
      success: true,
      data: response.data.data.loan,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Зээл татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Зээл сунгах
 * @param {String} loanId
 */
export const extendLoan = async (loanId) => {
  try {
    const response = await api.post(`/loan/extend/${loanId}`);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Зээл сунгахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Зээл төлөх
 * @param {String} loanId
 * @param {Number} amount
 */
export const repayLoan = async (loanId, amount) => {
  try {
    const response = await api.post(`/loan/repay/${loanId}`, { amount });
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Төлбөр төлөхөд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

export default {
  applyLoan,
  getMyLoans,
  getActiveLoans,
  getLoanDetails,
  extendLoan,
  repayLoan,
};