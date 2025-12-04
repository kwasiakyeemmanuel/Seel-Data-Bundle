const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Helper function to initialize Supabase
function initSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Server configuration error');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Helper function to send JSON response
function sendResponse(res, statusCode, data) {
    return res.status(statusCode).json(data);
}

// === HANDLER FUNCTIONS ===

async function handleLogin(req, res, supabase) {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return sendResponse(res, 400, {
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
            return sendResponse(res, 401, {
                success: false,
                error: 'Invalid credentials',
                debug: adminError.message
            });
        }
        
        if (!admin) {
            return sendResponse(res, 401, {
                success: false,
                error: 'Invalid credentials - user not found'
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValidPassword) {
            return sendResponse(res, 401, {
                success: false,
                error: 'Invalid credentials - wrong password'
            });
        }
        
        return sendResponse(res, 200, {
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
        return sendResponse(res, 500, {
            success: false,
            error: 'Login failed'
        });
    }
}

async function handleGetAllUsers(res, supabase) {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, email, full_name, phone, created_at')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return sendResponse(res, 200, {
            success: true,
            data: users || []
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        return sendResponse(res, 500, {
            success: false,
            error: 'Failed to fetch users'
        });
    }
}

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
        
        return sendResponse(res, 200, {
            success: true,
            data: orders || []
        });
        
    } catch (error) {
        console.error('Get orders error:', error);
        return sendResponse(res, 500, {
            success: false,
            error: 'Failed to fetch orders'
        });
    }
}

async function handleGetContactMessages(res, supabase) {
    try {
        const { data: messages, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return sendResponse(res, 200, {
            success: true,
            data: messages || []
        });
        
    } catch (error) {
        console.error('Get contact messages error:', error);
        return sendResponse(res, 500, {
            success: false,
            error: 'Failed to fetch contact messages'
        });
    }
}

async function handleUpdateOrderStatus(req, res, supabase) {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
        return sendResponse(res, 400, {
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
        
        return sendResponse(res, 200, {
            success: true,
            message: 'Order status updated',
            order: data
        });
        
    } catch (error) {
        console.error('Update order status error:', error);
        return sendResponse(res, 500, {
            success: false,
            error: 'Failed to update order status'
        });
    }
}

async function handleGetDashboardStats(res, supabase) {
    try {
        const [usersResult, ordersResult, messagesResult] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('orders').select('id, price, status', { count: 'exact' }),
            supabase.from('contact_messages').select('id', { count: 'exact', head: true })
        ]);
        
        const completedOrders = ordersResult.data?.filter(o => o.status === 'completed') || [];
        const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0);
        
        return sendResponse(res, 200, {
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
        return sendResponse(res, 500, {
            success: false,
            error: 'Failed to fetch dashboard stats'
        });
    }
}

// === MAIN HANDLER ===

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
        
        // Validate HTTP method
        if (req.method !== 'GET' && req.method !== 'POST') {
            return sendResponse(res, 405, {
                success: false,
                error: 'Method not allowed'
            });
        }
        
        // Get action from query params (GET) or body (POST)
        const action = req.method === 'GET' ? req.query.action : req.body.action;
        
        // Initialize Supabase
        let supabase;
        try {
            supabase = initSupabase();
        } catch (error) {
            return sendResponse(res, 500, {
                success: false,
                error: error.message
            });
        }
        
        // Route to appropriate handler
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
                return sendResponse(res, 400, {
                    success: false,
                    error: 'Invalid action'
                });
        }
        
    } catch (outerError) {
        console.error('Critical admin API error:', outerError);
        try {
            res.setHeader('Content-Type', 'application/json');
            return sendResponse(res, 500, {
                success: false,
                error: 'Server error'
            });
        } catch (finalError) {
            return res.status(500).end('{"success":false,"error":"Server error"}');
        }
    }
};
