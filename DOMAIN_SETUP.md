# Custom Domain Setup Guide - seeldatabundle.me

## Connect Your Domain to Vercel

### Step 1: Add Domain in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your **seel-data-bundle** project
3. Go to **Settings** → **Domains**
4. Click **"Add"** button
5. Enter: `seeldatabundle.me`
6. Click **"Add"**
7. Also add: `www.seeldatabundle.me`

### Step 2: Update DNS Records (Namecheap)

Since your domain is on Namecheap, you need to update DNS settings:

1. **Login to Namecheap**: https://www.namecheap.com/myaccount/login
2. Go to **Domain List** → Click **Manage** next to seeldatabundle.me
3. Go to **Advanced DNS** tab
4. **Delete** any existing A Records or CNAME Records pointing to other servers

### Step 3: Add Vercel DNS Records

Add these records in Namecheap Advanced DNS:

**For Root Domain (seeldatabundle.me):**
- **Type:** A Record
- **Host:** @
- **Value:** `76.76.21.21`
- **TTL:** Automatic

**For WWW Subdomain:**
- **Type:** CNAME Record
- **Host:** www
- **Value:** `cname.vercel-dns.com.`
- **TTL:** Automatic

### Step 4: Wait for DNS Propagation

- DNS changes take **5-48 hours** to propagate worldwide
- Usually works within **1-2 hours**
- Check status at: https://www.whatsmydns.net/#A/seeldatabundle.me

### Step 5: Verify in Vercel

Once DNS propagates:
1. Go back to Vercel → Settings → Domains
2. You'll see ✅ next to your domains when they're connected
3. Vercel will automatically issue SSL certificate (HTTPS)

### Step 6: Set Primary Domain (Optional)

In Vercel Domains settings:
- Click the **⋮** menu next to `seeldatabundle.me`
- Select **"Set as Primary"**
- This redirects all traffic to your custom domain

---

## Alternative: Use Namecheap Nameservers (Easier)

If the above doesn't work, use Vercel nameservers:

1. In Vercel → Settings → Domains → Click your domain
2. Select **"Use Vercel Nameservers"**
3. Copy the nameservers provided (e.g., `ns1.vercel-dns.com`)
4. Go to Namecheap → Domain List → Manage → Nameservers
5. Select **"Custom DNS"**
6. Paste Vercel nameservers
7. Save

This method is more reliable but takes longer (24-48 hours).

---

## Current Status:
- ✅ Vercel deployment ready
- ⏳ Waiting for DNS setup
- 🌐 Temporary URL: https://seel-data-bundle.vercel.app
