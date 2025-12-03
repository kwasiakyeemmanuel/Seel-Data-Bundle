// Vercel Serverless Function: Verify Payment with Paystack
// This securely verifies payments server-side using secret key

const { createOrder, createTransaction } = require('../supabase-config.js');

module.exports = async function handler(req, res) {
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
        const { reference, userId, orderData } = req.body;

        if (!reference) {
            return res.status(400).json({ error: 'Payment reference is required' });
        }

        // Verify payment with Paystack
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.status && data.data.status === 'success') {
            // Payment verified! Save order to Supabase
            let savedOrder = null;
            let savedTransaction = null;
            
            if (userId && orderData) {
                try {
                    // Save order
                    savedOrder = await createOrder({
                        userId: userId,
                        network: orderData.service || 'Unknown',
                        dataType: orderData.bundleSize || orderData.bundle,
                        beneficiaryNumber: orderData.phoneNumber,
                        price: data.data.amount / 100,
                        paymentReference: reference,
                        status: 'completed'
                    });
                    
                    // Save transaction
                    savedTransaction = await createTransaction({
                        orderId: savedOrder.id,
                        userId: userId,
                        paymentReference: reference,
                        amount: data.data.amount / 100,
                        status: 'success'
                    });
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                }
            }
            
            return res.status(200).json({
                success: true,
                verified: true,
                amount: data.data.amount / 100,
                customer: {
                    email: data.data.customer.email,
                    phone: data.data.metadata?.phone_number || data.data.metadata?.phone || null
                },
                metadata: data.data.metadata,
                paid_at: data.data.paid_at,
                reference: data.data.reference,
                order: savedOrder ? {
                    id: savedOrder.id,
                    status: savedOrder.status
                } : null
            });
        } else {
            return res.status(400).json({
                success: false,
                verified: false,
                message: 'Payment verification failed'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Payment verification failed'
        });
    }
}
