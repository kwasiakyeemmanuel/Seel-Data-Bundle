// Hash generator endpoint
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(200).json({
            success: true,
            password: password,
            hash: hash,
            sql: `UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
