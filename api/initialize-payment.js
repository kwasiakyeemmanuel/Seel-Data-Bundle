// Vercel Serverless Function: Initialize Payment with Paystack
// This keeps your Paystack secret key secure on the backend

export default async function handler(req, res) {
    // Enable CORS and set Content-Type
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, amount, metadata } = req.body;

        // Validate input
        if (!email || !amount) {
            return res.status(400).json({ error: 'Email and amount are required' });
        }

        // Initialize payment with Paystack
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // Convert to kobo
                metadata: metadata || {},
                callback_url: 'https://seeldatabundle.me'
            })
        });

        const data = await response.json();

        if (data.status) {
            return res.status(200).json({
                success: true,
                authorization_url: data.data.authorization_url,
                access_code: data.data.access_code,
                reference: data.data.reference
            });
        } else {
            return res.status(400).json({
                success: false,
                error: data.message
            });
        }

    } catch (error) {
        console.error('Payment initialization error:', error);
        return res.status(500).json({
            success: false,
            error: 'Payment initialization failed'
        });
    }
}
