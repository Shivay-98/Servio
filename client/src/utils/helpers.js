/**
 * Format a date value into a human-readable string.
 * Accepts Date objects, ISO strings, or timestamps.
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a number as Indian Rupee currency.
 */
export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Return uppercase initials from a full name (max 2 chars).
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Map an application status value to a Tailwind-friendly color name.
 */
export const getStatusColor = (status) => {
  const colorMap = {
    draft: 'gray',
    pending: 'yellow',
    under_review: 'blue',
    approved: 'green',
    rejected: 'red',
    suspended: 'orange',
    active: 'green',
    inactive: 'gray',
  };
  return colorMap[status] || 'gray';
};

/**
 * Truncate text to a given length and append an ellipsis if shortened.
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + '...';
};

/**
 * Format raw bytes into a human-readable file size string.
 */
export const formatFileSize = (bytes) => {
  if (bytes == null || bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(i === 0 ? 0 : 2)} ${sizes[i]}`;
};

/**
 * Returns a debounced version of the given function.
 */
export const debounce = (fn, delay = 300) => {
  let timerId;
  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
};
