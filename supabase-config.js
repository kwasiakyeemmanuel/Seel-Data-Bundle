// Supabase Configuration and Helper Functions
// This file is used by backend API routes only

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (backend only - uses service role key)
function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service role for backend
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Initialize Supabase client for frontend (uses anon key)
function getSupabaseAnonClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Helper: Get user by email
async function getUserByEmail(email) {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            // PGRST116 = not found, which is a valid case
            if (error.code === 'PGRST116') {
                console.log('getUserByEmail: User not found');
                return null;
            }
            
            // Other errors should be thrown
            console.error('getUserByEmail error:', error);
            throw new Error(error.message || 'Failed to fetch user');
        }
        
        return data;
    } catch (error) {
        console.error('getUserByEmail function error:', error);
        throw error;
    }
}

// Helper: Create new user
async function createUser(userData) {
    try {
        const supabase = getSupabaseClient();
        
        // Validate required fields
        if (!userData.email || !userData.fullName || !userData.phone || !userData.passwordHash) {
            throw new Error('Missing required user data fields');
        }
        
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: userData.email,
                full_name: userData.fullName,
                phone: userData.phone,
                password_hash: userData.passwordHash,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        
        if (error) {
            console.error('Supabase createUser error:', error);
            throw new Error(error.message || 'Failed to create user');
        }
        
        if (!data) {
            throw new Error('No data returned from user creation');
        }
        
        return data;
    } catch (error) {
        console.error('createUser function error:', error);
        throw error;
    }
}

// Helper: Create order
async function createOrder(orderData) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            user_id: orderData.userId,
            network: orderData.network,
            data_type: orderData.dataType,
            beneficiary_number: orderData.beneficiaryNumber,
            price: orderData.price,
            payment_reference: orderData.paymentReference,
            status: orderData.status || 'pending',
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// Export all functions for CommonJS
module.exports = {
    getSupabaseClient,
    getSupabaseAnonClient,
    getUserByEmail,
    createUser,
    createOrder,
    getUserOrders,
    updateOrderStatus,
    createTransaction
};
// Helper: Get user orders
async function getUserOrders(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

// Helper: Update order status
async function updateOrderStatus(orderId, status) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// Helper: Create transaction record
export async function createTransaction(transactionData) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            order_id: transactionData.orderId,
            user_id: transactionData.userId,
            payment_reference: transactionData.paymentReference,
            amount: transactionData.amount,
            status: transactionData.status,
            payment_method: 'paystack',
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
}
