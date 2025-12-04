// Hash generator endpoint
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
    try {
        // Get password from query parameter or use default
        const password = req.query.password || 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(200).json({
            success: true,
            password: password,
            hash: hash,
            sql: `UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';`,
            usage: 'To generate hash for custom password, visit: /api/generate-hash?password=YourPassword'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
