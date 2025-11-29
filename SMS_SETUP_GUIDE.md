# SMS Setup Guide for Seel Data Bundle

Your website now supports real SMS notifications! Follow this guide to enable actual SMS delivery.

## Current Status
- ✅ SMS functionality implemented
- ⚠️ Currently in **DEMO MODE** (SMS shown on screen only)
- 🔧 Needs API credentials to send real SMS

## Supported SMS Providers

### Option 1: Arkesel (Recommended for Ghana)
**Website:** https://arkesel.com

**Steps:**
1. Create account at https://arkesel.com
2. Purchase SMS credits
3. Get your API Key from dashboard
4. Update `script.js` line 1-15:

```javascript
const SMS_CONFIG = {
    provider: 'arkesel',
    arkesel: {
        apiKey: 'YOUR_ACTUAL_API_KEY_HERE',
        senderId: 'SeelData'
    }
};
```

**Pricing:** Affordable bulk SMS rates for Ghana
**Features:** 
- Reliable delivery in Ghana
- Easy API integration
- Good documentation
- Supports long SMS

### Option 2: Hubtel
**Website:** https://hubtel.com

**Steps:**
1. Create account at https://hubtel.com
2. Get Client ID and Client Secret
3. Purchase SMS credits
4. Update `script.js` line 1-20:

```javascript
const SMS_CONFIG = {
    provider: 'hubtel',
    hubtel: {
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'YOUR_CLIENT_SECRET',
        senderId: 'SeelData'
    }
};
```

**Features:**
- Popular in Ghana
- Multiple services (SMS, payments, etc.)
- Enterprise-grade reliability

## What SMS Gets Sent?

### 1. Purchase Confirmation SMS
Sent automatically after successful payment:
```
✅ Purchase Confirmed!

Order #ORD1234567890
20GB - GH₵65.00
Network: MTN Ghana
Phone: 0241234567
Amount: GH₵65.00

Your data will be delivered fast and reliably to your satisfaction.

Thank you for choosing Seel Data!
```

### 2. 2FA Verification Code
Sent when user enables two-factor authentication:
```
Your Seel Data verification code is: 123456

This code expires in 5 minutes.

Do not share this code with anyone.
```

## Configuration Steps

1. **Choose your SMS provider** (Arkesel or Hubtel recommended)

2. **Get API credentials:**
   - Sign up on provider website
   - Complete verification
   - Purchase SMS credits (start with small amount for testing)
   - Get API key/credentials from dashboard

3. **Update script.js:**
   ```bash
   # Open the file
   c:\xampp\htdocs\Seel Data\script.js
   
   # Find line 1 (SMS_CONFIG)
   # Replace placeholder credentials with your actual credentials
   ```

4. **Change provider from 'demo' to your chosen provider:**
   ```javascript
   provider: 'arkesel', // or 'hubtel'
   ```

5. **Test the integration:**
   - Make a test purchase
   - Check if SMS is delivered to your phone
   - Check browser console for any errors

6. **Deploy to production:**
   ```bash
   git add script.js
   git commit -m "Configured SMS API with production credentials"
   git push
   ```

## Phone Number Format

The system automatically formats phone numbers:
- **Input:** `0241234567` or `024 123 4567`
- **Converted to:** `233241234567` (Ghana country code)

If you serve customers in other countries, update the phone formatting logic in the `sendRealSMS()` function.

## Testing

### Demo Mode Testing (Current)
- SMS messages shown on screen
- No actual SMS sent
- No credits required
- Good for development

### Production Testing
1. Change provider to 'arkesel' or 'hubtel'
2. Add small amount of credits
3. Make test purchase with your own phone number
4. Verify SMS delivery
5. Check SMS balance in provider dashboard

## Troubleshooting

### SMS not sending?
1. Check browser console (F12) for errors
2. Verify API credentials are correct
3. Ensure SMS credits are available
4. Check phone number format
5. Verify provider API is online

### SMS delayed?
- Normal delay: 1-30 seconds
- High volume may cause delays
- Check provider status page

### Wrong message received?
- Check the message template in script.js
- Search for `sendPurchaseConfirmationSMS` function
- Customize message as needed

## Cost Estimate

**Arkesel Pricing (approximate):**
- 1 SMS page: ~GH₵0.04 - GH₵0.06
- 1000 SMS: ~GH₵40 - GH₵60

**Hubtel Pricing (approximate):**
- Similar to Arkesel
- Contact them for bulk rates

**Monthly estimate for 1000 customers:**
- 1000 orders × 1 SMS = GH₵40-60/month

## Security Notes

⚠️ **Important:**
1. Never commit API keys to public repositories
2. Consider using environment variables for production
3. Rotate API keys regularly
4. Monitor SMS usage to detect abuse
5. Set spending limits in provider dashboard

## Support

If you need help:
1. Check provider documentation (Arkesel/Hubtel)
2. Test in demo mode first
3. Verify credentials are correct
4. Check browser console for errors

## Next Steps

1. ✅ Choose SMS provider
2. ✅ Create account and get credentials
3. ✅ Update SMS_CONFIG in script.js
4. ✅ Test with small credits
5. ✅ Deploy to production
6. ✅ Monitor delivery rates

Your customers will now receive real SMS notifications for their purchases!
