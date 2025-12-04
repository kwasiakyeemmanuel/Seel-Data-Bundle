// Admin Authentication
// Credentials are now stored securely on the server
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://seeldatabundle.me/api';

// Check if admin is logged in
function checkAdminAuth() {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
        const session = JSON.parse(adminSession);
        if (session.loggedIn && Date.now() - session.timestamp < 3600000) { // 1 hour session
            showAdminDashboard();
            return true;
        }
    }
    return false;
}

// Handle admin login
async function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.disabled = true;
    
    try {
        // Call backend API for authentication using new admin endpoint
        const response = await fetch(`${API_URL}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                action: 'login',
                username, 
                password 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Create admin session
            localStorage.setItem('adminSession', JSON.stringify({
                loggedIn: true,
                timestamp: Date.now(),
                username: username
            }));
            
            showAdminDashboard();
            loadDashboardData();
        } else {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            console.error('Login failed:', result);
            alert('Invalid credentials! ' + (result.error || '') + (result.debug ? '\nDebug: ' + result.debug : ''));
        }
    } catch (error) {
        console.error('Login error:', error);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        alert('Login failed. Please check your connection and try again.');
    }
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    
    // Show current domain
    const domainSpan = document.getElementById('currentDomain');
    if (domainSpan) {
        domainSpan.textContent = window.location.hostname;
    }
    
    loadDashboardData();
}

// Handle admin logout
function handleAdminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminSession');
        location.reload();
    }
}

// Show admin section
function showAdminSection(section) {
    // Update nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.closest('.admin-nav-link').classList.add('active');
    
    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
    
    // Load section data
    switch(section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'contacts':
            loadContactsData();
            break;
        case 'reviews':
            loadReviewsData();
            break;
        case 'tickets':
            loadTicketsData();
            break;
        case 'database':
            loadDatabaseData();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    // Debug: Log localStorage contents
    console.log('=== ADMIN DASHBOARD DEBUG ===');
    console.log('Total localStorage items:', localStorage.length);
    const usersData = localStorage.getItem('seelDataUsers');
    console.log('Raw users data:', usersData);
    const users = JSON.parse(usersData || '[]');
    console.log('Parsed users:', users);
    console.log('Number of users:', users.length);
    console.log('Current domain:', window.location.hostname);
    console.log('Full URL:', window.location.href);
    console.log('===========================');
    
    // Show alert if no users found
    if (users.length === 0) {
        console.warn('⚠️ NO USERS FOUND in localStorage!');
        console.warn('Make sure users are signing up on the same domain as this admin page.');
    }
    
    loadOverviewData();
}

// Load overview data
async function loadOverviewData() {
    console.log('📊 Loading overview data...');
    
    try {
        // Fetch dashboard stats from Supabase via admin API
        const response = await fetch(`${API_URL}/admin?action=getDashboardStats`);
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ Error loading dashboard stats:', result.error);
            // Fallback to localStorage if API fails
            fetchOverviewFromLocal();
            return;
        }
        
        const stats = result.data;
        
        // Update stats with animation
        const userCountElement = document.getElementById('totalUsers');
        userCountElement.textContent = stats.totalUsers;
        userCountElement.style.animation = 'pulse 0.5s';
        setTimeout(() => userCountElement.style.animation = '', 500);
        
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalRevenue').textContent = 'GH₵' + stats.totalRevenue.toFixed(2);
        document.getElementById('totalReviews').textContent = stats.pendingOrders; // Reusing for pending orders
        
        // Recent orders
        const recentOrders = stats.recentOrders || [];
        const recentOrdersHTML = recentOrders.length > 0 ? recentOrders.map(order => `
            <div class="order-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>${order.network || 'N/A'}</strong>
                    <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div style="font-size: 14px; color: #666;">
                    ${order.data_type} • ${order.beneficiary_number}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 5px;">
                    GH₵${order.price} • ${new Date(order.created_at).toLocaleString()}
                </div>
            </div>
        `).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No orders yet</p></div>';
        
        document.getElementById('recentOrdersList').innerHTML = recentOrdersHTML;
        
        // Popular networks
        const networkCounts = {};
        recentOrders.forEach(order => {
            const network = order.network || 'Unknown';
            networkCounts[network] = (networkCounts[network] || 0) + 1;
        });
        
        const popularNetworksHTML = Object.entries(networkCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([network, count]) => `
                <div class="network-bar">
                    <span class="network-name">${network}</span>
                    <span class="network-count">${count} orders</span>
                </div>
            `).join('') || '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No data yet</p></div>';
        
        document.getElementById('popularNetworks').innerHTML = popularNetworksHTML;
        
    } catch (error) {
        console.error('❌ Error loading overview:', error);
        // Fallback to localStorage
        fetchOverviewFromLocal();
    }
}

function logOverviewStart() {
    console.log('📊 Loading overview data...');
}

// Separate Firebase loading to keep single responsibility and lower complexity
async function loadOverviewFromFirebase() {
    try {
        const { users, allOrders, allReviews } = await fetchOverviewFromFirebase();
        displayOverviewStats(users, allOrders, allReviews);
    } catch (error) {
        console.error('❌ Error loading Firebase data:', error);
        if (typeof toast !== 'undefined' && toast.error) toast.error('Error loading dashboard data');
    }
}

async function fetchOverviewFromFirebase() {
    console.log('🔥 Fetching data from Firebase...');
    const [usersResult, ordersResult, reviewsResult] = await Promise.all([
        window.FirebaseDB.getAllUsers(),
        window.FirebaseDB.getAllOrders(),
        window.FirebaseDB.getAllReviews()
    ]);
    const users = usersResult.users || [];
    const allOrders = ordersResult.orders || [];
    const allReviews = reviewsResult.reviews || [];
    
    console.log('📊 Firebase data - Users:', users.length, 'Orders:', allOrders.length, 'Reviews:', allReviews.length);
    return { users, allOrders, allReviews };
}

function fetchOverviewFromLocal() {
    console.log('💾 Firebase not available, using localStorage...');
    // Force fresh read from localStorage
    const usersJson = localStorage.getItem('seelDataUsers');
    console.log('📦 Raw localStorage data for seelDataUsers:', usersJson);
    
    const users = JSON.parse(usersJson || '[]');
    const allReviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
    
    console.log('📊 Loading overview - Users found:', users.length);
    console.log('👥 User details:', users.map(u => ({ name: u.name, email: u.email })));
    console.log('🌐 Current domain:', window.location.hostname);
    console.log('🔗 Current URL:', window.location.href);
    
    // Calculate total orders and aggregate user orders
    let allOrders = [];
    
    users.forEach(user => {
        const userOrders = JSON.parse(localStorage.getItem('userOrders_' + user.email) || '[]');
        allOrders = allOrders.concat(userOrders);
    });
    
    displayOverviewStats(users, allOrders, allReviews);
}

function displayOverviewStats(users, allOrders, allReviews) {
    // Calculate revenue
    let totalRevenue = 0;
    allOrders.forEach(order => {
        const amount = parseFloat(order.amount || order.bundleSize?.split('GH₵')[1] || 0);
        totalRevenue += amount;
    });
    
    // Update stats with animation
    const userCountElement = document.getElementById('totalUsers');
    userCountElement.textContent = users.length;
    userCountElement.style.animation = 'pulse 0.5s';
    setTimeout(() => userCountElement.style.animation = '', 500);
    
    document.getElementById('totalOrders').textContent = allOrders.length;
    document.getElementById('totalRevenue').textContent = 'GH₵' + totalRevenue.toFixed(2);
    document.getElementById('totalReviews').textContent = allReviews.length;
    
    // Recent orders
    const recentOrders = allOrders.slice(-10).reverse();
    const recentOrdersHTML = recentOrders.length > 0 ? recentOrders.map(order => `
        <div class="order-item">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong>${order.service}</strong>
                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div style="font-size: 14px; color: #666;">
                ${order.bundleSize} • ${order.phoneNumber}
            </div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">
                ${new Date(order.createdAt).toLocaleString()}
            </div>
        </div>
    `).join('') : '<div class="empty-state"><i class="fas fa-inbox"></i><p>No orders yet</p></div>';
    
    document.getElementById('recentOrdersList').innerHTML = recentOrdersHTML;
    
    // Popular networks
    const networkCounts = {};
    allOrders.forEach(order => {
        const network = order.service || 'Unknown';
        networkCounts[network] = (networkCounts[network] || 0) + 1;
    });
    
    const popularNetworksHTML = Object.entries(networkCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([network, count]) => `
            <div class="network-bar">
                <span class="network-name">${network}</span>
                <span class="network-count">${count} orders</span>
            </div>
        `).join('') || '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No data yet</p></div>';
    
    document.getElementById('popularNetworks').innerHTML = popularNetworksHTML;
}

// Load users data
// Helper: Get domain warning banner HTML
function getDomainWarningBanner() {
    const dataSource = window.firebaseDB ? 'Firebase (Centralized Database)' : 'localStorage (Browser Only)';
    return `
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <strong>⚠️ Data Source:</strong> ${dataSource}<br>
            <small style="color: #856404;">Current domain: <strong>${window.location.hostname}</strong></small><br>
            <button class="btn btn-primary" onclick="loadUsersData()" style="margin-top: 10px;">
                <i class="fas fa-sync"></i> Refresh Users
            </button>
        </div>
    `;
}

// Helper: Show empty state message
function showEmptyUsersState(domainWarning, message) {
    document.getElementById('usersTable').innerHTML = domainWarning + `
        <div class="empty-state">
            <i class="fas fa-users"></i>
            <p>${message}</p>
        </div>`;
}

// Helper: Show error state
function showUsersErrorState(domainWarning, error) {
    document.getElementById('usersTable').innerHTML = domainWarning + `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading users</p>
            <small>${error.message}</small>
        </div>`;
}

// Load users data (refactored for better maintainability)
async function loadUsersData() {
    console.log('👥 Loading users data from Supabase...');
    
    try {
        // Fetch users from Supabase via admin API
        const response = await fetch(`${API_URL}/admin?action=getAllUsers`);
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ Error loading users:', result.error);
            document.getElementById('usersTable').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading users from Supabase</p>
                    <small>${result.error}</small>
                </div>`;
            return;
        }
        
        const users = result.data;
        console.log('👥 Supabase users found:', users.length);
        
        if (users.length === 0) {
            document.getElementById('usersTable').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No users registered yet</p>
                </div>`;
            return;
        }
        
        // Display users in table
        const tableHTML = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td><strong>${user.full_name || 'N/A'}</strong></td>
                                <td>${user.email}</td>
                                <td>${user.phone || 'N/A'}</td>
                                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button class="action-btn action-btn-view" onclick="viewUserDetails('${user.email}')">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('usersTable').innerHTML = tableHTML;
        
    } catch (error) {
        console.error('❌ Error loading users:', error);
        document.getElementById('usersTable').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading users</p>
                <small>${error.message}</small>
            </div>`;
    }
}

// Load users from Firebase
function loadUsersFromFirebase(domainWarning) {
    console.log('🔥 Fetching users from Firebase...');
    window.FirebaseDB.getAllUsers()
        .then(result => {
            const users = result.users || [];
            console.log('👥 Firebase users found:', users.length);
            
            if (users.length === 0) {
                showEmptyUsersState(domainWarning, 'No users registered yet in Firebase');
                return;
            }
            
            displayUsersTable(users, domainWarning);
        })
        .catch(error => {
            console.error('❌ Error loading users from Firebase:', error);
            showUsersErrorState(domainWarning, error);
        });
}

// Load users from localStorage
function loadUsersFromLocalStorage(domainWarning) {
    console.log('💾 Using localStorage...');
    const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
    console.log('👥 localStorage users found:', users.length);
    
    if (users.length === 0) {
        showEmptyUsersState(domainWarning, `No users registered yet on <strong>${window.location.hostname}</strong>`);
        return;
    }
    
    displayUsersTable(users, domainWarning);
}

function displayUsersTable(users, domainWarning) {
    const tableHTML = domainWarning + `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Verified</th>
                        <th>2FA</th>
                        <th>Registered</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td><strong>${user.name}</strong></td>
                            <td>${user.email}</td>
                            <td>${user.phone || 'N/A'}</td>
                            <td><span class="status-badge ${user.verified ? 'status-completed' : 'status-pending'}">${user.verified ? 'Yes' : 'No'}</span></td>
                            <td><span class="status-badge ${user.twoFactorEnabled ? 'status-completed' : 'status-pending'}">${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span></td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn action-btn-view" onclick="viewUserDetails('${user.email}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('usersTable').innerHTML = tableHTML;
}

// Load orders data
async function loadOrdersData() {
    console.log('📦 Loading orders data from Supabase...');
    
    try {
        // Fetch orders from Supabase via admin API
        const response = await fetch(`${API_URL}/admin?action=getAllOrders`);
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ Error loading orders:', result.error);
            document.getElementById('ordersTable').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading orders from Supabase</p>
                    <small>${result.error}</small>
                </div>`;
            return;
        }
        
        const allOrders = result.data;
        console.log('📦 Supabase orders found:', allOrders.length);
        
        if (allOrders.length === 0) {
            document.getElementById('ordersTable').innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders yet</p></div>';
            return;
        }
        
        const tableHTML = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Network</th>
                            <th>Data Type</th>
                            <th>Phone</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allOrders.map(order => `
                            <tr>
                                <td><strong>${order.id.substring(0, 8)}</strong></td>
                                <td>${order.user_email || 'N/A'}</td>
                                <td>${order.network || 'N/A'}</td>
                                <td>${order.data_type || 'N/A'}</td>
                                <td>${order.beneficiary_number}</td>
                                <td>GH₵${order.price}</td>
                                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                                <td>${new Date(order.created_at).toLocaleString()}</td>
                                <td>
                                    <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select">
                                        <option value="">Change Status</option>
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                        <option value="failed" ${order.status === 'failed' ? 'selected' : ''}>Failed</option>
                                    </select>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('ordersTable').innerHTML = tableHTML;
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        document.getElementById('ordersTable').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading orders</p>
                <small>${error.message}</small>
            </div>`;
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    
    if (!confirm(`Change order status to ${newStatus}?`)) return;
    
    try {
        const response = await fetch(`${API_URL}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                orderId,
                status: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Order status updated successfully!');
            loadOrdersData(); // Reload orders
        } else {
            alert('Error updating order status: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating order status');
    }
}

// Load reviews data
function loadReviewsData() {
    const reviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
    
    if (reviews.length === 0) {
        document.getElementById('reviewsTable').innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>No reviews yet</p></div>';
        return;
    }
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.map((review, index) => `
                        <tr>
                            <td><strong>${review.name}</strong></td>
                            <td>${'⭐'.repeat(review.rating)}</td>
                            <td>${review.review}</td>
                            <td>${new Date(review.date).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn action-btn-delete" onclick="deleteReview(${index})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('reviewsTable').innerHTML = tableHTML;
}

// Load contact messages data
async function loadContactsData() {
    console.log('📧 Loading contact messages from Supabase...');
    
    try {
        // Fetch contact messages from Supabase via admin API
        const response = await fetch(`${API_URL}/admin?action=getContactMessages`);
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ Error loading contacts:', result.error);
            document.getElementById('contactsTable').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading contact messages from Supabase</p>
                    <small>${result.error}</small>
                </div>`;
            return;
        }
        
        const messages = result.data;
        console.log('📧 Contact messages found:', messages.length);
        
        if (messages.length === 0) {
            document.getElementById('contactsTable').innerHTML = '<div class="empty-state"><i class="fas fa-envelope"></i><p>No contact messages yet</p></div>';
            return;
        }
        
        const tableHTML = `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${messages.map(msg => `
                            <tr>
                                <td><strong>${msg.name}</strong></td>
                                <td>${msg.email}</td>
                                <td>${msg.phone || 'N/A'}</td>
                                <td>${msg.subject}</td>
                                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${msg.message}">
                                    ${msg.message}
                                </td>
                                <td><span class="status-badge status-${msg.status}">${msg.status}</span></td>
                                <td>${new Date(msg.created_at).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('contactsTable').innerHTML = tableHTML;
        
    } catch (error) {
        console.error('❌ Error loading contacts:', error);
        document.getElementById('contactsTable').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading contact messages</p>
                <small>${error.message}</small>
            </div>`;
    }
}

// Load tickets data
function loadTicketsData() {
    const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
    let allTickets = [];
    
    users.forEach(user => {
        const userTickets = JSON.parse(localStorage.getItem('supportTickets_' + user.email) || '[]');
        userTickets.forEach(ticket => {
            ticket.userEmail = user.email;
            ticket.userName = user.name;
        });
        allTickets = allTickets.concat(userTickets);
    });
    
    if (allTickets.length === 0) {
        document.getElementById('ticketsTable').innerHTML = '<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>No support tickets yet</p></div>';
        return;
    }
    
    allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Customer</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allTickets.map(ticket => `
                        <tr>
                            <td><strong>${ticket.id}</strong></td>
                            <td>${ticket.userName}</td>
                            <td>${ticket.subject}</td>
                            <td><span class="status-badge status-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
                            <td><span class="status-badge status-${ticket.status.toLowerCase()}">${ticket.status}</span></td>
                            <td>${new Date(ticket.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="action-btn action-btn-view" onclick="viewTicketDetails('${ticket.userEmail}', '${ticket.id}')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('ticketsTable').innerHTML = tableHTML;
}

// Load database data
function loadDatabaseData() {
    console.log('💾 Loading database data...');
    console.log('🌐 Domain:', window.location.hostname);
    console.log('📦 Total localStorage keys:', localStorage.length);
    
    // Check specifically for users
    const usersData = localStorage.getItem('seelDataUsers');
    console.log('👥 seelDataUsers exists:', !!usersData);
    if (usersData) {
        const users = JSON.parse(usersData);
        console.log('👥 Number of users:', users.length);
        console.log('👥 Users:', users);
    }
    
    const databaseHTML = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        // Skip admin session
        if (key === 'adminSession') continue;
        
        let displayValue = value;
        try {
            const parsed = JSON.parse(value);
            displayValue = JSON.stringify(parsed, null, 2);
        } catch (e) {
            displayValue = value;
        }
        
        databaseHTML.push(`
            <div class="database-item">
                <div class="database-key">
                    <i class="fas fa-key"></i> ${key}
                    <button class="action-btn action-btn-delete" onclick="deleteLocalStorageItem('${key}')" style="margin-left: auto;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                <div class="database-value">${displayValue}</div>
            </div>
        `);
    }
    
    if (databaseHTML.length === 0) {
        document.getElementById('databaseView').innerHTML = '<div class="empty-state"><i class="fas fa-database"></i><p>Database is empty</p></div>';
    } else {
        document.getElementById('databaseView').innerHTML = '<div class="database-view">' + databaseHTML.join('') + '</div>';
    }
}

// Refresh database
function refreshDatabase() {
    loadDatabaseData();
}

// Export database
function exportDatabase() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'adminSession') {
            data[key] = localStorage.getItem(key);
        }
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seel-data-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Database exported successfully!');
}

// Clear database
function clearDatabase() {
    if (confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
        if (confirm('This will delete all users, orders, reviews, and tickets. Are you ABSOLUTELY sure?')) {
            const adminSession = localStorage.getItem('adminSession');
            localStorage.clear();
            localStorage.setItem('adminSession', adminSession);
            alert('Database cleared successfully!');
            loadDashboardData();
            loadDatabaseData();
        }
    }
}

// Delete localStorage item
function deleteLocalStorageItem(key) {
    if (confirm(`Are you sure you want to delete "${key}"?`)) {
        localStorage.removeItem(key);
        loadDatabaseData();
        alert('Item deleted successfully!');
    }
}

// Delete review
function deleteReview(index) {
    if (confirm('Are you sure you want to delete this review?')) {
        const reviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
        reviews.splice(index, 1);
        localStorage.setItem('customerReviews', JSON.stringify(reviews));
        loadReviewsData();
        alert('Review deleted successfully!');
    }
}

// View user details
function viewUserDetails(email) {
    const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
    const user = users.find(u => u.email === email);
    const orders = JSON.parse(localStorage.getItem('userOrders_' + email) || '[]');
    
    alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nVerified: ${user.verified ? 'Yes' : 'No'}\n2FA: ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}\nTotal Orders: ${orders.length}\nRegistered: ${new Date(user.createdAt).toLocaleString()}`);
}

// View ticket details
function viewTicketDetails(email, ticketId) {
    const tickets = JSON.parse(localStorage.getItem('supportTickets_' + email) || '[]');
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        alert(`Ticket Details:\n\nID: ${ticket.id}\nSubject: ${ticket.subject}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}\nStatus: ${ticket.status}\nCreated: ${new Date(ticket.createdAt).toLocaleString()}`);
    }
}

// Filter functions
function filterUsers(query) {
    const rows = document.querySelectorAll('#usersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function filterOrders(query) {
    const rows = document.querySelectorAll('#ordersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function filterReviews(query) {
    const rows = document.querySelectorAll('#reviewsTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

function filterTickets(query) {
    const rows = document.querySelectorAll('#ticketsTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
});
