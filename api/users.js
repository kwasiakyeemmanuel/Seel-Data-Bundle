// Vercel Serverless Function: User Operations
// Handles signup, login, profile management with Supabase

const { getUserByEmail, createUser } = require('../supabase-config.js');
const bcrypt = require('bcryptjs');

// Helper: Validate required fields
function validateRequiredFields(fields, fieldNames) {
    return fieldNames.every(name => fields[name]);
}

// Helper: Create user response object
function createUserResponse(user) {
    return {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        createdAt: user.created_at
    };
}

// === SIGNUP HANDLER ===
async function handleSignup(req, res) {
    const { email, fullName, phone, password } = req.body;

    // Validate input
    if (!validateRequiredFields(req.body, ['email', 'fullName', 'phone', 'password'])) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ 
            success: false, 
            error: 'User already exists' 
        });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    try {
        const newUser = await createUser({
            email,
            fullName,
            phone,
            passwordHash
        });

        if (!newUser) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to create user account. Please try again.' 
            });
        }

        return res.status(201).json({
            success: true,
            user: createUserResponse(newUser)
        });
    } catch (dbError) {
        console.error('Database error creating user:', dbError);
        return res.status(500).json({ 
            success: false, 
            error: 'Failed to create user account. Please try again.',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
    }
}

// === LOGIN HANDLER ===
async function handleLogin(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!validateRequiredFields(req.body, ['email', 'password'])) {
        return res.status(400).json({ 
            success: false, 
            error: 'Email and password are required' 
        });
    }

    try {
        // Get user
        console.log('LOGIN: Fetching user for email:', email);
        const user = await getUserByEmail(email);
        
        if (!user) {
            console.log('LOGIN: User not found');
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        console.log('LOGIN: User found, verifying password');
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            console.log('LOGIN: Password mismatch');
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        console.log('LOGIN: Password verified, returning user data');

        return res.status(200).json({
            success: true,
            user: createUserResponse(user)
        });
    } catch (loginError) {
        console.error('LOGIN: Error during login:', loginError);
        return res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? loginError.message : undefined
        });
    }
}

// === PROFILE HANDLER ===
async function handleProfile(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false, 
            error: 'Email is required' 
        });
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            error: 'User not found' 
        });
    }

    return res.status(200).json({
        success: true,
        user: createUserResponse(user)
    });
}

// === MAIN HANDLER ===
module.exports = async function handler(req, res) {
    try {
        // Enable CORS and set Content-Type FIRST
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ 
                success: false,
                error: 'Method not allowed. Use POST.' 
            });
        }

        // Validate request body exists
        if (!req.body) {
            return res.status(400).json({ 
                success: false, 
                error: 'Request body is required' 
            });
        }

        const { action } = req.body;

        // Validate action exists
        if (!action) {
            return res.status(400).json({ 
                success: false, 
                error: 'Action parameter is required' 
            });
        }

        // Route to appropriate handler
        switch (action) {
            case 'signup':
                return await handleSignup(req, res);
            case 'login':
                return await handleLogin(req, res);
            case 'profile':
                return await handleProfile(req, res);
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid action' 
                });
        }
        
    } catch (outerError) {
        console.error('User API error (critical):', outerError);
        try {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                error: 'Critical server error',
                details: outerError.message
            });
        } catch (finalError) {
            console.error('Failed to send error response:', finalError);
            return res.status(500).end('{"success":false,"error":"Server error"}');
        }
    }
}
