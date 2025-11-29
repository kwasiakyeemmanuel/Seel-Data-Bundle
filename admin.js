// Admin Authentication
// IMPORTANT: Change these credentials for production!
const ADMIN_CREDENTIALS = {
    username: 'seeldataadmin',
    password: 'SeelData@2025!Secure#Admin'
};

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
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Create admin session
        localStorage.setItem('adminSession', JSON.stringify({
            loggedIn: true,
            timestamp: Date.now(),
            username: username
        }));
        
        showAdminDashboard();
        loadDashboardData();
    } else {
        alert('Invalid credentials! Please try again.');
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
function loadOverviewData() {
    // Force fresh read from localStorage
    const usersJson = localStorage.getItem('seelDataUsers');
    console.log('📦 Raw localStorage data for seelDataUsers:', usersJson);
    
    const users = JSON.parse(usersJson || '[]');
    const allReviews = JSON.parse(localStorage.getItem('customerReviews') || '[]');
    
    console.log('📊 Loading overview - Users found:', users.length);
    console.log('👥 User details:', users.map(u => ({ name: u.name, email: u.email })));
    console.log('🌐 Current domain:', window.location.hostname);
    console.log('🔗 Current URL:', window.location.href);
    
    // Calculate total orders and revenue
    let totalOrders = 0;
    let totalRevenue = 0;
    let allOrders = [];
    
    users.forEach(user => {
        const userOrders = JSON.parse(localStorage.getItem('userOrders_' + user.email) || '[]');
        totalOrders += userOrders.length;
        allOrders = allOrders.concat(userOrders);
        
        userOrders.forEach(order => {
            const amount = parseFloat(order.amount || order.bundleSize.split('GH₵')[1] || 0);
            totalRevenue += amount;
        });
    });
    
    // Update stats with animation
    const userCountElement = document.getElementById('totalUsers');
    userCountElement.textContent = users.length;
    userCountElement.style.animation = 'pulse 0.5s';
    setTimeout(() => userCountElement.style.animation = '', 500);
    
    document.getElementById('totalOrders').textContent = totalOrders;
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
function loadUsersData() {
    const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
    
    console.log('👥 Loading users data. Found:', users.length, 'users');
    console.log('🌐 Current domain:', window.location.hostname);
    console.log('📦 Full localStorage data:', localStorage);
    
    // Add domain warning banner
    const domainWarning = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <strong>⚠️ Important:</strong> You are viewing admin from <strong>${window.location.hostname}</strong><br>
            <small style="color: #856404;">Users registered on different domains (localhost vs seeldatabundle.me) will NOT appear here due to browser security.</small><br>
            <button class="btn btn-primary" onclick="loadUsersData()" style="margin-top: 10px;">
                <i class="fas fa-sync"></i> Refresh Users
            </button>
        </div>
    `;
    
    if (users.length === 0) {
        document.getElementById('usersTable').innerHTML = domainWarning + `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No users registered yet on <strong>${window.location.hostname}</strong></p>
                <small style="color: #999; margin-top: 10px; display: block;">
                    Users must sign up on <strong>${window.location.hostname}</strong> to appear here.
                </small>
            </div>`;
        return;
    }
    
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
function loadOrdersData() {
    const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
    let allOrders = [];
    
    users.forEach(user => {
        const userOrders = JSON.parse(localStorage.getItem('userOrders_' + user.email) || '[]');
        userOrders.forEach(order => {
            order.userEmail = user.email;
            order.userName = user.name;
        });
        allOrders = allOrders.concat(userOrders);
    });
    
    if (allOrders.length === 0) {
        document.getElementById('ordersTable').innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders yet</p></div>';
        return;
    }
    
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const tableHTML = `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Bundle</th>
                        <th>Phone</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${allOrders.map(order => {
                        const amount = order.amount || order.bundleSize.split('GH₵')[1] || '0';
                        return `
                        <tr>
                            <td><strong>${order.id}</strong></td>
                            <td>${order.userName}</td>
                            <td>${order.service}</td>
                            <td>${order.bundleSize}</td>
                            <td>${order.phoneNumber}</td>
                            <td>GH₵${amount}</td>
                            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                            <td>${new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('ordersTable').innerHTML = tableHTML;
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
