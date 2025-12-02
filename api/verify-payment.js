// Vercel Serverless Function: Verify Payment with Paystack
// This securely verifies payments server-side using secret key

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS for your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://seeldatabundle.me');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { reference } = req.body;

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
            return res.status(200).json({
                success: true,
                verified: true,
                amount: data.data.amount / 100, // Convert from kobo to naira
                customer: {
                    email: data.data.customer.email,
                    phone: data.data.metadata?.phone || null
                },
                metadata: data.data.metadata,
                paid_at: data.data.paid_at,
                reference: data.data.reference
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
