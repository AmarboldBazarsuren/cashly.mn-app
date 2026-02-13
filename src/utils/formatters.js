/**
 * CASHLY APP - Format Utilities
 * БАЙРШИЛ: Cashly.mn/App/src/utils/formatters.js
 * Мөнгө, огноо, утас форматлах
 */

/**
 * Мөнгөн дүн форматлах
 * @param {Number} amount - Дүн
 * @param {Boolean} showCurrency - Төгрөг харуулах эсэх
 * @returns {String} - 1,000,000₮
 */
export const formatMoney = (amount, showCurrency = true) => {
  if (amount === null || amount === undefined) return '0₮';
  
  const formatted = Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return showCurrency ? `${formatted}₮` : formatted;
};

/**
 * Компакт мөнгөн дүн (1M, 500K гэх мэт)
 * @param {Number} amount
 * @returns {String}
 */
export const formatMoneyCompact = (amount) => {
  if (amount === null || amount === undefined) return '0₮';
  
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M₮`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K₮`;
  }
  return `${amount}₮`;
};

/**
 * Утасны дугаар форматлах
 * @param {String} phone - 99119911
 * @returns {String} - 9911 9911
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  }
  
  return phone;
};

/**
 * Огноо форматлах
 * @param {String|Date} date
 * @param {String} format - 'short' | 'long' | 'full'
 * @returns {String}
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  const monthNames = [
    'Нэгдүгээр сар', 'Хоёрдугаар сар', 'Гуравдугаар сар',
    'Дөрөвдүгээр сар', 'Тавдугаар сар', 'Зургадугаар сар',
    'Долдугаар сар', 'Наймдугаар сар', 'Есдүгээр сар',
    'Аравдугаар сар', 'Арван нэгдүгээр сар', 'Арван хоёрдугаар сар'
  ];
  
  switch (format) {
    case 'short':
      return `${year}/${month}/${day}`;
    case 'long':
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    case 'full':
      return `${monthNames[d.getMonth()]} ${day}, ${year}`;
    case 'relative':
      return getRelativeTime(d);
    default:
      return `${year}/${month}/${day}`;
  }
};

/**
 * Харьцангуй цаг (2 цагийн өмнө гэх мэт)
 * @param {Date} date
 * @returns {String}
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'Дөнгөж сая';
  if (minutes < 60) return `${minutes} минутын өмнө`;
  if (hours < 24) return `${hours} цагийн өмнө`;
  if (days < 7) return `${days} өдрийн өмнө`;
  
  return formatDate(date, 'short');
};

/**
 * Зээлийн статус тайлбар
 * @param {String} status
 * @returns {String}
 */
export const getLoanStatusText = (status) => {
  const statusMap = {
    pending: 'Хүлээгдэж байна',
    approved: 'Зөвшөөрөгдсөн',
    rejected: 'Татгалзсан',
    active: 'Идэвхтэй',
    extended: 'Сунгагдсан',
    completed: 'Төлөгдсөн',
    overdue: 'Хугацаа хэтэрсэн',
    defaulted: 'Төлөгдөөгүй',
  };
  
  return statusMap[status] || status;
};

/**
 * KYC статус тайлбар
 * @param {String} status
 * @returns {String}
 */
export const getKYCStatusText = (status) => {
  const statusMap = {
    not_submitted: 'Илгээгдээгүй',
    pending: 'Хянагдаж байна',
    approved: 'Баталгаажсан',
    rejected: 'Татгалзсан',
  };
  
  return statusMap[status] || status;
};

/**
 * Зээлийн хүү тооцох
 * @param {Number} principal - Үндсэн дүн
 * @param {Number} term - Хугацаа (14, 21, 90)
 * @returns {Object} - { rate, interestAmount, totalAmount }
 */
export const calculateLoanInterest = (principal, term) => {
  let rate;
  
  switch(term) {
    case 14:
      rate = 1.8;
      break;
    case 21:
      rate = 2.4;
      break;
    case 90:
      rate = 2.4;
      break;
    default:
      rate = 2.4;
  }
  
  const interestAmount = Math.round(principal * (rate / 100));
  const totalAmount = principal + interestAmount;
  
  return {
    rate,
    interestAmount,
    totalAmount,
  };
};

/**
 * Хугацаа дуустал хэдэн хоног үлдсэн
 * @param {String|Date} dueDate
 * @returns {Number}
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return 0;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default {
  formatMoney,
  formatMoneyCompact,
  formatPhone,
  formatDate,
  getRelativeTime,
  getLoanStatusText,
  getKYCStatusText,
  calculateLoanInterest,
  getDaysUntilDue,
};