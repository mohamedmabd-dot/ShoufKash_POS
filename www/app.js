```javascript
let currentInput = "";
let serverUrl = "https://onrender.com"; 
const soundFeedback = new Audio('payment_success.wav');
let currentLang = "en";

// Translation dictionary for English, Arabic, French, and Chinese
const translations = {
    en: {
        title: "ShoufKash POS", sub: "Digital POS Terminal", activationTitle: "SaaS Activation Screen",
        phoneField: "ENTER MERCHANT REGISTERED PHONE", activationBtn: "🔓 Activate Terminal Session",
        qrNotice: "Use the integrated calculator above and tap 'QR' to render payment link.",
        confirmBtn: "✅ Confirm Payment Received", revToday: "Revenue Today", sales: "Sales", sale: "Sale",
        journalTitle: "TRANSACTION HISTORY JOURNAL", thTime: "Time", thApp: "App", thValue: "Value",
        emptyJournal: "Journal empty", valid: "Validating licenses...", mru: "MRU"
    },
    ar: {
        title: "شوف كاش POS", sub: "محطة الدفع الرقمية", activationTitle: "شاشة تفعيل النظام (SaaS)",
        phoneField: "أدخل رقم الهاتف المسجل للتاجر", activationBtn: "🔓 تفعيل جلسة الدفع",
        qrNotice: "استخدم الآلة الحاسبة أعلاه واضغط على 'QR' لإنشاء رمز الدفع.",
        confirmBtn: "✅ تأكيد استلام المبلغ", revToday: "إجمالي مدخولات اليوم", sales: "عمليات", sale: "عملية",
        journalTitle: "سجل العمليات اليومية", thTime: "الوقت", thApp: "التطبيق", thValue: "المبلغ",
        emptyJournal: "السجل فارغ حالياً", valid: "جاري التحقق من الاشتراك...", mru: "أوقية"
    },
    fr: {
        title: "ShoufKash POS", sub: "Terminal POS Numérique", activationTitle: "Écran d'Activation SaaS",
        phoneField: "ENTRER LE TÉLÉPHONE DU COMMERÇANT", activationBtn: "🔓 Activer la Session Terminal",
        qrNotice: "Utilisez le calculateur ci-dessus et appuyez sur 'QR' pour générer le paiement.",
        confirmBtn: "✅ Confirmer le Paiement Reçu", revToday: "Revenu d'Aujourd'hui", sales: "Ventes", sale: "Vente",
        journalTitle: "JOURNAL DE L'HISTORIQUE", thTime: "Heure", thApp: "App", thValue: "Valeur",
        emptyJournal: "Journal vide", valid: "Validation des licences...", mru: "MRU"
    },
    zh: {
        title: "ShoufKash 智能收银", sub: "数字POS终端平台", activationTitle: "SaaS 系统激活界面",
        phoneField: "请输入商户注册的手机号码", activationBtn: "🔓 激活收银终端系统",
        qrNotice: "请使用上方数字键盘输入金额，然后点击 'QR' 生成收款码。",
        confirmBtn: "✅ 确认已收到账款", revToday: "今日总营业额", sales: "笔交易", sale: "笔交易",
        journalTitle: "每日交易流水历史账本", thTime: "时间", thApp: "支付应用", thValue: "金额",
        emptyJournal: "暂无交易流水记录", valid: "正在云端验证系统授权...", mru: "乌吉亚"
    }
};

function changeLanguage(lang) {
    currentLang = lang;
    
    // Toggle button active visual states
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    const t = translations[lang];
    const container = document.getElementById('mainContainer');
    
    // Apply Right-to-Left formatting for Arabic interface alignment
    if (lang === 'ar') {
        container.classList.add('rtl');
    } else {
        container.classList.remove('rtl');
    }
    
    // Update all text fields dynamically
    document.getElementById('titleBanner').innerText = t.title;
    if(document.getElementById('subBanner').innerText.indexOf("•") === -1) {
        document.getElementById('subBanner').innerText = t.sub;
    }
    document.getElementById('lbl-activationTitle').innerText = t.activationTitle;
    document.getElementById('lbl-phoneField').innerText = t.phoneField;
    document.getElementById('lbl-activationBtn').innerText = t.activationBtn;
    document.getElementById('qrNotice').innerText = t.qrNotice;
    document.getElementById('lbl-confirmBtn').innerText = t.confirmBtn;
    document.getElementById('lbl-revToday').innerText = t.revToday;
    document.getElementById('lbl-journalTitle').innerText = t.journalTitle;
    document.getElementById('lbl-thTime').innerText = t.thTime;
    document.getElementById('lbl-thApp').innerText = t.thApp;
    document.getElementById('lbl-thValue').innerText = t.thValue;
    
    document.getElementById('priceDisplay').innerText = (currentInput || "0") + " " + t.mru;
    renderJournal();
}

function pressKey(key) {
    if (key === 'C') { currentInput = ""; } 
    else {
        if (currentInput === "0") currentInput = "";
        currentInput += key;
    }
    document.getElementById('priceDisplay').innerText = (currentInput || "0") + " " + translations[currentLang].mru;
}

function connectToCloudServer() {
    const phone = document.getElementById('phoneInput').value;
    if(!phone || phone.trim() === "") return alert("Please enter phone connection context.");

    document.getElementById('subBanner').innerText = translations[currentLang].valid;
    
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
            alert(`SaaS blocked: ${data.status}`);
            document.getElementById('subBanner').innerText = "Access Denied";
        }
    })
    .catch(err => {
        document.getElementById('subBanner').innerText = currentLang === 'ar' ? "وضع التشغيل المحلي" : "Local Terminal Mode";
        document.getElementById('authScreen').style.display = "none";
        document.getElementById('posWorkspace').style.display = "flex";
    });
}

function generateQR() {
    const amount = currentInput;
    const qrContainer = document.getElementById('qrcodeField');
    const notice = document.getElementById('qrNotice');
    
    if(!amount || parseFloat(amount) <= 0) return alert("Please enter amount first.");
    
    notice.style.display = "none";
    qrContainer.innerHTML = "";
    
    const targetPayload = `bankily://pay?merchant=44112233&amount=${amount}`;
    
    new QRCode(qrContainer, {
        text: targetPayload,
        width: 170,
        height: 170,
        colorDark : "#111827",
        colorLight : "#ffffff"
    });
}

function clearAndPlayAudio() {
    if(!currentInput || parseFloat(currentInput) <= 0) return;
    
    soundFeedback.play().catch(e => console.log("Audio playing offline"));
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const logItem = { amount: parseFloat(currentInput), time: timeString };
    let logs = JSON.parse(localStorage.getItem('saas_logs')) || [];
    logs.unshift(logItem);
    localStorage.setItem('saas_logs', JSON.stringify(logs));
    
    currentInput = "";
    document.getElementById('priceDisplay').innerText = "0 " + translations[currentLang].mru;
    document.getElementById('qrcodeField').innerHTML = "";
    document.getElementById('qrNotice').style.display = "block";
    
    renderJournal();
}

function renderJournal() {
    const body = document.getElementById('journalBody');
    const revenueMetric = document.getElementById('revenueMetric');
    const countMetric = document.getElementById('countMetric');
    const t = translations[currentLang];
    
    let logs = JSON.parse(localStorage.getItem('saas_logs')) || [];
    body.innerHTML = "";
    let total = 0;
    
    if(logs.length === 0) {
        body.innerHTML = `<tr><td colspan="3" align="center" style="color:#9ca3af; padding:15px; font-size:12px;">${t.emptyJournal}</td></tr>`;
        revenueMetric.innerText = "0.00 " + t.mru;
        countMetric.innerText = "0 " + (currentLang === 'zh' ? t.sales : t.sale);
        return;
    }
    
    logs.forEach(x => {
        total += x.amount;
        const r = document.createElement('tr');
        r.innerHTML = `
            <td style="padding:10px 8px; color:#6b7280;">${x.time}</td>
            <td style="padding:10px 8px;"><span class="badge">BANKILY</span></td>
            <td style="padding:10px 8px;" align="${currentLang === 'ar' ? 'left' : 'right'}"><strong>${x.amount.toFixed(2)} ${t.mru}</strong></td>
        `;
        body.appendChild(r);
    });
    
    revenueMetric.innerText = total.toFixed(2) + " " + t.mru;
    const suffix = logs.length === 1 && currentLang !== 'zh' ? t.sale : t.sales;
    countMetric.innerText = `${logs.length} ${suffix}`;
}

function clearDailyLog() {
    if(confirm("Wipe log?")) { localStorage.removeItem('saas_logs'); renderJournal(); }
}

window.onload = function() { renderJournal(); };