// Format date to readable string
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time
export const formatTime = (time) => {
  if (!time) return '';
  return time;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    allocated: 'bg-blue-100 text-blue-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate seat label
export const generateSeatLabel = (row, col) => {
  const rowLetter = String.fromCharCode(65 + row);
  return `${rowLetter}${col + 1}`;
};

// Calculate total capacity
export const calculateTotalCapacity = (rooms) => {
  return rooms.reduce((total, room) => total + (room.capacity || 0), 0);
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Download file
export const downloadFile = (content, fileName, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate phone number
export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

// Generate registration number
export const generateRegNumber = (dept, year) => {
  const yearCode = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${dept}${yearCode}${year}${random}`;
};