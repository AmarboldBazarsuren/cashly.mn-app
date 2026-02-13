/**
 * CASHLY APP - Validation Utilities
 * БАЙРШИЛ: Cashly.mn/App/src/utils/validators.js
 * Формын validation - утас, нууц үг, регистр гэх мэт
 */

/**
 * Утасны дугаар шалгах (8 оронтой)
 * @param {String} phone
 * @returns {Boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return /^[0-9]{8}$/.test(cleaned);
};

/**
 * Нууц үг шалгах (min 6 тэмдэгт)
 * @param {String} password
 * @returns {Boolean}
 */
export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};

/**
 * Нэр шалгах
 * @param {String} name
 * @returns {Boolean}
 */
export const validateName = (name) => {
  if (!name) return false;
  return name.trim().length >= 2;
};

/**
 * И-мэйл шалгах
 * @param {String} email
 * @returns {Boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Регистрийн дугаар шалгах (УБ12345678)
 * @param {String} register
 * @returns {Boolean}
 */
export const validateRegister = (register) => {
  if (!register) return false;
  return /^[А-ЯӨҮ]{2}[0-9]{8}$/.test(register.toUpperCase());
};

/**
 * Дансны дугаар шалгах
 * @param {String} accountNumber
 * @returns {Boolean}
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return false;
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 20;
};

/**
 * Мөнгөн дүн шалгах
 * @param {Number} amount
 * @param {Number} min - Хамгийн бага
 * @param {Number} max - Хамгийн их
 * @returns {Boolean}
 */
export const validateAmount = (amount, min = 0, max = Infinity) => {
  if (amount === null || amount === undefined) return false;
  const num = Number(amount);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Зээлийн дүн шалгах
 * @param {Number} amount
 * @param {Number} creditLimit
 * @returns {Object} - { valid, message }
 */
export const validateLoanAmount = (amount, creditLimit = 0) => {
  if (!amount || amount <= 0) {
    return { valid: false, message: 'Дүн оруулна уу' };
  }
  
  if (amount < 10000) {
    return { valid: false, message: 'Хамгийн бага зээл 10,000₮' };
  }
  
  if (creditLimit === 0) {
    return { valid: false, message: 'Зээлийн эрх тогтоогдоогүй байна' };
  }
  
  if (amount > creditLimit) {
    return { 
      valid: false, 
      message: `Зээлийн эрх хүрэлцэхгүй (${creditLimit.toLocaleString()}₮)` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * Зээлийн хугацаа шалгах
 * @param {Number} term
 * @returns {Boolean}
 */
export const validateLoanTerm = (term) => {
  return [14, 21, 90].includes(term);
};

/**
 * Base64 зураг шалгах
 * @param {String} base64
 * @returns {Boolean}
 */
export const validateBase64Image = (base64) => {
  if (!base64) return false;
  return base64.startsWith('data:image/');
};

/**
 * Password баталгаажуулах (давтах)
 * @param {String} password
 * @param {String} confirmPassword
 * @returns {Boolean}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
};

/**
 * Форм шалгах (хоосон эсэх)
 * @param {Object} values - Form values
 * @param {Array} requiredFields - ['phone', 'password']
 * @returns {Object} - { valid, errors }
 */
export const validateForm = (values, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!values[field] || values[field].toString().trim() === '') {
      errors[field] = 'Энэ талбарыг бөглөнө үү';
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validatePhone,
  validatePassword,
  validateName,
  validateEmail,
  validateRegister,
  validateAccountNumber,
  validateAmount,
  validateLoanAmount,
  validateLoanTerm,
  validateBase64Image,
  validatePasswordMatch,
  validateForm,
};