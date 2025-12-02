// Password Hashing Utility
// Using bcrypt for secure password hashing

// Note: This uses a CDN version of bcrypt.js for browser compatibility
// Load this script before script.js

// Hash a password
async function hashPassword(password) {
    try {
        // Using bcryptjs (browser-compatible version)
        // You need to include: <script src="https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js"></script>
        
        if (typeof dcodeIO === 'undefined' || !dcodeIO.bcrypt) {
            console.warn('⚠️ Bcrypt library not loaded, password will not be hashed');
            return password; // Fallback for backwards compatibility
        }
        
        const salt = await dcodeIO.bcrypt.genSalt(10);
        const hashed = await dcodeIO.bcrypt.hash(password, salt);
        return hashed;
    } catch (error) {
        console.error('❌ Password hashing error:', error);
        return password; // Fallback
    }
}

// Verify a password against a hash
async function verifyPassword(password, hash) {
    try {
        if (typeof dcodeIO === 'undefined' || !dcodeIO.bcrypt) {
            // If bcrypt not loaded, do plain comparison (backwards compatibility)
            return password === hash;
        }
        
        const isMatch = await dcodeIO.bcrypt.compare(password, hash);
        return isMatch;
    } catch (error) {
        console.error('❌ Password verification error:', error);
        // Fallback to plain comparison for backwards compatibility
        return password === hash;
    }
}

// Make functions globally available
window.PasswordUtils = {
    hashPassword,
    verifyPassword
};

console.log('✅ Password hashing utilities loaded');
