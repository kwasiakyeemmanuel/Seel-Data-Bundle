// Vercel Serverless Function: User Operations
// Handles signup, login, profile management with Supabase

import { getUserByEmail, createUser } from '../supabase-config.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    try {
        // Enable CORS and set Content-Type FIRST (before any other logic)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
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

        // === SIGNUP ===
        if (action === 'signup' && req.method === 'POST') {
            const { email, fullName, phone, password } = req.body;

            // Validate input
            if (!email || !fullName || !phone || !password) {
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
            let newUser;
            try {
                newUser = await createUser({
                    email,
                    fullName,
                    phone,
                    passwordHash
                });
            } catch (dbError) {
                console.error('Database error creating user:', dbError);
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to create user account. Please try again.',
                    details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
                });
            }

            if (!newUser) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to create user account. Please try again.' 
                });
            }

            // Return user without password hash
            return res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    fullName: newUser.full_name,
                    phone: newUser.phone,
                    createdAt: newUser.created_at
                }
            });
        }

        // === LOGIN ===
        if (action === 'login' && req.method === 'POST') {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
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

                // Return user without password hash
                return res.status(200).json({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        phone: user.phone,
                        createdAt: user.created_at
                    }
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

        // === GET PROFILE ===
        if (action === 'profile' && req.method === 'POST') {
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
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    phone: user.phone,
                    createdAt: user.created_at
                }
            });
        }

        // Invalid action
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid action' 
        });

    } catch (error) {
        console.error('User API error (inner):', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
        });
    }
    } catch (outerError) {
        console.error('User API error (outer - critical):', outerError);
        // Ensure we always return JSON even if headers fail
        try {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                error: 'Critical server error',
                details: outerError.message
            });
        } catch (finalError) {
            // Last resort - just end the response
            console.error('Failed to send error response:', finalError);
            return res.status(500).end('{"success":false,"error":"Server error"}');
        }
    }
}
