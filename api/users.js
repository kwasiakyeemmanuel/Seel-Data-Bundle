// Vercel Serverless Function: User Operations
// Handles signup, login, profile management with Supabase

import { getUserByEmail, createUser } from '../supabase-config.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.body;

    try {
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
            const newUser = await createUser({
                email,
                fullName,
                phone,
                passwordHash
            });

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

            // Get user
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                });
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid credentials' 
                });
            }

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
        console.error('User API error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
