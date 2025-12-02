// Simple test endpoint to verify Vercel deployment
export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    return res.status(200).json({
        success: true,
        message: 'API is working!',
        method: req.method,
        timestamp: new Date().toISOString()
    });
}
