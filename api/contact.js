const { createContact } = require('../supabase-config.js');

// Helper: Set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Helper: Validate required fields
function validateRequiredFields(data) {
    const { name, email, subject, message } = data;
    return name && email && subject && message;
}

// Helper: Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper: Sanitize contact data
function sanitizeContactData({ name, email, phone, subject, message }) {
    return {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim()
    };
}

// Helper: Error response
function sendError(res, statusCode, message) {
    return res.status(statusCode).json({
        status: 'error',
        message
    });
}

// Main handler
module.exports = async function handler(req, res) {
    try {
        setCorsHeaders(res);
        
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        if (req.method !== 'POST') {
            return sendError(res, 405, 'Method not allowed');
        }
        
        try {
            const { name, email, phone, subject, message } = req.body;
            
            if (!validateRequiredFields({ name, email, subject, message })) {
                return sendError(res, 400, 'All required fields must be filled');
            }
            
            if (!isValidEmail(email)) {
                return sendError(res, 400, 'Invalid email format');
            }
            
            const contactData = sanitizeContactData({ name, email, phone, subject, message });
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
            return sendError(res, 500, 'Failed to send message. Please try again.');
        }
        
    } catch (outerError) {
        console.error('❌ Critical contact API error:', outerError);
        try {
            return sendError(res, 500, 'Server error');
        } catch (finalError) {
            return res.status(500).end('{"status":"error","message":"Server error"}');
        }
    }
};
