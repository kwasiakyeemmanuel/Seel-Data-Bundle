// Firebase Database Service
// This file provides functions to interact with Firebase Firestore

// Collections
const COLLECTIONS = {
    USERS: 'users',
    ORDERS: 'orders',
    REVIEWS: 'reviews',
    TICKETS: 'tickets'
};

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
        console.log('✅ User created in Firebase:', userData.email);
        return { success: true };
    } catch (error) {
        console.error('❌ Error creating user:', error);
        return { success: false, error: error.message };
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
        console.error('❌ Error getting user:', error);
        return { success: false, error: error.message };
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
        console.log('✅ Fetched users from Firebase:', users.length);
        return { success: true, users };
    } catch (error) {
        console.error('❌ Error getting users:', error);
        return { success: false, error: error.message, users: [] };
    }
}

// Update user
async function updateUser(email, updates) {
    try {
        await db.collection(COLLECTIONS.USERS).doc(email).update(updates);
        console.log('✅ User updated:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Error updating user:', error);
        return { success: false, error: error.message };
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
        console.log('✅ Order created in Firebase:', orderRef.id);
        return { success: true, orderId: orderRef.id };
    } catch (error) {
        console.error('❌ Error creating order:', error);
        return { success: false, error: error.message };
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
        console.log('✅ Fetched orders for user:', email, orders.length);
        return { success: true, orders };
    } catch (error) {
        console.error('❌ Error getting orders:', error);
        return { success: false, error: error.message, orders: [] };
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
        console.log('✅ Fetched all orders from Firebase:', orders.length);
        return { success: true, orders };
    } catch (error) {
        console.error('❌ Error getting all orders:', error);
        return { success: false, error: error.message, orders: [] };
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
        console.log('✅ Review created in Firebase:', reviewRef.id);
        return { success: true, reviewId: reviewRef.id };
    } catch (error) {
        console.error('❌ Error creating review:', error);
        return { success: false, error: error.message };
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
        console.error('❌ Error getting reviews:', error);
        return { success: false, error: error.message, reviews: [] };
    }
}

// Delete review
async function deleteReview(reviewId) {
    try {
        await db.collection(COLLECTIONS.REVIEWS).doc(reviewId).delete();
        console.log('✅ Review deleted:', reviewId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        return { success: false, error: error.message };
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
        console.log('✅ Ticket created in Firebase:', ticketRef.id);
        return { success: true, ticketId: ticketRef.id };
    } catch (error) {
        console.error('❌ Error creating ticket:', error);
        return { success: false, error: error.message };
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
        console.error('❌ Error getting tickets:', error);
        return { success: false, error: error.message, tickets: [] };
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
        console.error('❌ Error getting tickets:', error);
        return { success: false, error: error.message, tickets: [] };
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
