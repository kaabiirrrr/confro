/**
 * Global Currency Utility
 * Displays values as-is with ₹ symbol — no USD/INR conversion.
 */

export const USD_TO_INR = 1; // No conversion — kept for legacy compatibility

/**
 * Formats a numeric amount with ₹ symbol using the Indian numbering system.
 * Does NOT convert — displays the original stored value.
 * @param {number} amount - The raw stored amount.
 * @returns {string} - Formatted string (e.g., ₹1,00,000).
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/**
 * Returns the numeric value as-is (no conversion).
 * @param {number} amount
 * @returns {number}
 */
export function getINRValue(amount) {
  return Number(amount) || 0;
}

/**
 * Returns the amount as-is for backend storage (no conversion needed).
 * @param {number|string} amount
 * @returns {number}
 */
export function parseINRToUSD(amount) {
  return Number(amount) || 0;
}

/**
 * Returns the amount as-is for backend storage (no conversion needed).
 * @param {number|string} amount
 * @returns {number}
 */
export function convertToUSD(amount) {
  return parseFloat(Number(amount).toFixed(2));
}
