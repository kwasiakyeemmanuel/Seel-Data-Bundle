// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeModal();
    initializeGreeting();
    initializeFilters();
    initializeButtons();
    initializeSmoothScroll();
    initializeAuth();
    checkUserLogin();
    checkPasswordResetToken();
    initializeFavorites();
    initializeWhatsAppSupport();
});

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('noticeModal');
    const understoodBtn = document.getElementById('understoodBtn');
    const modalContent = document.querySelector('.modal-content');
    
    if (!modal || !understoodBtn) {
        console.error('Modal elements not found');
        return;
    }
    
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem('seenNoticeModal');
    
    if (!hasSeenModal) {
        modal.style.display = 'flex';
    }
    
    // Close modal function
    function closeModal() {
        console.log('Closing modal...');
        modal.style.display = 'none';
        localStorage.setItem('seenNoticeModal', 'true');
    }
    
    // Close on button click
    understoodBtn.addEventListener('click', function(e) {
        console.log('Button clicked');
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });
    
    // Close on clicking the modal background (not the content)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Dynamic greeting based on time
function initializeGreeting() {
    const greetingElement = document.getElementById('greeting');
    const hour = new Date().getHours();
    
    let greeting;
    let icon;
    
    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning!';
        icon = 'fa-sun';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon!';
        icon = 'fa-cloud-sun';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening!';
        icon = 'fa-cloud-moon';
    } else {
        greeting = 'Good Night!';
        icon = 'fa-moon';
    }
    
    greetingElement.textContent = greeting;
    const iconElement = greetingElement.previousElementSibling;
    iconElement.className = `fas ${icon}`;
}

// Filter functionality
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (!categoryFilter || !availabilityFilter || !clearFiltersBtn) {
        console.warn('Filter elements not found');
        return;
    }
    
    categoryFilter.addEventListener('change', applyFilters);
    availabilityFilter.addEventListener('change', applyFilters);
    
    clearFiltersBtn.addEventListener('click', function() {
        categoryFilter.value = 'all';
        availabilityFilter.value = 'all';
        applyFilters();
    });
}

function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    if (!categoryFilter || !availabilityFilter) {
        console.warn('Filter elements not found during applyFilters');
        return;
    }
    
    const categoryValue = categoryFilter.value;
    const availabilityValue = availabilityFilter.value;
    const cards = document.querySelectorAll('.service-card');
    
    console.log('Applying filters:', { category: categoryValue, availability: availabilityValue, cardCount: cards.length });
    
    cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const availability = card.getAttribute('data-availability');
        
        let showCard = true;
        
        // Apply category filter
        if (categoryValue !== 'all' && category !== categoryValue) {
            showCard = false;
        }
        
        // Apply availability filter
        if (availabilityValue !== 'all' && availability !== availabilityValue) {
            showCard = false;
        }
        
        // Show or hide card with animation
        if (showCard) {
            card.classList.remove('hidden');
            card.style.animation = 'fadeIn 0.5s ease';
            card.style.display = '';
        } else {
            card.classList.add('hidden');
            card.style.display = 'none';
        }
    });
}

// Button functionality
function initializeButtons() {
    const helpBtn = document.getElementById('helpBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const whatsappContactBtn = document.getElementById('whatsappContactBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    helpBtn.addEventListener('click', function() {
        toast.info('Contact us at:\n\nName: AKYE EMMANUEL KWESI\nPhone: 0537922905\nWhatsApp: 0537922905\n\nFor payments: MoMo 0537922905', 6000);
    });
    
    whatsappBtn.addEventListener('click', function() {
        // Open WhatsApp chat with actual number
        window.open('https://wa.me/233537922905', '_blank');
    });
    
    if (whatsappContactBtn) {
        whatsappContactBtn.addEventListener('click', function() {
            // Open WhatsApp chat with actual number
            window.open('https://wa.me/233537922905', '_blank');
        });
    }
    
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'Seel Data - Best Data Bundle Deals',
                text: 'Check out Seel Data for the best data bundle deals in Ghana!',
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback for browsers that don't support Web Share API
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                toast.success('Link copied to clipboard! Share it with your friends.');
            });
        }
    });
}

// Handle contact form submission
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Send to backend
    fetch('contact-submit.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (result.status === 'success') {
            // Show success message
            const successModal = document.createElement('div');
            successModal.className = 'modal';
            successModal.id = 'contactSuccessModal';
            successModal.innerHTML = `
                <div class="modal-content success-modal">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Message Sent!</h2>
                    <p>Thank you for contacting us. We'll get back to you soon.</p>
                    <button class="btn btn-primary btn-block" onclick="closeContactSuccessModal()">
                        Close
                    </button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';
            
            // Reset form
            event.target.reset();
        } else {
            toast.error(result.message || 'Failed to send message. Please try again.');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        console.error('Error:', error);
        toast.error('An error occurred. Please try again.');
    });
}

// Close contact success modal
function closeContactSuccessModal() {
    const modal = document.getElementById('contactSuccessModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Authentication functionality
function initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', showSignupModal);
    }
}

// Check if user is logged in
function checkUserLogin() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        const user = JSON.parse(currentUser);
        updateHeaderForLoggedInUser(user);
        showServicesSection();
    } else {
        hideServicesSection();
    }
}

// Hide services section for non-logged-in users
function hideServicesSection() {
    const servicesSection = document.getElementById('services');
    const aboutSection = document.getElementById('about');
    
    if (servicesSection) {
        // Blur and disable instead of hiding completely
        servicesSection.style.filter = 'blur(8px)';
        servicesSection.style.pointerEvents = 'none';
        servicesSection.style.userSelect = 'none';
        
        // Add overlay message
        const overlay = document.createElement('div');
        overlay.id = 'servicesOverlay';
        overlay.style.cssText = `
            position: relative;
            text-align: center;
            margin: -50px auto 50px;
            z-index: 10;
        `;
        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); max-width: 500px; margin: 0 auto;">
                <i class="fas fa-lock" style="font-size: 48px; color: var(--primary-color); margin-bottom: 20px;"></i>
                <h3 style="font-size: 24px; margin-bottom: 12px; color: var(--dark);">Login Required</h3>
                <p style="color: var(--dark-light); margin-bottom: 24px;">Create an account or login to view and purchase data bundles</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn btn-secondary" onclick="showLoginModal()">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                    <button class="btn btn-primary" onclick="showSignupModal()">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </button>
                </div>
            </div>
        `;
        servicesSection.parentNode.insertBefore(overlay, servicesSection);
    }
    
    // Show login prompt in hero section
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const heroActions = heroContent.querySelector('.hero-actions');
        if (heroActions) {
            heroActions.innerHTML = `
                <button class="btn btn-primary btn-large" onclick="showSignupModal()">
                    <i class="fas fa-user-plus"></i> Create Account to Browse
                </button>
                <button class="btn btn-secondary btn-large" onclick="showLoginModal()">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            `;
        }
    }
}

// Show services section for logged-in users
function showServicesSection() {
    const servicesSection = document.getElementById('services');
    const overlay = document.getElementById('servicesOverlay');
    
    if (servicesSection) {
        servicesSection.style.filter = 'none';
        servicesSection.style.pointerEvents = 'auto';
        servicesSection.style.userSelect = 'auto';
    }
    
    if (overlay) {
        overlay.remove();
    }
    
    // Restore original hero actions
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const heroActions = heroContent.querySelector('.hero-actions');
        if (heroActions && heroActions.innerHTML.includes('Create Account')) {
            heroActions.innerHTML = `
                <button class="btn btn-primary btn-large" onclick="scrollToServices()">
                    <i class="fas fa-shopping-cart"></i> Browse Bundles
                </button>
                <button class="btn btn-secondary btn-large" id="whatsappBtn">
                    <i class="fab fa-whatsapp"></i> Join WhatsApp Group
                </button>
            `;
            // Re-initialize WhatsApp button
            const whatsappBtn = document.getElementById('whatsappBtn');
            if (whatsappBtn) {
                whatsappBtn.addEventListener('click', function() {
                    window.open('https://wa.me/233537922905', '_blank');
                });
            }
        }
    }
}

// Update header for logged in user
function updateHeaderForLoggedInUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="user-menu-btn" onclick="toggleUserMenu()">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="#" onclick="event.preventDefault(); showFavoritesModal();">
                        <i class="fas fa-heart"></i> My Favorites
                    </a>
                    <a href="#" onclick="event.preventDefault(); showTransactionHistory();">
                        <i class="fas fa-history"></i> Transaction History
                    </a>
                    <a href="#" onclick="event.preventDefault(); showFAQ();">
                        <i class="fas fa-question-circle"></i> Help & FAQ
                    </a>
                    <a href="#" onclick="event.preventDefault(); handleLogout();" style="color: var(--accent-color);">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
    }
}

// Toggle user dropdown menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Show login modal
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'loginModal';
    modal.innerHTML = `
        <div class="modal-content purchase-modal">
            <div class="modal-header">
                <i class="fas fa-sign-in-alt"></i>
                <h2>Login to Your Account</h2>
                <button class="close-btn" onclick="closeLoginModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">
                            <i class="fas fa-envelope"></i> Email or Phone *
                        </label>
                        <input 
                            type="text" 
                            id="loginEmail" 
                            name="email" 
                            placeholder="Enter your email or phone" 
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="loginPassword">
                            <i class="fas fa-lock"></i> Password *
                        </label>
                        <input 
                            type="password" 
                            id="loginPassword" 
                            name="password" 
                            placeholder="Enter your password" 
                            required
                        >
                    </div>

                    <div style="text-align: right; margin-bottom: 15px;">
                        <a href="#" onclick="event.preventDefault(); closeLoginModal(); showForgotPasswordModal();" 
                           style="color: var(--primary-color); font-size: 14px; text-decoration: none;">
                            <i class="fas fa-key"></i> Forgot Password?
                        </a>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-sign-in-alt"></i> Login
                        </button>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="color: var(--dark-light); font-size: 14px;">
                            Don't have an account? 
                            <a href="#" onclick="closeLoginModal(); showSignupModal(); return false;" 
                               style="color: var(--primary-color); font-weight: 600;">Sign Up</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    // Simulate network delay for better UX
    setTimeout(() => {
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
        
        // Find user by email or phone
        const user = users.find(u => 
            (u.email === email || u.phone === email) && u.password === password
        );
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (user) {
            // Remove password before saving to currentUser
            const userWithoutPassword = {...user};
            delete userWithoutPassword.password;
            
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            
            // Close modal and update UI
            closeLoginModal();
            updateHeaderForLoggedInUser(userWithoutPassword);
            showServicesSection();
            
            // Show success message
            const successModal = document.createElement('div');
            successModal.className = 'modal';
            successModal.id = 'loginSuccessModal';
            successModal.innerHTML = `
                <div class="modal-content success-modal">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h2>Welcome Back!</h2>
                    <p>You have successfully logged in.</p>
                    <button class="btn btn-primary btn-block" onclick="closeLoginSuccessModal()">
                        Continue
                    </button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';
        } else {
            toast.error('Invalid email/phone or password. Please try again.');
        }
    }, 800);
}

// Close login success modal
function closeLoginSuccessModal() {
    const modal = document.getElementById('loginSuccessModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Show signup modal
function showSignupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'signupModal';
    modal.innerHTML = `
        <div class="modal-content purchase-modal">
            <div class="modal-header">
                <i class="fas fa-user-plus"></i>
                <h2>Create Your Account</h2>
                <button class="close-btn" onclick="closeSignupModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="signupForm" onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="signupName">
                            <i class="fas fa-user"></i> Full Name *
                        </label>
                        <input 
                            type="text" 
                            id="signupName" 
                            name="name" 
                            placeholder="Enter your full name" 
                            maxlength="25"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupEmail">
                            <i class="fas fa-envelope"></i> Email *
                        </label>
                        <input 
                            type="email" 
                            id="signupEmail" 
                            name="email" 
                            placeholder="your@email.com" 
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupPhone">
                            <i class="fas fa-phone"></i> Phone Number *
                        </label>
                        <input 
                            type="tel" 
                            id="signupPhone" 
                            name="phone" 
                            placeholder="0241234567" 
                            pattern="0[0-9]{9}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupPassword">
                            <i class="fas fa-lock"></i> Password *
                        </label>
                        <input 
                            type="password" 
                            id="signupPassword" 
                            name="password" 
                            placeholder="Create a password" 
                            minlength="8"
                            required
                        >
                        <small>Must be at least 8 characters with letters, numbers, and symbols</small>
                        <div id="passwordStrength" style="margin-top: 8px; display: none;"></div>
                    </div>

                    <div class="form-group">
                        <label for="signupConfirmPassword">
                            <i class="fas fa-lock"></i> Confirm Password *
                        </label>
                        <input 
                            type="password" 
                            id="signupConfirmPassword" 
                            name="confirmPassword" 
                            placeholder="Confirm your password" 
                            minlength="8"
                            required
                        >
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-user-plus"></i> Sign Up
                        </button>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="color: var(--dark-light); font-size: 14px;">
                            Already have an account? 
                            <a href="#" onclick="closeSignupModal(); showLoginModal(); return false;" 
                               style="color: var(--primary-color); font-weight: 600;">Login</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close signup modal
function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate password strength
    const strength = checkPasswordStrength(password);
    if (strength.level < 3) {
        toast.warning('Weak Password! ' + strength.message, 5000);
        return;
    }
    
    if (password !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
    }
    
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: password,
        createdAt: new Date().toISOString()
    };
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    // Simulate API delay and use localStorage instead of PHP backend
    setTimeout(() => {
        // Get existing users from localStorage
        const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
        
        // Check if email or phone already exists
        const existingUser = users.find(u => u.email === userData.email || u.phone === userData.phone);
        
        if (existingUser) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            toast.error('Account with this email or phone already exists!');
            return;
        }
        
        // Add new user to the array
        users.push(userData);
        localStorage.setItem('seelDataUsers', JSON.stringify(users));
        
        // Save current user (without password for security)
        const userWithoutPassword = { ...userData };
        delete userWithoutPassword.password;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Close modal and update UI
        closeSignupModal();
        updateHeaderForLoggedInUser(userWithoutPassword);
        showServicesSection();
        
        // Show success message
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.id = 'signupSuccessModal';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Account Created!</h2>
                <p>Welcome to Seel Data, ${userWithoutPassword.name}!</p>
                <button class="btn btn-primary btn-block" onclick="closeSignupSuccessModal()">
                    Start Shopping
                </button>
            </div>
        `;
        document.body.appendChild(successModal);
        successModal.style.display = 'flex';
    }, 800);
}

// Close signup success modal
function closeSignupSuccessModal() {
    const modal = document.getElementById('signupSuccessModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// Show forgot password modal
function showForgotPasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'forgotPasswordModal';
    modal.innerHTML = `
        <div class="modal-content purchase-modal">
            <div class="modal-header">
                <i class="fas fa-key"></i>
                <h2>Reset Password</h2>
                <button class="close-btn" onclick="closeForgotPasswordModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="color: var(--dark-light); margin-bottom: 20px; text-align: center;">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
                <form id="forgotPasswordForm" onsubmit="handleForgotPassword(event)">
                    <div class="form-group">
                        <label for="resetEmail">
                            <i class="fas fa-envelope"></i> Email Address *
                        </label>
                        <input 
                            type="email" 
                            id="resetEmail" 
                            name="email" 
                            placeholder="Enter your registered email" 
                            required
                        >
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeForgotPasswordModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Send Reset Link
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close forgot password modal
function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
        const user = users.find(u => u.email === email);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (user) {
            // Generate reset token
            const resetToken = 'RESET_' + Math.random().toString(36).substr(2, 9);
            const resetData = {
                email: email,
                token: resetToken,
                expiry: Date.now() + 3600000 // 1 hour
            };
            localStorage.setItem('passwordReset_' + email, JSON.stringify(resetData));
            
            closeForgotPasswordModal();
            showPasswordResetLinkModal(email, resetToken);
        } else {
            toast.error('No account found with this email address.');
        }
    }, 800);
}

// Show password reset link modal
function showPasswordResetLinkModal(email, token) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'resetLinkModal';
    const resetLink = window.location.origin + window.location.pathname + '?reset=' + token;
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Reset Link Sent!</h2>
            <p style="margin-bottom: 20px;">Password reset instructions have been sent to:<br><strong>${email}</strong></p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 12px; color: #666; margin-bottom: 10px;">Reset Link (Demo):</p>
                <input type="text" value="${resetLink}" readonly 
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
                    onclick="this.select()">
            </div>
            <button class="btn btn-primary btn-block" onclick="closeResetLinkModal(); window.location.href='${resetLink}'">
                Open Reset Link
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close reset link modal
function closeResetLinkModal() {
    const modal = document.getElementById('resetLinkModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Check for password reset token on page load
function checkPasswordResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset');
    
    if (token) {
        const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
        let resetData = null;
        let userEmail = null;
        
        // Find the reset request
        for (let user of users) {
            const storedReset = localStorage.getItem('passwordReset_' + user.email);
            if (storedReset) {
                const data = JSON.parse(storedReset);
                if (data.token === token && data.expiry > Date.now()) {
                    resetData = data;
                    userEmail = user.email;
                    break;
                }
            }
        }
        
        if (resetData) {
            showNewPasswordModal(userEmail, token);
        } else {
            toast.error('Invalid or expired reset link.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Show new password modal
function showNewPasswordModal(email, token) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'newPasswordModal';
    modal.innerHTML = `
        <div class="modal-content purchase-modal">
            <div class="modal-header">
                <i class="fas fa-lock"></i>
                <h2>Create New Password</h2>
            </div>
            <div class="modal-body">
                <p style="color: var(--dark-light); margin-bottom: 20px; text-align: center;">
                    Enter your new password for <strong>${email}</strong>
                </p>
                <form id="newPasswordForm" onsubmit="handleNewPassword(event, '${email}', '${token}')">
                    <div class="form-group">
                        <label for="newPassword">
                            <i class="fas fa-lock"></i> New Password *
                        </label>
                        <input 
                            type="password" 
                            id="newPassword" 
                            name="newPassword" 
                            placeholder="Enter new password" 
                            required
                            minlength="6"
                        >
                    </div>

                    <div class="form-group">
                        <label for="confirmNewPassword">
                            <i class="fas fa-lock"></i> Confirm Password *
                        </label>
                        <input 
                            type="password" 
                            id="confirmNewPassword" 
                            name="confirmPassword" 
                            placeholder="Confirm new password" 
                            required
                            minlength="6"
                        >
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-check"></i> Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Handle new password
function handleNewPassword(event, email, token) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match!');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('seelDataUsers') || '[]');
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('seelDataUsers', JSON.stringify(users));
            localStorage.removeItem('passwordReset_' + email);
            
            const modal = document.getElementById('newPasswordModal');
            if (modal) modal.remove();
            
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toast.success('Password reset successful! Please login with your new password.');
            setTimeout(() => showLoginModal(), 1000);
        } else {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            toast.error('An error occurred. Please try again.');
        }
    }, 800);
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = {
        level: 0,
        text: 'Very Weak',
        color: '#FF7675',
        message: ''
    };
    
    if (!password) {
        return strength;
    }
    
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;
    
    // Count criteria met
    let criteriaMet = 0;
    if (hasLowerCase) criteriaMet++;
    if (hasUpperCase) criteriaMet++;
    if (hasNumbers) criteriaMet++;
    if (hasSymbols) criteriaMet++;
    if (isLongEnough) criteriaMet++;
    
    // Build message for missing requirements
    let missing = [];
    if (!isLongEnough) missing.push('at least 8 characters');
    if (!hasLowerCase || !hasUpperCase) missing.push('uppercase and lowercase letters');
    if (!hasNumbers) missing.push('numbers');
    if (!hasSymbols) missing.push('special symbols (!@#$%^&* etc.)');
    
    if (missing.length > 0) {
        strength.message = 'Password must contain: ' + missing.join(', ');
    }
    
    // Determine strength level
    if (criteriaMet === 5 && hasLowerCase && hasUpperCase && hasNumbers && hasSymbols) {
        strength.level = 4;
        strength.text = 'Very Strong';
        strength.color = '#00B894';
        strength.message = '';
    } else if (criteriaMet >= 4 && isLongEnough) {
        strength.level = 3;
        strength.text = 'Strong';
        strength.color = '#00B894';
        strength.message = '';
    } else if (criteriaMet >= 3 && isLongEnough) {
        strength.level = 2;
        strength.text = 'Moderate';
        strength.color = '#FDCB6E';
    } else if (isLongEnough) {
        strength.level = 1;
        strength.text = 'Weak';
        strength.color = '#FFA500';
    } else {
        strength.level = 0;
        strength.text = 'Very Weak';
        strength.color = '#FF7675';
    }
    
    return strength;
}

// Show authentication required modal
function showAuthRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'authRequiredModal';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon" style="background: linear-gradient(135deg, #FF7675 0%, #E74C3C 100%);">
                <i class="fas fa-lock"></i>
            </div>
            <h2>Authentication Required</h2>
            <p>Please login or create an account to access our services</p>
            <div class="form-actions">
                <button class="btn btn-secondary" onclick="closeAuthRequiredModal(); showLoginModal();">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
                <button class="btn btn-primary" onclick="closeAuthRequiredModal(); showSignupModal();">
                    <i class="fas fa-user-plus"></i> Sign Up
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close auth required modal
function closeAuthRequiredModal() {
    const modal = document.getElementById('authRequiredModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Smooth scrolling
function initializeSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Service selection
function selectService(serviceName) {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        showAuthRequiredModal();
        return;
    }
    
    // Store selected service
    sessionStorage.setItem('selectedService', serviceName);
    
    // Show purchase modal
    showPurchaseModal(serviceName);
}

// Show purchase modal
function showPurchaseModal(serviceName) {
    // Get current user email
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUser.email || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'purchaseModal';
    
    // Define bundle options based on service
    let bundleOptions = '';
    
    if (serviceName === 'MTN Data Bundle') {
        bundleOptions = `
            <option value="">Choose bundle size...</option>
            <option value="1GB - GH₵6.50">1GB - GH₵6.50</option>
            <option value="2GB - GH₵12.50">2GB - GH₵12.50</option>
            <option value="3GB - GH₵18.50">3GB - GH₵18.50</option>
            <option value="4GB - GH₵23.50">4GB - GH₵23.50</option>
            <option value="5GB - GH₵28.50">5GB - GH₵28.50</option>
            <option value="6GB - GH₵32.50">6GB - GH₵32.50</option>
            <option value="7GB - GH₵38.50">7GB - GH₵38.50</option>
            <option value="8GB - GH₵42.50">8GB - GH₵42.50</option>
            <option value="10GB - GH₵48.50">10GB - GH₵48.50</option>
            <option value="15GB - GH₵68.50">15GB - GH₵68.50</option>
            <option value="20GB - GH₵88.50">20GB - GH₵88.50</option>
            <option value="25GB - GH₵109.50">25GB - GH₵109.50</option>
            <option value="30GB - GH₵129.50">30GB - GH₵129.50</option>
            <option value="40GB - GH₵169.50">40GB - GH₵169.50</option>
            <option value="50GB - GH₵200.50">50GB - GH₵200.50</option>
            <option value="100GB - GH₵380.50">100GB - GH₵380.50</option>
        `;
    } else if (serviceName === 'Telecel Data Bundle') {
        bundleOptions = `
            <option value="">Choose bundle size...</option>
            <option value="5GB - GH₵26.50">5GB - GH₵26.50</option>
            <option value="10GB - GH₵47.50">10GB - GH₵47.50</option>
            <option value="15GB - GH₵67.00">15GB - GH₵67.00</option>
            <option value="20GB - GH₵86.50">20GB - GH₵86.50</option>
            <option value="25GB - GH₵108.00">25GB - GH₵108.00</option>
            <option value="30GB - GH₵125.50">30GB - GH₵125.50</option>
            <option value="40GB - GH₵156.50">40GB - GH₵156.50</option>
            <option value="50GB - GH₵210.50">50GB - GH₵210.50</option>
            <option value="90GB - GH₵330.00">90GB - GH₵330.00</option>
            <option value="100GB - GH₵395.50">100GB - GH₵395.50</option>
            <option value="190GB - GH₵400.00">190GB - GH₵400.00</option>
        `;
    } else {
        // Default bundles for other services
        bundleOptions = `
            <option value="">Choose bundle size...</option>
            <option value="1GB - GH₵5.00">1GB - GH₵5.00</option>
            <option value="2GB - GH₵9.00">2GB - GH₵9.00</option>
            <option value="5GB - GH₵20.00">5GB - GH₵20.00</option>
            <option value="10GB - GH₵35.00">10GB - GH₵35.00</option>
            <option value="20GB - GH₵65.00">20GB - GH₵65.00</option>
            <option value="50GB - GH₵150.00">50GB - GH₵150.00</option>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-content purchase-modal">
            <div class="modal-header">
                <i class="fas fa-shopping-cart"></i>
                <h2>Purchase ${serviceName}</h2>
                <button class="close-btn" onclick="closePurchaseModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="purchaseForm" onsubmit="handlePurchase(event)">
                    <div class="form-group">
                        <label for="phoneNumber">
                            <i class="fas fa-phone"></i> Phone Number *
                        </label>
                        <input 
                            type="tel" 
                            id="phoneNumber" 
                            name="phoneNumber" 
                            placeholder="e.g., 0241234567" 
                            pattern="0[0-9]{9}"
                            required
                        >
                        <small>Enter the number to receive the bundle</small>
                    </div>

                    <div class="form-group">
                        <label for="bundleSize">
                            <i class="fas fa-database"></i> Select Bundle *
                        </label>
                        <select id="bundleSize" name="bundleSize" required>
                            ${bundleOptions}
                            <option value="20GB - GH₵65.00">20GB - GH₵65.00</option>
                            <option value="50GB - GH₵150.00">50GB - GH₵150.00</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="paymentMethod">
                            <i class="fas fa-credit-card"></i> Payment Method *
                        </label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="">Choose payment method...</option>
                            <option value="momo">Mobile Money (MTN/Vodafone)</option>
                            <option value="card">Credit/Debit Card</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope"></i> Email
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="your@email.com"
                            value="${userEmail}"
                            readonly
                            style="background-color: #f5f5f5; cursor: not-allowed;"
                        >
                        <small>Your registered email address</small>
                    </div>

                    <div class="form-info">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <strong>Payment Instructions:</strong><br>
                            Send payment to: <strong>0537922905</strong><br>
                            Name: <strong>AKYE EMMANUEL KWESI</strong><br>
                            WhatsApp: <strong>0537922905</strong><br><br>
                            After payment, you will receive a confirmation SMS and data will be delivered within 5 minutes.
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closePurchaseModal()">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-check"></i> Proceed to Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close purchase modal
function closePurchaseModal() {
    const modal = document.getElementById('purchaseModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Handle purchase form submission
function handlePurchase(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        service: sessionStorage.getItem('selectedService'),
        phoneNumber: formData.get('phoneNumber'),
        bundleSize: formData.get('bundleSize'),
        paymentMethod: formData.get('paymentMethod'),
        email: formData.get('email') || 'customer@seeldata.com'
    };
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Check if user has a valid Paystack key
    // IMPORTANT: Replace the key below with your actual Paystack public key
    // Get it from: https://dashboard.paystack.com/#/settings/developers
    // Use pk_test_xxx for testing, pk_live_xxx for production
    const PAYSTACK_PUBLIC_KEY = 'pk_live_c5bf872b86583d795bd34b259392f6a2c078deb1'; // Your Paystack LIVE key
    const hasValidKey = PAYSTACK_PUBLIC_KEY && !PAYSTACK_PUBLIC_KEY.includes('xxxxxxxxxx');
    
    if (hasValidKey && typeof PaystackPop !== 'undefined') {
        // Extract amount from bundle size
        const amountMatch = data.bundleSize.match(/GH₵([0-9.]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) * 100 : 500; // Convert to pesewas
        
        // Initialize Paystack payment
        const handler = PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: data.email,
            amount: amount,
            currency: 'GHS',
            ref: 'SEEL_' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Service",
                        variable_name: "service",
                        value: data.service
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phone_number",
                        value: data.phoneNumber
                    },
                    {
                        display_name: "Bundle Size",
                        variable_name: "bundle_size",
                        value: data.bundleSize
                    }
                ]
            },
            callback: function(response) {
                // Payment successful
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                closePurchaseModal();
                
                // Send data to your backend to verify payment
                verifyPayment(response.reference, data);
            },
            onClose: function() {
                // User closed payment modal
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
        
        handler.openIframe();
    } else {
        // Demo mode - Simulate payment process
        console.log('Running in DEMO mode. Add your Paystack key to enable real payments.');
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            closePurchaseModal();
            
            const demoRef = 'DEMO_' + Math.floor((Math.random() * 1000000000) + 1);
            
            // Show demo payment simulation
            const paymentSimModal = document.createElement('div');
            paymentSimModal.className = 'modal';
            paymentSimModal.id = 'paymentSimModal';
            paymentSimModal.innerHTML = `
                <div class="modal-content success-modal">
                    <div class="success-icon" style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h2>Demo Mode</h2>
                    <p>Payment simulation in progress...</p>
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Amount:</span>
                            <strong>${data.bundleSize}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Phone:</span>
                            <strong>${data.phoneNumber}</strong>
                        </div>
                    </div>
                    <small style="color: #666; display: block; margin-top: 10px;">
                        Add your Paystack key in script.js to enable real payments
                    </small>
                </div>
            `;
            document.body.appendChild(paymentSimModal);
            paymentSimModal.style.display = 'flex';
            
            setTimeout(() => {
                paymentSimModal.remove();
                verifyPayment(demoRef, data);
            }, 2000);
        }, 1000);
    }
}

// Verify payment with backend
function verifyPayment(reference, orderData) {
    // Show verification message
    const verifyingModal = document.createElement('div');
    verifyingModal.className = 'modal';
    verifyingModal.id = 'verifyingModal';
    verifyingModal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
        </div>
    `;
    document.body.appendChild(verifyingModal);
    verifyingModal.style.display = 'flex';
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Simulate payment verification
    setTimeout(() => {
        verifyingModal.remove();
        
        // Save order to localStorage
        const order = {
            service: orderData.service,
            phoneNumber: orderData.phoneNumber,
            bundleSize: orderData.bundleSize,
            paymentMethod: orderData.paymentMethod,
            paymentReference: reference,
            status: 'Completed',
            createdAt: new Date().toISOString()
        };
        
        // Get existing orders for this user
        const orderKey = 'userOrders_' + currentUser.email;
        const orders = JSON.parse(localStorage.getItem(orderKey) || '[]');
        orders.push(order);
        localStorage.setItem(orderKey, JSON.stringify(orders));
        
        showSuccessModal(orderData, reference);
    }, 2000);
}

// Show success modal
function showSuccessModal(data, paymentRef) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'successModal';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Payment Successful!</h2>
            <p>Your bundle will be delivered shortly</p>
            
            <div class="order-summary">
                <div class="summary-item">
                    <span>Service:</span>
                    <strong>${data.service}</strong>
                </div>
                <div class="summary-item">
                    <span>Bundle:</span>
                    <strong>${data.bundleSize}</strong>
                </div>
                <div class="summary-item">
                    <span>Phone:</span>
                    <strong>${data.phoneNumber}</strong>
                </div>
                ${paymentRef ? `<div class="summary-item">
                    <span>Reference:</span>
                    <strong>${paymentRef}</strong>
                </div>` : ''}
            </div>
            
            <div class="success-message">
                <i class="fas fa-clock"></i>
                <p>Data will be delivered within 5 minutes</p>
            </div>
            
            <button class="btn btn-primary btn-block" onclick="closeSuccessModal()">
                Done
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

// Scroll to services section
function scrollToServices() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        showAuthRequiredModal();
        return;
    }
    
    const servicesSection = document.getElementById('services');
    servicesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Header scroll effect
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.disabled) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service cards and feature cards
document.querySelectorAll('.service-card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
});

// ========== FAVORITES / WISHLIST FEATURE ==========

function initializeFavorites() {
    // Add heart icons to all bundle cards
    document.querySelectorAll('.service-card').forEach(card => {
        const serviceName = card.querySelector('h3')?.textContent;
        if (serviceName) {
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            favoriteBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(serviceName, favoriteBtn);
            };
            card.style.position = 'relative';
            card.insertBefore(favoriteBtn, card.firstChild);
            
            // Check if already favorited
            const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
            if (favorites.includes(serviceName)) {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            }
        }
    });
}

function toggleFavorite(serviceName, btn) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        toast.warning('Please login to add favorites');
        showLoginModal();
        return;
    }
    
    let favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const index = favorites.indexOf(serviceName);
    
    if (index > -1) {
        favorites.splice(index, 1);
        btn.classList.remove('favorited');
        btn.innerHTML = '<i class=\"far fa-heart\"></i>';
        toast.info('Removed from favorites');
    } else {
        favorites.push(serviceName);
        btn.classList.add('favorited');
        btn.innerHTML = '<i class=\"fas fa-heart\"></i>';
        toast.success('Added to favorites!');
    }
    
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
}

function showFavoritesModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        toast.warning('Please login to view favorites');
        showLoginModal();
        return;
    }
    
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'favoritesModal';
    
    let favoritesHTML = '';
    if (favorites.length === 0) {
        favoritesHTML = '<p style=\"text-align: center; color: var(--dark-light); padding: 40px;\"><i class=\"fas fa-heart-broken\" style=\"font-size: 48px; display: block; margin-bottom: 15px;\"></i>No favorites yet. Start adding bundles you love!</p>';
    } else {
        favoritesHTML = favorites.map(fav => `
            <div class=\"favorite-item\">
                <div>
                    <i class=\"fas fa-heart\" style=\"color: var(--accent-color); margin-right: 10px;\"></i>
                    <strong>${fav}</strong>
                </div>
                <button class=\"btn btn-primary btn-sm\" onclick=\"buyFavorite('${fav}')\">
                    <i class=\"fas fa-shopping-cart\"></i> Buy Now
                </button>
            </div>
        `).join('');
    }
    
    modal.innerHTML = `
        <div class=\"modal-content purchase-modal\">
            <div class=\"modal-header\">
                <i class=\"fas fa-heart\"></i>
                <h2>My Favorites</h2>
                <button class=\"close-btn\" onclick=\"closeFavoritesModal()\">
                    <i class=\"fas fa-times\"></i>
                </button>
            </div>
            <div class=\"modal-body\">
                ${favoritesHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

function buyFavorite(serviceName) {
    closeFavoritesModal();
    showPurchaseModal(serviceName);
}

// ========== TRANSACTION HISTORY & RECEIPTS ==========

function showTransactionHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        toast.warning('Please login to view transaction history');
        showLoginModal();
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('userOrders_' + currentUser.email) || '[]');
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'transactionHistoryModal';
    
    let ordersHTML = '';
    if (orders.length === 0) {
        ordersHTML = '<p style=\"text-align: center; color: var(--dark-light); padding: 40px;\"><i class=\"fas fa-receipt\" style=\"font-size: 48px; display: block; margin-bottom: 15px;\"></i>No transactions yet. Make your first purchase!</p>';
    } else {
        ordersHTML = orders.reverse().map((order, index) => {
            const date = new Date(order.createdAt);
            return `
                <div class=\"transaction-item\">
                    <div class=\"transaction-header\">
                        <div>
                            <strong>${order.service}</strong>
                            <small style=\"display: block; color: var(--dark-light);\">${date.toLocaleString()}</small>
                        </div>
                        <span class=\"badge badge-${order.status || 'success'}\">${order.status || 'Completed'}</span>
                    </div>
                    <div class=\"transaction-details\">
                        <div><i class=\"fas fa-mobile-alt\"></i> ${order.phoneNumber}</div>
                        <div><i class=\"fas fa-box\"></i> ${order.bundleSize}</div>
                        <div><i class=\"fas fa-credit-card\"></i> ${order.paymentMethod}</div>
                        <div><i class=\"fas fa-hashtag\"></i> ${order.paymentReference}</div>
                    </div>
                    <div class=\"transaction-actions\">
                        <button class=\"btn btn-secondary btn-sm\" onclick=\"downloadReceipt(${index})\">
                            <i class=\"fas fa-download\"></i> Download Receipt
                        </button>
                        <button class=\"btn btn-primary btn-sm\" onclick=\"reorder(${index})\">
                            <i class=\"fas fa-redo\"></i> Buy Again
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.innerHTML = `
        <div class=\"modal-content purchase-modal\" style=\"max-width: 800px;\">\n            <div class=\"modal-header\">
                <i class=\"fas fa-history\"></i>
                <h2>Transaction History</h2>
                <button class=\"close-btn\" onclick=\"closeTransactionHistory()\">\n                    <i class=\"fas fa-times\"></i>
                </button>
            </div>
            <div class=\"modal-body\">
                ${ordersHTML}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeTransactionHistory() {
    const modal = document.getElementById('transactionHistoryModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

function downloadReceipt(orderIndex) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orders = JSON.parse(localStorage.getItem('userOrders_' + currentUser.email) || '[]');
    const order = orders.reverse()[orderIndex];
    
    // Create receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.paymentReference}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .details { margin: 20px 0; }
                .details div { padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
                .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class=\"header\">
                <h1>SEEL DATA</h1>
                <p>Payment Receipt</p>
            </div>
            <div class=\"details\">
                <div><strong>Date:</strong> <span>${new Date(order.createdAt).toLocaleString()}</span></div>
                <div><strong>Reference:</strong> <span>${order.paymentReference}</span></div>
                <div><strong>Service:</strong> <span>${order.service}</span></div>
                <div><strong>Bundle:</strong> <span>${order.bundleSize}</span></div>
                <div><strong>Phone Number:</strong> <span>${order.phoneNumber}</span></div>
                <div><strong>Payment Method:</strong> <span>${order.paymentMethod}</span></div>
                <div><strong>Status:</strong> <span>${order.status || 'Completed'}</span></div>
            </div>
            <div class=\"footer\">
                <p>Thank you for choosing Seel Data!</p>
                <p>For support, contact: 0537922905</p>
            </div>
        </body>
        </html>
    `;
    
    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${order.paymentReference}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
}

function reorder(orderIndex) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orders = JSON.parse(localStorage.getItem('userOrders_' + currentUser.email) || '[]');
    const order = orders.reverse()[orderIndex];
    
    closeTransactionHistory();
    showPurchaseModal(order.service);
    
    // Pre-fill the form
    setTimeout(() => {
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) phoneInput.value = order.phoneNumber;
    }, 100);
}

// ========== WHATSAPP SUPPORT & FAQ ==========

function initializeWhatsAppSupport() {
    // Add floating WhatsApp button
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = 'https://wa.me/233537922905?text=Hello%20Seel%20Data,%20I%20need%20help';
    whatsappBtn.target = '_blank';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.innerHTML = '<i class=\"fab fa-whatsapp\"></i>';
    whatsappBtn.title = 'Chat with us on WhatsApp';
    document.body.appendChild(whatsappBtn);
}

function showFAQ() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'faqModal';
    
    const faqs = [
        {
            q: 'How long does delivery take?',
            a: 'Data bundles are delivered within 5 minutes after successful payment.'
        },
        {
            q: 'What payment methods do you accept?',
            a: 'We accept Mobile Money (MTN/Vodafone), Credit/Debit Cards, and Bank Transfers via Paystack.'
        },
        {
            q: 'Can I get a refund?',
            a: 'Refunds are processed within 24 hours if data was not delivered. Contact support with your payment reference.'
        },
        {
            q: 'Which SIM types are not supported?',
            a: 'Agent SIM, Merchant SIM, EVD SIM, Turbonet, Broadband, Blacklisted, Roaming, Company/Group SIMs, and Prepaid numbers are not supported.'
        },
        {
            q: 'How do I check my order status?',
            a: 'Click on \"Transaction History\" in your account menu to view all your orders and their status.'
        },
        {
            q: 'Can I buy for multiple numbers?',
            a: 'Yes! Complete one purchase, then repeat the process for additional numbers.'
        }
    ];
    
    const faqHTML = faqs.map((faq, index) => `
        <div class=\"faq-item\">
            <div class=\"faq-question\" onclick=\"toggleFAQ(${index})\">
                <strong><i class=\"fas fa-question-circle\"></i> ${faq.q}</strong>
                <i class=\"fas fa-chevron-down\"></i>
            </div>
            <div class=\"faq-answer\" id=\"faq-${index}\">
                <p>${faq.a}</p>
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class=\"modal-content purchase-modal\" style=\"max-width: 700px;\">
            <div class=\"modal-header\">
                <i class=\"fas fa-question-circle\"></i>
                <h2>Frequently Asked Questions</h2>
                <button class=\"close-btn\" onclick=\"closeFAQModal()\">\n                    <i class=\"fas fa-times\"></i>
                </button>
            </div>
            <div class=\"modal-body\">
                <div class=\"faq-search\">
                    <input type=\"text\" placeholder=\"Search FAQs...\" onkeyup=\"searchFAQ(this.value)\">
                </div>
                <div id=\"faqList\">
                    ${faqHTML}
                </div>
                <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;\">
                    <p style=\"color: var(--dark-light); margin-bottom: 15px;\">Still have questions?</p>
                    <a href=\"https://wa.me/233537922905\" target=\"_blank\" class=\"btn btn-success\">
                        <i class=\"fab fa-whatsapp\"></i> Chat on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeFAQModal() {
    const modal = document.getElementById('faqModal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

function toggleFAQ(index) {
    const answer = document.getElementById('faq-' + index);
    const allAnswers = document.querySelectorAll('.faq-answer');
    
    allAnswers.forEach((ans, i) => {
        if (i !== index) ans.classList.remove('active');
    });
    
    answer.classList.toggle('active');
}

function searchFAQ(query) {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
