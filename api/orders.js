// Vercel Serverless Function: Order Operations
// Handles creating orders and fetching order history

import { createOrder, getUserOrders, updateOrderStatus, createTransaction } from '../supabase-config.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://seeldatabundle.me');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.body;

    try {
        // === CREATE ORDER ===
        if (action === 'create' && req.method === 'POST') {
            const { userId, network, dataType, beneficiaryNumber, price, paymentReference } = req.body;

            // Validate input
            if (!userId || !network || !dataType || !beneficiaryNumber || !price) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'All order fields are required' 
                });
            }

            // Create order
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
                order: {
                    id: order.id,
                    network: order.network,
                    dataType: order.data_type,
                    beneficiaryNumber: order.beneficiary_number,
                    price: order.price,
                    status: order.status,
                    createdAt: order.created_at
                }
            });
        }

        // === GET USER ORDERS ===
        if (action === 'history' && req.method === 'POST') {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'User ID is required' 
                });
            }

            const orders = await getUserOrders(userId);

            // Format orders
            const formattedOrders = orders.map(order => ({
                id: order.id,
                network: order.network,
                dataType: order.data_type,
                beneficiaryNumber: order.beneficiary_number,
                price: order.price,
                paymentReference: order.payment_reference,
                status: order.status,
                createdAt: order.created_at
            }));

            return res.status(200).json({
                success: true,
                orders: formattedOrders,
                total: formattedOrders.length
            });
        }

        // === UPDATE ORDER STATUS ===
        if (action === 'update-status' && req.method === 'POST') {
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

        // === CREATE TRANSACTION ===
        if (action === 'create-transaction' && req.method === 'POST') {
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

        // Invalid action
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
