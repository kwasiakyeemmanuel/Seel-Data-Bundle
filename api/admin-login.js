// Admin Authentication API
// This runs on the server, so credentials are never exposed to clients

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'seeldataadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SeelData@2025!Secure#Admin';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { username, password } = req.body;

    // Validate credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple session token (in production, use JWT)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return res.status(200).json({
        success: true,
        token: sessionToken,
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}
