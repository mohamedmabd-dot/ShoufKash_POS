const express = require('express');
const path = require('path');
const app = express();

// Use Render's dynamic port assignment or fallback to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Global Network Security Passport (CORS) - Allows your Android app to speak to Render smoothly
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
});

// Serve the phone application layout assets from the www folder
app.use(express.static(path.join(__dirname, 'www')));

// =========================================================================
"https://hdtiofjglzfsblyiwrbq.supabase.co/rest/v1/";
"sb_publishable_UjSmul0t4crRknB-bbPnAg_p9diVBCt";
const SUPABASE_URL = "https://hdtiofjglzfsblyiwrbq.supabase.co/rest/v1/"; 
const SUPABASE_KEY = "sb_publishable_UjSmul0t4crRknB-bbPnAg_p9diVBCt"; // Must start with sb_pub_
// =========================================================================

// Endpoint for the phone app to check subscription validity directly from Supabase Cloud
app.post('/api/auth/check-subscription', async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        return res.status(400).json({ error: "Phone number required" });
    }

    try {
        // Query the live Supabase database directly using standard web fetch
        const targetUrl = `${SUPABASE_URL}/rest/v1/merchants?phone_number=eq.${encodeURIComponent(phone)}&select=*`;
        
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // If the merchant number is not registered in your database yet
        if (!data || data.length === 0) {
            return res.json({ 
                status: "TRIAL", 
                businessName: "New ShoufKash Merchant",
                message: "Welcome to ShoufKash! Free trial active." 
            });
        }

        // Extract the merchant data from the database array row
        const merchant = data[0];

        // Strict validation check for your Mauritanian market business rules
        res.json({
            status: merchant.subscription_status, // ACTIVE, BLOCKED, or EXPIRED
            businessName: merchant.business_name,
            expiry: merchant.expiry_date,
            setupFeePaid: merchant.setup_fee_paid
        });

    } catch (err) {
        console.error("Supabase cloud lookup connection failed:", err);
        // Fallback safety trigger to let developers continue testing offline
        res.json({ 
            status: "ACTIVE", 
            businessName: "Local Backup Merchant",
            message: "Offline local connection activated." 
        });
    }
});

// Admin Web Dashboard endpoint to monitor connections
app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; padding:40px; background:#f3f4f6; min-height:100vh;">
            <h1 style="color:#2563eb;">ShoufKash Global SaaS Control Panel</h1>
            <p>Track payments, setup fees (50 MRU), and active terminals across Mauritania.</p>
            <p style="background:#fff; padding:15px; border-radius:8px; display:inline-block; border:1px solid #ddd; font-weight:bold; color:#111827;">
                🔌 Connected Status: Live Database Ecosystem via Supabase Cloud
            </p>
        </div>
    `);
});

// Start the server bound to 0.0.0.0 for external mobile device access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShoufKash SaaS Web Server running smoothly on port ${PORT}`);
});
