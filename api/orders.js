// Vercel Serverless Function: Order Operations
// Handles creating orders and fetching order history

const { createOrder, getUserOrders, updateOrderStatus, createTransaction } = require('../supabase-config.js');

// Helper: Set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
}

// Helper: Format order response
function formatOrder(order) {
    return {
        id: order.id,
        network: order.network,
        dataType: order.data_type,
        beneficiaryNumber: order.beneficiary_number,
        price: order.price,
        paymentReference: order.payment_reference,
        status: order.status,
        createdAt: order.created_at
    };
}

// Handler: Create order
async function handleCreateOrder(req, res) {
    const { userId, network, dataType, beneficiaryNumber, price, paymentReference } = req.body;

    if (!userId || !network || !dataType || !beneficiaryNumber || !price) {
        return res.status(400).json({ 
            success: false, 
            error: 'All order fields are required' 
        });
    }

    const order = await createOrder({
        userId,
        network,
        dataType,
        beneficiaryNumber,
        price,
        paymentReference: paymentReference || null,
        status: 'pending'
    });

    return res.status(201).json({
        success: true,
        order: formatOrder(order)
    });
}

// Handler: Get user order history
async function handleGetOrderHistory(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'User ID is required' 
        });
    }

    const orders = await getUserOrders(userId);
    const formattedOrders = orders.map(formatOrder);

    return res.status(200).json({
        success: true,
        orders: formattedOrders,
        total: formattedOrders.length
    });
}

// Handler: Update order status
async function handleUpdateOrderStatus(req, res) {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ 
            success: false, 
            error: 'Order ID and status are required' 
        });
    }

    const updatedOrder = await updateOrderStatus(orderId, status);

    return res.status(200).json({
        success: true,
        order: {
            id: updatedOrder.id,
            status: updatedOrder.status,
            updatedAt: updatedOrder.updated_at
        }
    });
}

// Handler: Create transaction
async function handleCreateTransaction(req, res) {
    const { orderId, userId, paymentReference, amount, status } = req.body;

    if (!orderId || !userId || !paymentReference || !amount || !status) {
        return res.status(400).json({ 
            success: false, 
            error: 'All transaction fields are required' 
        });
    }

    const transaction = await createTransaction({
        orderId,
        userId,
        paymentReference,
        amount,
        status
    });

    return res.status(201).json({
        success: true,
        transaction: {
            id: transaction.id,
            paymentReference: transaction.payment_reference,
            amount: transaction.amount,
            status: transaction.status,
            createdAt: transaction.created_at
        }
    });
}

// Main handler
module.exports = async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.body;

    try {
        if (action === 'create' && req.method === 'POST') {
            return await handleCreateOrder(req, res);
        }
        
        if (action === 'history' && req.method === 'POST') {
            return await handleGetOrderHistory(req, res);
        }
        
        if (action === 'update-status' && req.method === 'POST') {
            return await handleUpdateOrderStatus(req, res);
        }
        
        if (action === 'create-transaction' && req.method === 'POST') {
            return await handleCreateTransaction(req, res);
        }

        return res.status(400).json({ 
            success: false, 
            error: 'Invalid action' 
        });

    } catch (error) {
        console.error('Order API error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
