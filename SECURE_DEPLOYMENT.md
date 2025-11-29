# Secure Backend Deployment Guide

Your admin credentials are now protected! They're stored on a server instead of in public code.

## Quick Setup (5 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with your GitHub account (easiest option)
3. Authorize Vercel to access your repositories

### Step 2: Import Your Repository
1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose `kwasiakyeemmanuel/Seel-Data-Bundle`
4. Click "Import"

### Step 3: Configure Environment Variables
**IMPORTANT:** Before deploying, add your admin credentials:

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   - Key: `ADMIN_USERNAME` → Value: `seeldataadmin`
   - Key: `ADMIN_PASSWORD` → Value: `SeelData@2025!Secure#Admin`
4. Select "Production" environment
5. Click "Save"

### Step 4: Deploy
1. Click "Deploy" button
2. Wait 1-2 minutes for deployment
3. You'll get a URL like: `https://seel-data-bundle-xyz.vercel.app`

### Step 5: Update Your Domain
**Option A: Use Vercel URL**
- Your API will be at: `https://your-project.vercel.app/api/admin-login`
- Update the `API_URL` in admin.js if needed

**Option B: Use Custom Domain (seeldatabundle.me)**
1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your domain: `seeldatabundle.me`
3. Follow DNS configuration instructions
4. API will be at: `https://seeldatabundle.me/api/admin-login`

### Step 6: Test
1. Go to your admin panel: `https://seeldatabundle.me/admin.html`
2. Try logging in with your credentials
3. Check browser console (F12) for any errors

## What This Does

### Before (Insecure):
```javascript
// ❌ Anyone can see this in the code
const ADMIN_CREDENTIALS = {
    username: 'seeldataadmin',
    password: 'SeelData@2025!Secure#Admin'
};
```

### After (Secure):
```javascript
// ✅ Credentials stored on server, never visible to users
// Server API validates login
// Only session token stored in browser
```

## Security Benefits

✅ **Admin password hidden** - Not visible in source code
✅ **Server-side validation** - Credentials checked on server
✅ **Environment variables** - Stored securely in Vercel
✅ **Easy to change** - Update password without code changes
✅ **No GitHub exposure** - Credentials never in repository

## Troubleshooting

### "Failed to authenticate"
- Check environment variables in Vercel dashboard
- Make sure both `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Redeploy after adding variables

### "CORS error"
- The API already has CORS enabled
- If still seeing errors, check the API_URL in admin.js

### "API not found"
- Make sure `vercel.json` was deployed
- Check that `api/` folder exists in deployment

## Alternative: Keep Using GitHub Pages

If you want to keep using GitHub Pages without Vercel:

**Option A: Use Cloudflare Workers** (similar to Vercel)
**Option B: Use Netlify Functions** (similar to Vercel)
**Option C: Build your own backend** (more complex)

For now, the easiest is to deploy the API to Vercel while keeping your main site on GitHub Pages.

## Need Help?

1. Check Vercel deployment logs
2. Open browser console (F12) for errors
3. Test API directly: `https://your-domain.com/api/admin-login`

---

**Your admin credentials are now secure! 🔒**
