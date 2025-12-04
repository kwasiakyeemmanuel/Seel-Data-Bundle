const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Helper: Initialize Supabase client
function initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Server configuration error');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Helper: Set CORS headers
function setCorsHeaders(res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Action: Admin Login
async function handleLogin(req, res, supabase) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password required'
        });
    }
    
    try {
        const { data: admin, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .single();
        
        if (adminError) {
            console.error('Supabase error:', adminError);
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                debug: adminError.message
            });
        }
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials - user not found'
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials - wrong password'
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

// Action: Get All Users
async function handleGetAllUsers(res, supabase) {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, full_name, phone, created_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return res.status(200).json({
            success: true,
            data: users || []
        });
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
}

// Action: Get All Orders
async function handleGetAllOrders(res, supabase) {
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
            data: orders || []
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
}

// Action: Get Contact Messages
async function handleGetContactMessages(res, supabase) {
    try {
        const { data: messages, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return res.status(200).json({
            success: true,
            data: messages || []
        });
    } catch (error) {
        console.error('Get contact messages error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch contact messages'
        });
    }
}

// Action: Update Order Status
async function handleUpdateOrderStatus(req, res, supabase) {
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

// Action: Get Dashboard Stats
async function handleGetDashboardStats(res, supabase) {
    try {
        const [usersResult, ordersResult, messagesResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('orders').select('id, price, status', { count: 'exact' }),
            supabase.from('contact_messages').select('id', { count: 'exact', head: true })
        ]);
        
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

// Main handler
module.exports = async function handler(req, res) {
// Main handler
module.exports = async function handler(req, res) {
    try {
        setCorsHeaders(res);
        
        // Handle OPTIONS preflight
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        // Get action from query params (GET) or body (POST)
        let action;
        
        if (req.method === 'GET') {
            action = req.query.action;
        } else if (req.method === 'POST') {
            action = req.body.action;
        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
        
        // Initialize Supabase
        let supabase;
        try {
            supabase = initSupabase();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
        
        // Route to action handlers
        switch (action) {
            case 'login':
                return await handleLogin(req, res, supabase);
            
            case 'getAllUsers':
                return await handleGetAllUsers(res, supabase);
            
            case 'getAllOrders':
                return await handleGetAllOrders(res, supabase);
            
            case 'getContactMessages':
                return await handleGetContactMessages(res, supabase);
            
            case 'updateOrderStatus':
                return await handleUpdateOrderStatus(req, res, supabase);
            
            case 'getDashboardStats':
                return await handleGetDashboardStats(res, supabase);
            
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action'
                });
        }
        
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
