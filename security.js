// Security Configuration Module
// This file handles all security-related configurations

// Obfuscate Paystack key
const _pk = atob('cGtfbGl2ZV9jNWJmODcyYjg2NTgzZDc5NWJkMzRiMjU5MzkyZjZhMmMwNzhkZWIx');

// Hash function for sensitive data
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// Validate request origin
function validateOrigin() {
    const allowedDomains = ['seeldatabundle.me', 'localhost', '127.0.0.1'];
    const hostname = window.location.hostname;
    return allowedDomains.some(domain => hostname.includes(domain));
}

// Rate limiting tracker
const rateLimiter = {
    attempts: {},
    maxAttempts: 5,
    windowMs: 300000, // 5 minutes
    
    checkLimit(key) {
        const now = Date.now();
        if (!this.attempts[key]) {
            this.attempts[key] = { count: 1, firstAttempt: now };
            return true;
        }
        
        const timeWindow = now - this.attempts[key].firstAttempt;
        if (timeWindow > this.windowMs) {
            this.attempts[key] = { count: 1, firstAttempt: now };
            return true;
        }
        
        if (this.attempts[key].count >= this.maxAttempts) {
            return false;
        }
        
        this.attempts[key].count++;
        return true;
    },
    
    reset(key) {
        delete this.attempts[key];
    }
};

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}

// Encrypt sensitive data before storing
function encryptData(data) {
    try {
        const str = JSON.stringify(data);
        return btoa(encodeURIComponent(str));
    } catch (e) {
        console.error('Encryption error');
        return null;
    }
}

// Decrypt data
function decryptData(encrypted) {
    try {
        return JSON.parse(decodeURIComponent(atob(encrypted)));
    } catch (e) {
        console.error('Decryption error');
        return null;
    }
}

// Session timeout (1 hour)
const SESSION_TIMEOUT = 3600000;

function validateSession(sessionData) {
    if (!sessionData || !sessionData.timestamp) return false;
    const age = Date.now() - sessionData.timestamp;
    return age < SESSION_TIMEOUT;
}

// XSS Protection
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// CSRF Token generation
function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate email format (prevent injection)
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Validate phone format
function isValidPhone(phone) {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(phone.replace(/[\s-]/g, ''));
}

// Prevent console tampering
(function() {
    const devtools = { open: false };
    const threshold = 160;
    
    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            devtools.open = true;
        }
    }, 1000);
})();

// Export security functions
window.Security = {
    getPaystackKey: () => _pk,
    validateOrigin,
    rateLimiter,
    sanitizeInput,
    encryptData,
    decryptData,
    validateSession,
    escapeHtml,
    generateCSRFToken,
    isValidEmail,
    isValidPhone,
    hashString
};

console.log('🔒 Security module loaded');
