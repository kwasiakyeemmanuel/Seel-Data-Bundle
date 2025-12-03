const { createContact } = require('../supabase-config.js');

module.exports = async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Only allow POST
        if (req.method !== 'POST') {
            return res.status(405).json({
                status: 'error',
                message: 'Method not allowed'
            });
        }
        
        try {
            const { name, email, phone, subject, message } = req.body;
            
            // Validate required fields
            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    status: 'error',
                    message: 'All required fields must be filled'
                });
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid email format'
                });
            }
            
            // Save to Supabase
            const contactData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : null,
                subject: subject.trim(),
                message: message.trim()
            };
            
            const result = await createContact(contactData);
            
            if (!result) {
                throw new Error('Failed to save contact message');
            }
            
            console.log('✅ Contact message saved:', result.id);
            
            return res.status(200).json({
                status: 'success',
                message: 'Message sent successfully'
            });
            
        } catch (error) {
            console.error('❌ Contact form error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to send message. Please try again.'
            });
        }
        
    } catch (outerError) {
        console.error('❌ Critical contact API error:', outerError);
        try {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                status: 'error',
                message: 'Server error'
            });
        } catch (finalError) {
            return res.status(500).end('{"status":"error","message":"Server error"}');
        }
    }
};
