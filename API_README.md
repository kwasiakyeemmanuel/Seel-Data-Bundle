# Seel Data Bundle - Backend API

This project uses Vercel Serverless Functions for secure backend operations.

## Environment Variables

Create a `.env` file in the root directory (this file is gitignored and won't be uploaded):

```
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel Dashboard:
- Go to https://vercel.com/dashboard
- Select your project
- Go to Settings → Environment Variables
- Add:
  - `ADMIN_USERNAME` = your_admin_username
  - `ADMIN_PASSWORD` = your_secure_password

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

## API Endpoints

### POST /api/admin-login
Authenticates admin user

**Request:**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "session_token",
  "message": "Login successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

## Local Development

1. Install Vercel CLI
2. Run: `vercel dev`
3. Access at: http://localhost:3000
