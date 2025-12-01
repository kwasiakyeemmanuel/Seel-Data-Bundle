# Notification Setup Guide
## Get Email & WhatsApp Alerts When Customers Order

---

## 📧 Email Notifications (EmailJS - Free)

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Click "Sign Up" (free account - 200 emails/month)
3. Verify your email

### Step 2: Add Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your email provider)
4. Connect your email: `seeldatabundle@gmail.com`
5. Copy the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template:

**Template Name:** `new_order_alert`

**Subject:** `New Order - {{service}} {{bundle_size}}`

**Content:**
```
🔔 NEW DATA BUNDLE ORDER

Service: {{service}}
Bundle: {{bundle_size}}
Amount: GH₵{{amount}}

CUSTOMER DETAILS:
Name: {{customer_name}}
Phone: {{customer_phone}}
Email: {{customer_email}}

Reference: {{reference}}
Time: {{timestamp}}

Please process this order immediately.
```

4. Save and copy the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `abc123XYZ`)

### Step 5: Update Your Code
Open `notification-service.js` and replace:
```javascript
serviceId: 'YOUR_EMAILJS_SERVICE_ID',     // Replace with your Service ID
templateId: 'YOUR_EMAILJS_TEMPLATE_ID',   // Replace with your Template ID
publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'      // Replace with your Public Key
```

---

## 📱 WhatsApp Notifications

### Option 1: Twilio WhatsApp (Recommended - Easiest)

#### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/
2. Sign up for free trial ($15 credit)
3. Verify your phone number

#### Step 2: Enable WhatsApp Sandbox
1. In Twilio console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join WhatsApp Sandbox
3. Send the code to Twilio WhatsApp number

#### Step 3: Get Credentials
1. From Twilio dashboard, copy:
   - **Account SID**
   - **Auth Token**
2. Note your **WhatsApp Sandbox Number** (e.g., +14155238886)

#### Step 4: Create Serverless Function
Create `api/send-whatsapp.js`:
```javascript
const twilio = require('twilio');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            body: req.body.message,
            from: 'whatsapp:+14155238886', // Twilio sandbox number
            to: `whatsapp:+${req.body.to}`
        });

        res.status(200).json({ success: true, sid: message.sid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

#### Step 5: Deploy to Vercel
```bash
vercel
```

Add environment variables in Vercel:
- `TWILIO_ACCOUNT_SID`: Your Account SID
- `TWILIO_AUTH_TOKEN`: Your Auth Token

#### Step 6: Update notification-service.js
```javascript
whatsappConfig: {
    apiUrl: 'https://your-domain.vercel.app/api/send-whatsapp',
    apiKey: 'not_needed_for_backend',
    adminNumber: '233537922905'  // Your WhatsApp (233 = Ghana)
}
```

---

### Option 2: Africa's Talking (Better for Ghana)

#### Step 1: Create Account
1. Go to https://africastalking.com/
2. Sign up (free sandbox)
3. Add credits for live use

#### Step 2: Get API Key
1. Go to **Settings** → **API Key**
2. Copy your API key

#### Step 3: Update notification-service.js
```javascript
whatsappConfig: {
    apiUrl: 'https://api.africastalking.com/version1/messaging',
    apiKey: 'YOUR_AFRICAS_TALKING_API_KEY',
    username: 'sandbox', // or your username
    adminNumber: '233537922905'
}
```

---

## 🧪 Testing

### Test Email Only
Open browser console and run:
```javascript
NotificationService.emailConfig.serviceId = 'service_YOUR_ID';
NotificationService.emailConfig.templateId = 'template_YOUR_ID';
NotificationService.emailConfig.publicKey = 'YOUR_PUBLIC_KEY';
NotificationService.sendTestNotification();
```

### Test WhatsApp Only
```javascript
NotificationService.whatsappConfig.apiUrl = 'YOUR_API_URL';
NotificationService.whatsappConfig.apiKey = 'YOUR_API_KEY';
NotificationService.sendTestNotification();
```

---

## 📋 What You'll Receive

### Email Alert:
```
Subject: New Order - MTN 5GB

🔔 NEW DATA BUNDLE ORDER

Service: MTN
Bundle: 5GB
Amount: GH₵15.00

CUSTOMER DETAILS:
Name: John Doe
Phone: 0241234567
Email: john@example.com

Reference: SEEL_123456789
Time: 12/1/2025, 10:30:45 AM
```

### WhatsApp Message:
```
🔔 NEW DATA BUNDLE ORDER

📱 Service: MTN
📦 Bundle: 5GB
💰 Amount: GH₵15.00

👤 CUSTOMER DETAILS:
📞 Phone: 0241234567
📧 Email: john@example.com
👤 Name: John Doe

🔖 Reference: SEEL_123456789
⏰ Time: 12/1/2025, 10:30:45 AM

✅ Please process this order immediately.
```

---

## 💡 Tips

1. **Email is free** - Start with EmailJS (200 emails/month free)
2. **WhatsApp costs** - Twilio charges per message, Africa's Talking is cheaper for Ghana
3. **Test first** - Use sandbox/test mode before going live
4. **Set alerts** - Configure email filters to get mobile notifications
5. **Backup** - Keep checking Paystack dashboard as backup

---

## ⚠️ Important Notes

- Notifications send **after payment succeeds**
- Failed payments **don't trigger notifications**
- Check spam folder for email alerts
- WhatsApp requires approved business account for production
- Twilio sandbox works for testing only

---

## 🆘 Need Help?

If you get errors:
1. Check browser console (F12)
2. Verify all API keys are correct
3. Ensure services are active
4. Test with simple message first

Ready to configure? Let me know which service you want to set up first!
