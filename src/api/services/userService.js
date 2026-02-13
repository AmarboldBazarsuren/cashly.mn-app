/**
 * CASHLY APP - User API Service
 * БАЙРШИЛ: Cashly.mn/App/src/api/services/userService.js
 * Хэрэглэгчийн профайл, KYC
 */

import api from '../config';

/**
 * Хэрэглэгчийн профайл татах
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Профайл татахад алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * KYC (хувийн мэдээлэл) илгээх
 * @param {Object} kycData - Бүх хувийн мэдээлэл
 */
export const submitKYC = async (kycData) => {
  try {
    const response = await api.post('/user/submit-kyc', kycData);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'KYC илгээхэд алдаа гарлаа',
      error: error.response?.data,
    };
  }
};

/**
 * Зээлийн эрх шалгах 3000₮ төлбөр төлөх
 */
export const payCreditCheckFee = async () => {
  try {
    const response = await api.post('/user/pay-credit-check');
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
  getProfile,
  submitKYC,
  payCreditCheckFee,
};