/**
 * ============================================
 * Expense Tracker - Utilities Module
 * Helper functions for formatting, validation, and calculations
 * Student Project - CS101
 * ============================================
 */

const utils = {
    /**
     * Format a number as currency
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '$0.00';
        }
        return new Intl.NumberFormat(CONFIG.CURRENCY_LOCALE, {
            style: 'currency',
            currency: CONFIG.CURRENCY_CODE,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format a date string for display
     * @param {string} dateString - ISO date string (YYYY-MM-DD)
     * @returns {string} Formatted date string
     */
    formatDate(dateString) {
        if (!dateString) return 'Invalid Date';
        const date = new Date(dateString + 'T00:00:00'); // Prevent timezone issues
        if (isNaN(date.getTime())) return 'Invalid Date';

        return date.toLocaleDateString(CONFIG.CURRENCY_LOCALE, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Format date for input fields
     * @param {Date} date - Date object
     * @returns {string} YYYY-MM-DD format
     */
    formatDateInput(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Get month name and year from date string
     * @param {string} dateString - YYYY-MM-DD
     * @returns {string} "Month YYYY"
     */
    getMonthYear(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString(CONFIG.CURRENCY_LOCALE, {
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Get month key for grouping (YYYY-MM)
     * @param {string} dateString - YYYY-MM-DD
     * @returns {string} YYYY-MM
     */
    getMonthKey(dateString) {
        return dateString.substring(0, 7);
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Raw text input
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Validate transaction data
     * @param {Object} data - Transaction data object
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validateTransaction(data) {
        const errors = [];

        if (!data.description || data.description.trim().length === 0) {
            errors.push('Description is required');
        } else if (data.description.trim().length > 100) {
            errors.push('Description must be less than 100 characters');
        }

        if (typeof data.amount !== 'number' || isNaN(data.amount)) {
            errors.push('Amount must be a valid number');
        } else if (data.amount <= 0) {
            errors.push('Amount must be greater than 0');
        } else if (data.amount > 999999999.99) {
            errors.push('Amount is too large');
        }

        if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
            errors.push('Valid date is required (YYYY-MM-DD)');
        } else {
            const date = new Date(data.date + 'T00:00:00');
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            // Allow dates up to 1 year in the future for planned expenses
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);

            if (isNaN(date.getTime())) {
                errors.push('Invalid date');
            } else if (date > maxDate) {
                errors.push('Date cannot be more than 1 year in the future');
            }
        }

        if (!data.category || !CONFIG.CATEGORIES[data.category]) {
            errors.push('Valid category is required');
        }

        if (!data.type || !['income', 'expense'].includes(data.type)) {
            errors.push('Type must be income or expense');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Calculate percentage safely
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @returns {number} Percentage (0-100)
     */
    calculatePercentage(value, total) {
        if (!total || total === 0) return 0;
        return Math.min(100, Math.max(0, (value / total) * 100));
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Group array of objects by a key
     * @param {Array} array - Array to group
     * @param {string} key - Key to group by
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array by key
     * @param {Array} array - Array to sort
     * @param {string} key - Sort key
     * @param {string} direction - 'asc' or 'desc'
     * @returns {Array} Sorted array
     */
    sortBy(array, key, direction = 'desc') {
        return [...array].sort((a, b) => {
            let valA = a[key];
            let valB = b[key];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Get last N months labels and keys
     * @param {number} count - Number of months
     * @returns {Array} Array of { key, label, date }
     */
    getLastMonths(count = 6) {
        const months = [];
        const now = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleDateString(CONFIG.CURRENCY_LOCALE, { month: 'short' });
            months.push({ key, label, date: d });
        }

        return months;
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean}
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    /**
     * Get color based on percentage (for budget bars)
     * @param {number} percentage - 0-100
     * @returns {string} Color hex code
     */
    getProgressColor(percentage) {
        if (percentage >= CONFIG.BUDGET_ALERT_DANGER) {
            return CONFIG.CATEGORIES.bills.color; // Red
        } else if (percentage >= CONFIG.BUDGET_ALERT_WARNING) {
            return CONFIG.CATEGORIES.food.color; // Amber
        }
        return CONFIG.CATEGORIES.health.color; // Green
    },

    /**
     * Convert array to CSV string
     * @param {Array} data - Array of objects
     * @param {Array} headers - Column headers
     * @returns {string} CSV content
     */
    convertToCSV(data, headers) {
        const csvRows = [];
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(value).replace(/"/g, '\"');
                if (escaped.includes(',') || escaped.includes('\n')) {
                    return `"${escaped}"`;
                }
                return escaped;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    },

    /**
     * Download data as file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Make utils globally available
window.utils = utils;
