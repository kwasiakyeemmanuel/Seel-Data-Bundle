// Notification Service for Order Alerts
// Sends email and WhatsApp notifications when customers order data bundles

class NotificationService {
    constructor() {
        // EmailJS Configuration (Free email service)
        // Sign up at: https://www.emailjs.com/
        this.emailConfig = {
            serviceId: 'service_od9842j',  // Your EmailJS Service ID
            templateId: 'template_4fzd45c', // Your EmailJS Template ID
            publicKey: 'vdOv7Yne2fRFjCRQ_'    // Your EmailJS Public Key
        };
        
        // WhatsApp Configuration
        // Option 1: WhatsApp Business API (requires approval)
        // Option 2: Use Twilio WhatsApp (easier to set up)
        // Option 3: Use Africa's Talking WhatsApp API
        this.whatsappConfig = {
            apiUrl: 'YOUR_WHATSAPP_API_URL',        // Your WhatsApp API endpoint
            apiKey: 'YOUR_WHATSAPP_API_KEY',        // Your API key
            adminNumber: '233537922905'              // Your WhatsApp number (international format)
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
        
        console.log('📧 Sending order notifications...');
        
        const results = {
            email: false,
            whatsapp: false
        };
        
        // Send Email Notification
        try {
            results.email = await this.sendEmailNotification(orderData);
        } catch (error) {
            console.error('❌ Email notification failed:', error);
        }
        
        // Send WhatsApp Notification
        try {
            results.whatsapp = await this.sendWhatsAppNotification(orderData);
        } catch (error) {
            console.error('❌ WhatsApp notification failed:', error);
        }
        
        return results;
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
     * Send WhatsApp notification
     */
    async sendWhatsAppNotification(orderData) {
        // Check if WhatsApp API is configured
        if (this.whatsappConfig.apiUrl === 'YOUR_WHATSAPP_API_URL') {
            console.log('⚠️ WhatsApp API not configured. Skipping WhatsApp notification.');
            return false;
        }
        
        const message = this.formatWhatsAppMessage(orderData);
        
        try {
            const response = await fetch(this.whatsappConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.whatsappConfig.apiKey}`
                },
                body: JSON.stringify({
                    to: this.whatsappConfig.adminNumber,
                    message: message,
                    type: 'text'
                })
            });
            
            if (response.ok) {
                console.log('✅ WhatsApp notification sent');
                return true;
            } else {
                console.error('❌ WhatsApp send failed:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('❌ WhatsApp API error:', error);
            return false;
        }
    }
    
    /**
     * Format WhatsApp message
     */
    formatWhatsAppMessage(orderData) {
        return `🔔 *NEW DATA BUNDLE ORDER*

📱 *Service:* ${orderData.service}
📦 *Bundle:* ${orderData.bundleSize}
💰 *Amount:* GH₵${orderData.amount}

👤 *Customer Details:*
📞 Phone: ${orderData.customerPhone}
📧 Email: ${orderData.customerEmail}
👤 Name: ${orderData.customerName || 'N/A'}

🔖 *Reference:* ${orderData.reference}
⏰ *Time:* ${new Date(orderData.timestamp).toLocaleString()}

✅ Please process this order immediately.`;
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
        
        console.log('🧪 Sending test notifications...');
        const results = await this.sendOrderNotification(testData);
        
        console.log('Test Results:', results);
        return results;
    }
}

// Initialize notification service
window.NotificationService = new NotificationService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}
