// Test endpoint to verify Supabase connection and admin user
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                error: 'Missing environment variables'
            });
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test: Fetch admin user
        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('username, password_hash, role')
            .eq('username', 'admin')
            .single();
        
        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Supabase error',
                details: error.message
            });
        }
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                error: 'Admin user not found'
            });
        }
        
        // Test bcrypt comparison
        const testPassword = 'admin123';
        const passwordMatch = await bcrypt.compare(testPassword, admin.password_hash);
        
        return res.status(200).json({
            success: true,
            admin: {
                username: admin.username,
                role: admin.role,
                hashPreview: admin.password_hash.substring(0, 20)
            },
            bcryptTest: {
                testPassword: testPassword,
                matches: passwordMatch
            }
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error',
            details: error.message
        });
    }
}
