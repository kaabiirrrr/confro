/**
 * Global Currency Utility for USD to INR Conversion
 * Exchange Rate: 1 USD = 92.74 INR
 */

export const USD_TO_INR = 1;

/**
 * Converts USD amount to INR and formats it using the Indian numbering system.
 * @param {number} amountUSD - The amount in USD.
 * @returns {string} - Formatted INR string (e.g., ₹1,50,000).
 */
export function formatINR(amountUSD) {
  if (amountUSD === null || amountUSD === undefined) return "₹0";
  
  const inr = Number(amountUSD) * USD_TO_INR;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(inr);
}

/**
 * Extracts numeric value for calculations if needed.
 * @param {number} amountUSD 
 * @returns {number}
 */
export function getINRValue(amountUSD) {
  return (Number(amountUSD) || 0) * USD_TO_INR;
}

/**
 * Converts INR input back to USD for backend storage.
 * @param {number} amountINR 
 * @returns {number}
 */
export function parseINRToUSD(amountINR) {
  return (Number(amountINR) || 0) / USD_TO_INR;
}

/**
 * Converts INR amount back to USD for storage
 * @param {number|string} amountINR 
 * @returns {number}
 */
export function convertToUSD(amountINR) {
  return parseFloat((Number(amountINR) / USD_TO_INR).toFixed(2));
}
