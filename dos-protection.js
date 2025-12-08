// DDoS/DoS Protection System for Seel Data Bundle
// Implements rate limiting, request throttling, and suspicious activity detection

(function() {
    'use strict';

    const DOSProtection = {
        config: {
            maxRequestsPerMinute: 60,
            maxRequestsPer5Minutes: 200,
            maxFailedAttempts: 5,
            blockDuration: 15 * 60 * 1000, // 15 minutes
            suspiciousThreshold: 100,
            enableLogging: true
        },

        storage: {
            requests: [],
            failedAttempts: {},
            blockedIPs: {},
            suspiciousActivity: []
        },

        // Initialize protection
        init: function() {
            this.startMonitoring();
            this.cleanupOldData();
            this.interceptRequests();
            console.log('🛡️ DoS Protection System Active');
        },

        // Generate fingerprint for user identification
        generateFingerprint: function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Browser Fingerprint', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('DoS Protection', 4, 17);
            
            const fingerprint = canvas.toDataURL();
            const screen = `${window.screen.width}x${window.screen.height}`;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const language = navigator.language;
            const platform = navigator.platform;
            
            return btoa(`${fingerprint}${screen}${timezone}${language}${platform}`).substring(0, 32);
        },

        // Check if user is blocked
        isBlocked: function(fingerprint) {
            const blocked = this.storage.blockedIPs[fingerprint];
            if (blocked && Date.now() < blocked.until) {
                return true;
            } else if (blocked) {
                delete this.storage.blockedIPs[fingerprint];
                return false;
            }
            return false;
        },

        // Block a user
        blockUser: function(fingerprint, reason) {
            this.storage.blockedIPs[fingerprint] = {
                until: Date.now() + this.config.blockDuration,
                reason: reason,
                blockedAt: Date.now()
            };
            
            localStorage.setItem('dosBlocked', JSON.stringify({
                until: this.storage.blockedIPs[fingerprint].until,
                reason: reason
            }));

            if (this.config.enableLogging) {
                console.warn('🚫 User blocked for:', reason);
            }

            this.showBlockedModal(reason, this.config.blockDuration / 60000);
        },

        // Track request
        trackRequest: function(fingerprint) {
            const now = Date.now();
            this.storage.requests.push({ fingerprint, time: now });

            // Check rate limits
            const recentRequests = this.storage.requests.filter(req => 
                req.fingerprint === fingerprint && now - req.time < 60000
            );

            const requests5Min = this.storage.requests.filter(req => 
                req.fingerprint === fingerprint && now - req.time < 300000
            );

            if (recentRequests.length > this.config.maxRequestsPerMinute) {
                this.blockUser(fingerprint, 'Excessive requests per minute');
                return false;
            }

            if (requests5Min.length > this.config.maxRequestsPer5Minutes) {
                this.blockUser(fingerprint, 'Excessive requests in 5 minutes');
                return false;
            }

            if (recentRequests.length > this.config.suspiciousThreshold / 2) {
                this.storage.suspiciousActivity.push({
                    fingerprint,
                    time: now,
                    reason: 'High request rate'
                });
            }

            return true;
        },

        // Track failed attempts (login, payment, etc.)
        trackFailedAttempt: function(fingerprint, type) {
            if (!this.storage.failedAttempts[fingerprint]) {
                this.storage.failedAttempts[fingerprint] = [];
            }

            this.storage.failedAttempts[fingerprint].push({
                type: type,
                time: Date.now()
            });

            const recentFailed = this.storage.failedAttempts[fingerprint].filter(
                attempt => Date.now() - attempt.time < 300000 // 5 minutes
            );

            if (recentFailed.length >= this.config.maxFailedAttempts) {
                this.blockUser(fingerprint, `Too many failed ${type} attempts`);
                return false;
            }

            return true;
        },

        // Intercept XMLHttpRequest and Fetch
        interceptRequests: function() {
            const self = this;
            const fingerprint = this.generateFingerprint();

            // Check if already blocked on page load
            const blocked = localStorage.getItem('dosBlocked');
            if (blocked) {
                const blockData = JSON.parse(blocked);
                if (Date.now() < blockData.until) {
                    this.showBlockedModal(blockData.reason, (blockData.until - Date.now()) / 60000);
                    return;
                } else {
                    localStorage.removeItem('dosBlocked');
                }
            }

            // Intercept fetch
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                if (self.isBlocked(fingerprint)) {
                    return Promise.reject(new Error('Access denied: Too many requests'));
                }
                
                if (!self.trackRequest(fingerprint)) {
                    return Promise.reject(new Error('Rate limit exceeded'));
                }

                return originalFetch.apply(this, args);
            };

            // Intercept XMLHttpRequest
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(...args) {
                if (self.isBlocked(fingerprint)) {
                    throw new Error('Access denied: Too many requests');
                }
                
                if (!self.trackRequest(fingerprint)) {
                    throw new Error('Rate limit exceeded');
                }

                return originalOpen.apply(this, args);
            };
        },

        // Monitor for suspicious patterns
        startMonitoring: function() {
            setInterval(() => {
                this.cleanupOldData();
                this.detectAnomalies();
            }, 30000); // Every 30 seconds
        },

        // Cleanup old tracking data
        cleanupOldData: function() {
            const now = Date.now();
            const fiveMinutesAgo = now - 300000;

            // Clean requests
            this.storage.requests = this.storage.requests.filter(
                req => req.time > fiveMinutesAgo
            );

            // Clean failed attempts
            Object.keys(this.storage.failedAttempts).forEach(fingerprint => {
                this.storage.failedAttempts[fingerprint] = 
                    this.storage.failedAttempts[fingerprint].filter(
                        attempt => attempt.time > fiveMinutesAgo
                    );
                
                if (this.storage.failedAttempts[fingerprint].length === 0) {
                    delete this.storage.failedAttempts[fingerprint];
                }
            });

            // Clean suspicious activity
            this.storage.suspiciousActivity = this.storage.suspiciousActivity.filter(
                activity => activity.time > fiveMinutesAgo
            );
        },

        // Detect anomalies
        detectAnomalies: function() {
            const now = Date.now();
            const fingerprint = this.generateFingerprint();
            
            // Check for rapid-fire requests
            const lastMinute = this.storage.requests.filter(
                req => req.fingerprint === fingerprint && now - req.time < 60000
            );

            if (lastMinute.length > this.config.suspiciousThreshold) {
                this.storage.suspiciousActivity.push({
                    fingerprint,
                    time: now,
                    reason: 'Possible DDoS attack pattern detected'
                });
                
                this.blockUser(fingerprint, 'Suspicious activity detected');
            }
        },

        // Show blocked modal
        showBlockedModal: function(reason, minutesRemaining) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'dosBlockedModal';
            modal.style.display = 'flex';
            modal.style.zIndex = '99999';
            
            const minutes = Math.ceil(minutesRemaining);
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px; background: linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%); color: white;">
                    <div style="text-align: center; padding: 30px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">🛡️</div>
                        <h2 style="margin-bottom: 15px; color: white;">Access Temporarily Blocked</h2>
                        <p style="font-size: 16px; margin-bottom: 20px; color: rgba(255,255,255,0.9);">
                            ${reason}
                        </p>
                        <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Time remaining:</div>
                            <div style="font-size: 32px; font-weight: 700;">${minutes} minutes</div>
                        </div>
                        <p style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
                            This is an automated security measure to protect our service from abuse.
                        </p>
                        <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; font-size: 13px; text-align: left;">
                            <strong>What you can do:</strong><br>
                            • Wait for the block to expire<br>
                            • Contact support if you believe this is an error<br>
                            • Avoid rapid or automated requests
                        </div>
                        <div style="margin-top: 20px;">
                            <a href="https://wa.me/233537922905" target="_blank" 
                               style="display: inline-block; padding: 12px 24px; background: white; color: #C92A2A; border-radius: 8px; text-decoration: none; font-weight: 600;">
                                <i class="fab fa-whatsapp"></i> Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);

            // Disable interactions
            document.body.style.overflow = 'hidden';
            document.body.style.pointerEvents = 'none';
            modal.style.pointerEvents = 'auto';
        },

        // Public method to track failed login
        trackFailedLogin: function() {
            const fingerprint = this.generateFingerprint();
            return this.trackFailedAttempt(fingerprint, 'login');
        },

        // Public method to track failed payment
        trackFailedPayment: function() {
            const fingerprint = this.generateFingerprint();
            return this.trackFailedAttempt(fingerprint, 'payment');
        },

        // Get protection stats
        getStats: function() {
            const fingerprint = this.generateFingerprint();
            const now = Date.now();
            
            return {
                requestsLastMinute: this.storage.requests.filter(
                    req => req.fingerprint === fingerprint && now - req.time < 60000
                ).length,
                requestsLast5Minutes: this.storage.requests.filter(
                    req => req.fingerprint === fingerprint && now - req.time < 300000
                ).length,
                isBlocked: this.isBlocked(fingerprint),
                failedAttempts: (this.storage.failedAttempts[fingerprint] || []).length,
                suspiciousActivityCount: this.storage.suspiciousActivity.length
            };
        }
    };

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            DOSProtection.init();
        });
    } else {
        DOSProtection.init();
    }

    // Expose to window for integration
    window.DOSProtection = DOSProtection;

})();
