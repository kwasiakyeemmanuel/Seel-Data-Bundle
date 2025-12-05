// Vercel Serverless Function: Verify Payment with Paystack
// This securely verifies payments server-side using secret key

const { createOrder, createTransaction } = require('../supabase-config.js');

// Helper: Set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
}

// Helper: Verify payment with Paystack API
async function verifyPaystackPayment(reference) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}

// Helper: Save order and transaction to database
async function saveOrderAndTransaction(userId, orderData, reference, amount) {
    let savedOrder = null;
    let savedTransaction = null;
    
    if (!userId || !orderData) {
        return { savedOrder, savedTransaction };
    }
    
    try {
        savedOrder = await createOrder({
            userId: userId,
            network: orderData.service || 'Unknown',
            dataType: orderData.bundleSize || orderData.bundle,
            beneficiaryNumber: orderData.phoneNumber,
            price: amount,
            paymentReference: reference,
            status: 'completed'
        });
        
        savedTransaction = await createTransaction({
            orderId: savedOrder.id,
            userId: userId,
            paymentReference: reference,
            amount: amount,
            status: 'success'
        });
    } catch (dbError) {
        console.error('Database save error:', dbError);
    }
    
    return { savedOrder, savedTransaction };
}

// Helper: Format success response
function formatSuccessResponse(data, savedOrder) {
    return {
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
    };
}

// Main handler
module.exports = async function handler(req, res) {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reference, userId, orderData } = req.body;

        if (!reference) {
            return res.status(400).json({ error: 'Payment reference is required' });
        }

        const data = await verifyPaystackPayment(reference);

        if (data.status && data.data.status === 'success') {
            const amount = data.data.amount / 100;
            const { savedOrder } = await saveOrderAndTransaction(userId, orderData, reference, amount);
            
            return res.status(200).json(formatSuccessResponse(data, savedOrder));
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
