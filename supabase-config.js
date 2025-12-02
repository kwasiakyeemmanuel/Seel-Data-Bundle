// Supabase Configuration and Helper Functions
// This file is used by backend API routes only

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (backend only - uses service role key)
export function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Service role for backend
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Initialize Supabase client for frontend (uses anon key)
export function getSupabaseAnonClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

// Helper: Get user by email
export async function getUserByEmail(email) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
    }
    
    return data;
}

// Helper: Create new user
export async function createUser(userData) {
    const supabase = getSupabaseClient();
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
    
    if (error) throw error;
    return data;
}

// Helper: Create order
export async function createOrder(orderData) {
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

// Helper: Get user orders
export async function getUserOrders(userId) {
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
export async function updateOrderStatus(orderId, status) {
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
