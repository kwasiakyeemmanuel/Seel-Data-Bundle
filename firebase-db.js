// Firebase Database Service
// This file provides functions to interact with Firebase Firestore

// Collections
const COLLECTIONS = {
    USERS: 'users',
    ORDERS: 'orders',
    REVIEWS: 'reviews',
    TICKETS: 'tickets'
};

// Helper function to handle errors consistently
function handleError(operation, error, defaultData = null) {
    console.error(`❌ Error ${operation}:`, error);
    const result = { success: false, error: error.message };
    if (defaultData !== null) {
        Object.assign(result, defaultData);
    }
    return result;
}

// Helper function to log success
function logSuccess(message, data = null) {
    console.log('✅', message, data || '');
}

// ==================== USER FUNCTIONS ====================

// Create new user
async function createUser(userData) {
    try {
        const userRef = db.collection(COLLECTIONS.USERS).doc(userData.email);
        await userRef.set({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // In production, use Firebase Auth instead
            verified: false,
            twoFactorEnabled: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        logSuccess('User created in Firebase:', userData.email);
        return { success: true };
    } catch (error) {
        return handleError('creating user', error);
    }
}

// Get user by email
async function getUser(email) {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(email).get();
        if (userDoc.exists) {
            return { success: true, user: userDoc.data() };
        }
        return { success: false, error: 'User not found' };
    } catch (error) {
        return handleError('getting user', error);
    }
}

// Get all users (for admin)
async function getAllUsers() {
    try {
        const snapshot = await db.collection(COLLECTIONS.USERS).orderBy('createdAt', 'desc').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        logSuccess('Fetched all users from Firebase:', users.length);
        return { success: true, users };
    } catch (error) {
        return handleError('getting users', error, { users: [] });
    }
}

// Update user
async function updateUser(email, updates) {
    try {
        await db.collection(COLLECTIONS.USERS).doc(email).update(updates);
        logSuccess('User updated:', email);
        return { success: true };
    } catch (error) {
        return handleError('updating user', error);
    }
}

// ==================== ORDER FUNCTIONS ====================

// Create new order
async function createOrder(orderData) {
    try {
        const orderRef = await db.collection(COLLECTIONS.ORDERS).add({
            ...orderData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        logSuccess('Order created in Firebase:', orderRef.id);
        return { success: true, orderId: orderRef.id };
    } catch (error) {
        return handleError('creating order', error);
    }
}

// Get orders by user email
async function getUserOrders(email) {
    try {
        const snapshot = await db.collection(COLLECTIONS.ORDERS)
            .where('userEmail', '==', email)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({ 
                id: doc.id, 
                ...data,
                // Convert Firestore timestamp to ISO string
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
            });
        });
        logSuccess('Fetched orders for user:', `${email} (${orders.length})`);
        return { success: true, orders };
    } catch (error) {
        return handleError('getting orders', error, { orders: [] });
    }
}

// Get all orders (for admin)
async function getAllOrders() {
    try {
        const snapshot = await db.collection(COLLECTIONS.ORDERS)
            .orderBy('createdAt', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({ 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
            });
        });
        logSuccess('Fetched all orders from Firebase:', orders.length);
        return { success: true, orders };
    } catch (error) {
        return handleError('getting all orders', error, { orders: [] });
    }
}

// ==================== REVIEW FUNCTIONS ====================

// Create new review
async function createReview(reviewData) {
    try {
        const reviewRef = await db.collection(COLLECTIONS.REVIEWS).add({
            ...reviewData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        logSuccess('Review created in Firebase:', reviewRef.id);
        return { success: true, reviewId: reviewRef.id };
    } catch (error) {
        return handleError('creating review', error);
    }
}

// Get all reviews
async function getAllReviews() {
    try {
        const snapshot = await db.collection(COLLECTIONS.REVIEWS)
            .orderBy('createdAt', 'desc')
            .get();
        
        const reviews = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            reviews.push({ 
                id: doc.id, 
                ...data,
                timestamp: data.createdAt?.toDate().getTime() || Date.now()
            });
        });
        console.log('✅ Fetched reviews from Firebase:', reviews.length);
        return { success: true, reviews };
    } catch (error) {
        return handleError('getting reviews', error, { reviews: [] });
    }
}

// Delete review
async function deleteReview(reviewId) {
    try {
        await db.collection(COLLECTIONS.REVIEWS).doc(reviewId).delete();
        logSuccess('Review deleted:', reviewId);
        return { success: true };
    } catch (error) {
        return handleError('deleting review', error);
    }
}

// ==================== SUPPORT TICKET FUNCTIONS ====================

// Create support ticket
async function createTicket(ticketData) {
    try {
        const ticketRef = await db.collection(COLLECTIONS.TICKETS).add({
            ...ticketData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        logSuccess('Ticket created in Firebase:', ticketRef.id);
        return { success: true, ticketId: ticketRef.id };
    } catch (error) {
        return handleError('creating ticket', error);
    }
}

// Get tickets by user email
async function getUserTickets(email) {
    try {
        const snapshot = await db.collection(COLLECTIONS.TICKETS)
            .where('userEmail', '==', email)
            .orderBy('createdAt', 'desc')
            .get();
        
        const tickets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            tickets.push({ 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
            });
        });
        return { success: true, tickets };
    } catch (error) {
        return handleError('getting tickets', error, { tickets: [] });
    }
}

// Get all tickets (for admin)
async function getAllTickets() {
    try {
        const snapshot = await db.collection(COLLECTIONS.TICKETS)
            .orderBy('createdAt', 'desc')
            .get();
        
        const tickets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            tickets.push({ 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
            });
        });
        return { success: true, tickets };
    } catch (error) {
        return handleError('getting tickets', error, { tickets: [] });
    }
}

// Export functions
window.FirebaseDB = {
    createUser,
    getUser,
    getAllUsers,
    updateUser,
    createOrder,
    getUserOrders,
    getAllOrders,
    createReview,
    getAllReviews,
    deleteReview,
    createTicket,
    getUserTickets,
    getAllTickets
};

console.log('🔥 Firebase Database Service loaded');
