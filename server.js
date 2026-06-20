const express = require('express');
const path = require('path');
const app = express();

// Use Render's dynamic port assignment or fallback to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the phone application layout assets from the www folder
app.use(express.static(path.join(__dirname, 'www')));

// Mock Database of active merchant devices (In Phase 2, this links to a database)
const merchantSubscriptions = {
    "44112233": { status: "ACTIVE", expiry: "2026-12-31", businessName: "Taxi Nouakchott" },
    "44556677": { status: "EXPIRED", expiry: "2026-05-01", businessName: "Epicerie Center" }
};

// Endpoint for the phone app to check subscription validity
app.post('/api/auth/check-subscription', (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
    }

    const profile = merchantSubscriptions[phone];
    
    if (!profile) {
        // Automatically give a new user an active free trial day
        return res.json({ 
            status: "ACTIVE", 
            businessName: "New ShoufKash Merchant",
            message: "Welcome to ShoufKash! Free trial active." 
        });
    }
    
    res.json(profile);
});

// Admin Web Dashboard endpoint to monitor connections
app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; padding:40px; background:#f3f4f6; min-height:100vh;">
            <h1 style="color:#2563eb;">ShoufKash Global SaaS Control Panel</h1>
            <p>Track payments, setup fees (50 MRU), and active terminals across Mauritania.</p>
            <table border="1" style="width:100%; border-collapse:collapse; background:white; text-align:left;">
                <tr style="background:#111827; color:white;">
                    <th style="padding:12px;">Merchant Phone</th>
                    <th style="padding:12px;">Business Name</th>
                    <th style="padding:12px;">Status</th>
                </tr>
                <tr>
                    <td style="padding:12px;">44112233</td>
                    <td style="padding:12px;">Taxi Nouakchott</td>
                    <td style="padding:12px; color:green; font-weight:bold;">ACTIVE</td>
                </tr>
            </table>
        </div>
    `);
});

// Start the server bound to 0.0.0.0 for external mobile device access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShoufKash SaaS Web Server running smoothly on port ${PORT}`);
});
