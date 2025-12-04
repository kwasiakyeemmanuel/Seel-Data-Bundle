const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
    try {
        // Set CORS headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
        
        const { action, username, password } = req.body;
        
        // Initialize Supabase client
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // === ADMIN LOGIN ===
        if (action === 'login') {
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password required'
                });
            }
            
            try {
                // Check if admin_users table exists and get admin
                const { data: admin, error: adminError } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('username', username)
                    .single();
                
                if (adminError || !admin) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }
                
                // Verify password
                const isValidPassword = await bcrypt.compare(password, admin.password_hash);
                
                if (!isValidPassword) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid credentials'
                    });
                }
                
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        role: admin.role || 'admin'
                    }
                });
                
            } catch (error) {
                console.error('Admin login error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Login failed'
                });
            }
        }
        
        // === GET ALL USERS ===
        if (action === 'getAllUsers') {
            try {
                const { data: users, error } = await supabase
                    .from('users')
                    .select('id, email, full_name, phone, created_at')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                return res.status(200).json({
                    success: true,
                    users: users || []
                });
                
            } catch (error) {
                console.error('Get users error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch users'
                });
            }
        }
        
        // === GET ALL ORDERS ===
        if (action === 'getAllOrders') {
            try {
                const { data: orders, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        network,
                        data_type,
                        beneficiary_number,
                        price,
                        status,
                        payment_reference,
                        created_at,
                        users:user_id (email, full_name, phone)
                    `)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                return res.status(200).json({
                    success: true,
                    orders: orders || []
                });
                
            } catch (error) {
                console.error('Get orders error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch orders'
                });
            }
        }
        
        // === GET CONTACT MESSAGES ===
        if (action === 'getContactMessages') {
            try {
                const { data: messages, error } = await supabase
                    .from('contact_messages')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                return res.status(200).json({
                    success: true,
                    messages: messages || []
                });
                
            } catch (error) {
                console.error('Get contact messages error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch contact messages'
                });
            }
        }
        
        // === UPDATE ORDER STATUS ===
        if (action === 'updateOrderStatus') {
            const { orderId, status } = req.body;
            
            if (!orderId || !status) {
                return res.status(400).json({
                    success: false,
                    error: 'Order ID and status required'
                });
            }
            
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', orderId)
                    .select()
                    .single();
                
                if (error) throw error;
                
                return res.status(200).json({
                    success: true,
                    message: 'Order status updated',
                    order: data
                });
                
            } catch (error) {
                console.error('Update order status error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to update order status'
                });
            }
        }
        
        // === GET DASHBOARD STATS ===
        if (action === 'getDashboardStats') {
            try {
                // Get counts in parallel
                const [usersResult, ordersResult, messagesResult] = await Promise.all([
                    supabase.from('users').select('id', { count: 'exact', head: true }),
                    supabase.from('orders').select('id, price, status', { count: 'exact' }),
                    supabase.from('contact_messages').select('id', { count: 'exact', head: true })
                ]);
                
                // Calculate total revenue from completed orders
                const completedOrders = ordersResult.data?.filter(o => o.status === 'completed') || [];
                const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0);
                
                return res.status(200).json({
                    success: true,
                    stats: {
                        totalUsers: usersResult.count || 0,
                        totalOrders: ordersResult.count || 0,
                        totalRevenue: totalRevenue.toFixed(2),
                        pendingOrders: ordersResult.data?.filter(o => o.status === 'pending').length || 0,
                        completedOrders: completedOrders.length,
                        totalMessages: messagesResult.count || 0
                    }
                });
                
            } catch (error) {
                console.error('Get dashboard stats error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch dashboard stats'
                });
            }
        }
        
        return res.status(400).json({
            success: false,
            error: 'Invalid action'
        });
        
    } catch (outerError) {
        console.error('Critical admin API error:', outerError);
        try {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                success: false,
                error: 'Server error'
            });
        } catch (finalError) {
            return res.status(500).end('{"success":false,"error":"Server error"}');
        }
    }
};
