/**
 * Common JavaScript Utilities
 * Type-safe helper functions for all frontend pages
 */

/**
 * Ensure a value is a string
 * @param {any} value - Value to convert
 * @param {string} defaultValue - Default value if conversion fails
 * @returns {string}
 */
function ensureString(value, defaultValue = '') {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return defaultValue;
    return String(value);
}

/**
 * Ensure a value is an array
 * @param {any} value - Value to convert
 * @param {array} defaultValue - Default value if not an array
 * @returns {array}
 */
function ensureArray(value, defaultValue = []) {
    return Array.isArray(value) ? value : defaultValue;
}

/**
 * Safely escape HTML
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
    const textStr = ensureString(text);
    const div = document.createElement('div');
    div.textContent = textStr;
    return div.innerHTML;
}

/**
 * Safely get nested object property
 * @param {object} obj - Object to get property from
 * @param {string} path - Dot-separated path (e.g., 'data.user.name')
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any}
 */
function safeGet(obj, path, defaultValue = null) {
    if (!obj || typeof obj !== 'object') return defaultValue;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }

    return result !== undefined ? result : defaultValue;
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 * @param {HTMLElement} feedbackElement - Optional element to show feedback
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text, feedbackElement = null) {
    const textStr = ensureString(text);

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textStr);
            showCopyFeedback(feedbackElement, true);
            return true;
        }
    } catch (err) {
        console.warn('Clipboard API failed, using fallback');
    }

    // Fallback method
    try {
        const textarea = document.createElement('textarea');
        textarea.value = textStr;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopyFeedback(feedbackElement, success);
        return success;
    } catch (err) {
        console.error('Copy failed:', err);
        showCopyFeedback(feedbackElement, false);
        return false;
    }
}

/**
 * Show visual feedback for copy operation
 * @param {HTMLElement} element - Element to show feedback on
 * @param {boolean} success - Whether copy was successful
 */
function showCopyFeedback(element, success) {
    if (!element) return;

    const isButton = element.tagName === 'BUTTON';

    if (isButton) {
        const originalText = element.innerHTML;
        const originalClass = element.className;

        if (success) {
            element.innerHTML = '<i class="bi bi-check"></i> Copied!';
            element.classList.add('btn-success');
        } else {
            element.innerHTML = '<i class="bi bi-x"></i> Failed';
            element.classList.add('btn-danger');
        }

        setTimeout(() => {
            element.innerHTML = originalText;
            element.className = originalClass;
        }, 2000);
    } else {
        const originalBg = element.style.backgroundColor;
        const originalColor = element.style.color;

        if (success) {
            element.style.backgroundColor = 'var(--green)';
            element.style.color = 'var(--background)';
        } else {
            element.style.backgroundColor = 'var(--red)';
            element.style.color = 'var(--background)';
        }

        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            element.style.color = originalColor;
        }, 300);
    }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
function formatDate(date, options = {}) {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    } catch (err) {
        return 'Invalid Date';
    }
}

/**
 * Show loading state in element
 * @param {HTMLElement} element - Element to show loading in
 * @param {string} message - Loading message
 */
function showLoading(element, message = 'Loading...') {
    if (element) {
        element.innerHTML = `<div class="loading">${escapeHtml(message)}</div>`;
    }
}

/**
 * Show error state in element
 * @param {HTMLElement} element - Element to show error in
 * @param {string} message - Error message
 */
function showError(element, message = 'An error occurred') {
    if (element) {
        element.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    }
}

/**
 * Show success state in element
 * @param {HTMLElement} element - Element to show success in
 * @param {string} message - Success message
 */
function showSuccess(element, message = 'Success') {
    if (element) {
        element.innerHTML = `<div class="success">${escapeHtml(message)}</div>`;
    }
}

// Export functions if using modules, otherwise they're global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ensureString,
        ensureArray,
        escapeHtml,
        safeGet,
        copyToClipboard,
        showCopyFeedback,
        debounce,
        formatDate,
        showLoading,
        showError,
        showSuccess
    };
}
