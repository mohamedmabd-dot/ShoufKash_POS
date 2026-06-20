let currentInput = "";
// Pointing to your live, green Render cloud server URL
let serverUrl = "https://shoufkash-pos.onrender.com"; 
const soundFeedback = new Audio('payment_success.wav');

// Handles the numeric keypad grid entries natively
function pressKey(key) {
    if (key === 'C') {
        currentInput = "";
    } else {
        if (currentInput === "0") currentInput = "";
        currentInput += key;
    }
    document.getElementById('priceDisplay').innerText = (currentInput || "0") + " MRU";
}

// Connects to your live Render server to check subscription validity
function connectToCloudServer() {
    const phone = document.getElementById('phoneInput').value;
    if(!phone || phone.trim() === "") return alert("Please enter a valid merchant phone number.");

    document.getElementById('subBanner').innerText = "Validating licenses...";
    
    fetch(`${serverUrl}/api/auth/check-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "ACTIVE" || data.status === "TRIAL") {
            document.getElementById('merchantName').value = data.businessName;
            document.getElementById('subBanner').innerText = `${data.businessName} • ${data.status}`;
            document.getElementById('authScreen').style.display = "none";
            document.getElementById('posWorkspace').style.display = "flex";
        } else {
            alert(`SaaS terminal blocked. Reason: Subscription status is ${data.status}`);
            document.getElementById('subBanner').innerText = "Access Denied";
        }
    })
    .catch(err => {
        console.log("Offline bypass safety mode activated:", err);
        alert("Connecting in Local Developer Mode...");
        document.getElementById('subBanner').innerText = "Local Terminal Mode";
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('posWorkspace').style.display = "flex";
    });
}

// Generates the QR Code canvas payload natively on the phone screen
function generateQR() {
    const amount = currentInput;
    const qrContainer = document.getElementById('qrcodeField');
    const notice = document.getElementById('qrNotice');
    
    if(!amount || parseFloat(amount) <= 0) return alert("Please select a price value using the numeric layout first.");
    
    notice.style.display = "none";
    qrContainer.innerHTML = "";
    
    // Embedding Bankily standard payment schema structure
    const targetPayload = `bankily://pay?merchant=44112233&amount=${amount}`;
    
    new QRCode(qrContainer, {
        text: targetPayload,
        width: 170,
        height: 170,
        colorDark : "#111827",
        colorLight : "#ffffff"
    });
}

// Logs transaction metrics and instantly blasts custom sound feedback
function clearAndPlayAudio() {
    if(!currentInput || parseFloat(currentInput) <= 0) return alert("No active transaction payload found.");
    
    // Play the cash register success sound instantly on the phone speaker
    soundFeedback.play().catch(e => console.log("Audio playing error:", e));
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const logItem = {
        amount: parseFloat(currentInput),
        time: timeString
    };
    
    let logs = JSON.parse(localStorage.getItem('saas_logs')) || [];
    logs.unshift(logItem);
    localStorage.setItem('saas_logs', JSON.stringify(logs));
    
    // Reset terminal layout state for next retail checkout
    currentInput = "";
    document.getElementById('priceDisplay').innerText = "0 MRU";
    document.getElementById('qrcodeField').innerHTML = "";
    document.getElementById('qrNotice').style.display = "block";
    
    renderJournal();
}

// Dynamically builds journal data table and sums total revenue earned today
function renderJournal() {
    const body = document.getElementById('journalBody');
    const revenueMetric = document.getElementById('revenueMetric');
    const countMetric = document.getElementById('countMetric');
    
    let logs = JSON.parse(localStorage.getItem('saas_logs')) || [];
    body.innerHTML = "";
    let total = 0;
    
    if(logs.length === 0) {
        body.innerHTML = `<tr><td colspan="3" align="center" style="color:#9ca3af; padding:15px; font-size:12px;">Journal empty</td></tr>`;
        revenueMetric.innerText = "0.00 MRU";
        countMetric.innerText = "0 Sales";
        return;
    }
    
    logs.forEach(x => {
        total += x.amount;
        const r = document.createElement('tr');
        r.innerHTML = `
            <td style="padding:10px 8px; color:#6b7280;">${x.time}</td>
            <td style="padding:10px 8px;"><span class="badge">BANKILY</span></td>
            <td style="padding:10px 8px;" align="right"><strong>${x.amount.toFixed(2)} MRU</strong></td>
        `;
        body.appendChild(r);
    });
    
    revenueMetric.innerText = total.toFixed(2) + " MRU";
    countMetric.innerText = `${logs.length} Sales`;
}

// Simple layout history erase trigger
function clearDailyLog() {
    if(confirm("Are you sure you want to wipe today's transaction log?")) {
        localStorage.removeItem('saas_logs');
        renderJournal();
    }
}

window.onload = renderJournal;
