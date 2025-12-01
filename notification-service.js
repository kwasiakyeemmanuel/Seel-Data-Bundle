// Notification Service for Order Alerts
// Sends email and WhatsApp notifications when customers order data bundles

class NotificationService {
    constructor() {
        // EmailJS Configuration (Free email service)
        // Sign up at: https://www.emailjs.com/
        this.emailConfig = {
            serviceId: 'service_od9842j',  // Your EmailJS Service ID
            templateId: 'template_m6xwo5g', // Your EmailJS Template ID
            publicKey: 'vdOv7Yne2fRFjCRQ_'    // Your EmailJS Public Key
        };
        
        // Admin contact details
        this.adminEmail = 'seeldatabundle@gmail.com';
        this.adminPhone = '0537922905';
        
        // Load EmailJS script if not already loaded
        this.loadEmailJS();
    }
    
    loadEmailJS() {
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                if (this.emailConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
                    emailjs.init(this.emailConfig.publicKey);
                }
            };
            document.head.appendChild(script);
        } else if (this.emailConfig.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            emailjs.init(this.emailConfig.publicKey);
        }
    }
    
    /**
     * Send notification when customer places order
     * @param {Object} orderData - Order information
     */
    async sendOrderNotification(orderData) {
        const {
            customerName,
            customerEmail,
            customerPhone,
            service,
            bundleSize,
            amount,
            reference,
            timestamp
        } = orderData;
        
        console.log('📧 Sending email notification...');
        
        // Send Email Notification only
        try {
            const result = await this.sendEmailNotification(orderData);
            return { email: result };
        } catch (error) {
            console.error('❌ Email notification failed:', error);
            return { email: false };
        }
    }
    
    /**
     * Send email notification via EmailJS
     */
    async sendEmailNotification(orderData) {
        // Check if EmailJS is configured
        if (this.emailConfig.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
            console.log('⚠️ EmailJS not configured. Skipping email notification.');
            return false;
        }
        
        if (typeof emailjs === 'undefined') {
            console.error('❌ EmailJS library not loaded');
            return false;
        }
        
        const templateParams = {
            to_email: this.adminEmail,
            to_name: 'Seel Data Admin',
            customer_name: orderData.customerName || 'N/A',
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone,
            service: orderData.service,
            bundle_size: orderData.bundleSize,
            amount: orderData.amount,
            reference: orderData.reference,
            timestamp: new Date(orderData.timestamp).toLocaleString(),
            subject: `New Order - ${orderData.service} ${orderData.bundleSize}`
        };
        
        try {
            const response = await emailjs.send(
                this.emailConfig.serviceId,
                this.emailConfig.templateId,
                templateParams
            );
            
            console.log('✅ Email notification sent:', response.status);
            return true;
        } catch (error) {
            console.error('❌ Email send failed:', error);
            return false;
        }
    }
    
    /**
     * Send test notification
     */
    async sendTestNotification() {
        const testData = {
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '0241234567',
            service: 'MTN',
            bundleSize: '5GB',
            amount: '15.00',
            reference: 'SEEL_TEST_' + Date.now(),
            timestamp: Date.now()
        };
        
        console.log('🧪 Sending test email notification...');
        const result = await this.sendOrderNotification(testData);
        
        console.log('Test Result:', result);
        if (result.email) {
            console.log('✅ SUCCESS! Check your email: seeldatabundle@gmail.com');
        } else {
            console.log('❌ Failed. Check console for errors.');
        }
        return result;
    }
}

// Initialize notification service
window.NotificationService = new NotificationService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
