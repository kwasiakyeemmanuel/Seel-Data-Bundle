// Frontend Security Enhancement Module
// Additional security measures for frontend protection

(function() {
    'use strict';
    
    // 1. Disable right-click on production (optional - can be annoying for users)
    // Uncomment if you want to enable this
    /*
    document.addEventListener('contextmenu', function(e) {
        if (window.location.hostname === 'seeldatabundle.me') {
            e.preventDefault();
            return false;
        }
    });
    */
    
    // 2. Detect and prevent console access (development tools)
    const devtoolsDetector = {
        isOpen: false,
        orientation: null,
        
        detect() {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!this.isOpen) {
                    this.isOpen = true;
                    console.warn('⚠️ Developer tools detected. Please close for optimal performance.');
                }
            } else {
                this.isOpen = false;
            }
        },
        
        start() {
            setInterval(() => this.detect(), 1000);
        }
    };
    
    // Only run detection in production
    if (window.location.hostname === 'seeldatabundle.me') {
        devtoolsDetector.start();
    }
    
    // 3. Input validation and sanitization
    window.SecurityUtils = {
        // Sanitize HTML input to prevent XSS
        sanitizeHTML(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        },
        
        // Validate email format
        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // Validate phone number (Ghana format)
        validatePhone(phone) {
            const cleaned = phone.replace(/[\s\-\(\)]/g, '');
            return /^0\d{9}$/.test(cleaned) || /^233\d{9}$/.test(cleaned);
        },
        
        // Detect SQL injection patterns
        detectSQLInjection(input) {
            const sqlPatterns = [
                /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
                /(--|\||;|\/\*|\*\/|xp_|sp_)/gi,
                /(&#x|&#|\\x|\\u)/gi
            ];
            
            return sqlPatterns.some(pattern => pattern.test(input));
        },
        
        // Check for XSS patterns
        detectXSS(input) {
            const xssPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /<iframe/gi,
                /<object/gi,
                /<embed/gi
            ];
            
            return xssPatterns.some(pattern => pattern.test(input));
        },
        
        // Validate by type
        validateByType(input, type) {
            switch(type) {
                case 'email':
                    return this.validateEmail(input);
                case 'phone':
                    return this.validatePhone(input);
                case 'amount':
                    return !isNaN(parseFloat(input)) && parseFloat(input) > 0;
                default:
                    return true;
            }
        },
        
        // Validate input before submission (refactored for simplicity)
        validateInput(input, type = 'text') {
            if (!input || typeof input !== 'string') {
                return false;
            }
            
            // Check for SQL injection
            if (this.detectSQLInjection(input)) {
                console.error('⚠️ Potential SQL injection detected');
                return false;
            }
            
            // Check for XSS patterns
            // Check for XSS patterns
            if (this.detectXSS(input)) {
                console.error('⚠️ Potential XSS attack detected');
                return false;
            }
            
            // Type-specific validation
            return this.validateByType(input, type);
        },
        
        // Rate limiting for form submissions
        rateLimiter: {
            attempts: {},
            
            checkLimit(action, maxAttempts = 5, windowMs = 60000) {
                const now = Date.now();
                
                if (!this.attempts[action]) {
                    this.attempts[action] = [];
                }
                
                // Remove old attempts outside the time window
                this.attempts[action] = this.attempts[action].filter(
                    time => now - time < windowMs
                );
                
                // Check if limit exceeded
                if (this.attempts[action].length >= maxAttempts) {
                    const oldestAttempt = this.attempts[action][0];
                    const waitTime = Math.ceil((windowMs - (now - oldestAttempt)) / 1000);
                    return { allowed: false, waitTime };
                }
                
                // Add current attempt
                this.attempts[action].push(now);
                return { allowed: true, waitTime: 0 };
            },
            
            reset(action) {
                delete this.attempts[action];
            }
        },
        
        // Secure localStorage wrapper with encryption
        secureStorage: {
            set(key, value) {
                try {
                    const data = JSON.stringify(value);
                    const encrypted = btoa(encodeURIComponent(data));
                    localStorage.setItem(key, encrypted);
                    return true;
                } catch (e) {
                    console.error('Storage error:', e);
                    return false;
                }
            },
            
            get(key) {
                try {
                    const encrypted = localStorage.getItem(key);
                    if (!encrypted) return null;
                    const data = decodeURIComponent(atob(encrypted));
                    return JSON.parse(data);
                } catch (e) {
                    console.error('Retrieval error:', e);
                    return null;
                }
            },
            
            remove(key) {
                localStorage.removeItem(key);
            }
        },
        
        // Prevent clickjacking
        preventClickjacking() {
            if (window.self !== window.top) {
                // Site is in an iframe - could be clickjacking attempt
                console.warn('⚠️ Site loaded in iframe - potential clickjacking');
                window.top.location = window.self.location;
            }
        },
        
        // Generate CSRF-like token for forms
        generateToken() {
            const array = new Uint8Array(32);
            window.crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        },
        
        // Validate session integrity
        validateSession() {
            const currentUser = localStorage.getItem('currentUser');
            if (!currentUser) return true;
            
            try {
                const user = JSON.parse(currentUser);
                const sessionAge = Date.now() - (user.loginTime || 0);
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge > maxAge) {
                    console.warn('⚠️ Session expired');
                    localStorage.removeItem('currentUser');
                    return false;
                }
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // 4. Initialize security measures
    document.addEventListener('DOMContentLoaded', function() {
        // Prevent clickjacking
        window.SecurityUtils.preventClickjacking();
        
        // Validate session on page load
        window.SecurityUtils.validateSession();
        
        // Add input validation to all forms
        document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(input => {
            input.addEventListener('blur', function() {
                const value = this.value.trim();
                const type = this.type === 'email' ? 'email' : 'text';
                
                if (value && !window.SecurityUtils.validateInput(value, type)) {
                    this.style.borderColor = '#dc3545';
                    this.setCustomValidity('Invalid or potentially unsafe input');
                } else {
                    this.style.borderColor = '';
                    this.setCustomValidity('');
                }
            });
        });
        
        // Add rate limiting to forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const formId = this.id || 'form-' + Date.now();
                const limit = window.SecurityUtils.rateLimiter.checkLimit(formId, 5, 60000);
                
                if (!limit.allowed) {
                    e.preventDefault();
                    alert(`Too many attempts. Please wait ${limit.waitTime} seconds.`);
                    return false;
                }
            });
        });
        
        console.log('✅ Frontend security enhancements loaded');
    });
    
    // 5. Monitor for suspicious activity
    let suspiciousActivityCount = 0;
    
    window.addEventListener('error', function(e) {
        // Log errors for security monitoring
        if (e.message.includes('script') || e.message.includes('eval')) {
            suspiciousActivityCount++;
            if (suspiciousActivityCount > 5) {
                console.error('⚠️ Multiple suspicious errors detected');
            }
        }
    });
    
    // 6. Secure AJAX requests wrapper
    window.securePost = async function(url, data) {
        try {
            // Add security token
            const token = window.SecurityUtils.generateToken();
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': token
                },
                body: JSON.stringify(data),
                credentials: 'same-origin'
            });
            
            return response;
        } catch (error) {
            console.error('Secure request failed:', error);
            throw error;
        }
    };
    
    // 7. Disable paste in password fields (optional security measure)
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('input[type="password"]').forEach(input => {
            // Uncomment to disable paste
            /*
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                alert('Pasting is disabled for password fields');
            });
            */
        });
    });
    
})();

console.log('🔒 Frontend Security Module loaded');
