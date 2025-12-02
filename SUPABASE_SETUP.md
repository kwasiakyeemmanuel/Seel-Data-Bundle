# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - Name: `seel-data-bundle`
   - Database Password: (save this securely)
   - Region: Choose closest to Ghana (e.g., Frankfurt, London)
4. Click "Create new project" (takes ~2 minutes)

## Step 2: Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this SQL:

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    network TEXT NOT NULL,
    data_type TEXT NOT NULL,
    beneficiary_number TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    payment_reference TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    payment_reference TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT DEFAULT 'paystack',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX idx_transactions_payment_reference ON transactions(payment_reference);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for orders table
CREATE POLICY "Users can read own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can read own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can bypass RLS (for backend operations)
```

## Step 3: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: For frontend (safe to expose)
   - **service_role key**: For backend only (keep secret!)

## Step 4: Add to Environment Variables

### Local Development (.env file):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Vercel Deployment:
```bash
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_KEY production
```

Or add via Vercel dashboard:
https://vercel.com/your-username/seel-data-bundle/settings/environment-variables

## Step 5: Database Schema Overview

### **users** table
- `id` (UUID): Primary key
- `email` (TEXT): User email (unique)
- `full_name` (TEXT): Full name
- `phone` (TEXT): Phone number
- `password_hash` (TEXT): Bcrypt hashed password
- `created_at`, `updated_at`: Timestamps

### **orders** table
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users
- `network` (TEXT): MTN, Telecel, AirtelTigo
- `data_type` (TEXT): Bundle type (e.g., "5GB - 30 Days")
- `beneficiary_number` (TEXT): Phone number to receive data
- `price` (DECIMAL): Price in GHS
- `payment_reference` (TEXT): Paystack reference
- `status` (TEXT): pending, completed, failed
- `created_at`, `updated_at`: Timestamps

### **transactions** table
- `id` (UUID): Primary key
- `order_id` (UUID): Foreign key to orders
- `user_id` (UUID): Foreign key to users
- `payment_reference` (TEXT): Paystack reference (unique)
- `amount` (DECIMAL): Amount paid
- `status` (TEXT): success, failed, pending
- `payment_method` (TEXT): paystack
- `created_at`: Timestamp

## Step 6: Security Features

✅ **Row Level Security (RLS)**: Users can only access their own data
✅ **Password Hashing**: Using bcrypt
✅ **Service Role Key**: Backend operations bypass RLS
✅ **Indexes**: Fast queries on email, user_id, payment_reference

## Step 7: Test Connection

Run this in your backend API to test:

```javascript
import { getSupabaseClient } from './supabase-config.js';

const supabase = getSupabaseClient();
const { data, error } = await supabase.from('users').select('count');
console.log('Supabase connected:', data);
```

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run SQL to create tables
3. ✅ Get API keys
4. ✅ Add to .env and Vercel
5. ⏳ Create backend APIs (signup, login, orders)
6. ⏳ Update frontend to use backend APIs
7. ⏳ Migrate existing localStorage data (optional)

## Benefits Over localStorage

✅ **Cross-device sync**: Login from any device
✅ **Persistent data**: Won't be lost if browser cleared
✅ **Secure**: Password hashing, RLS, backend verification
✅ **Scalable**: Handle thousands of users
✅ **Real-time**: Can add live order updates
✅ **Relational**: Foreign keys maintain data integrity
