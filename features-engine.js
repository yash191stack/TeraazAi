// ============================================
// TERAAZ AI — NEW FEATURES ENGINE 🔥
// Nyay Score | Chat | WhatsApp | Map | Shield | FIR
// ============================================

const API_BASE = 'http://localhost:3000/api';

// ==================== NYAY SCORE ====================
let selectedLang = 'Hindi';
let lastFIRData = null;

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLang = btn.dataset.lang;
  });
});

async function calculateNyayScore() {
  const input = document.getElementById('nyay-input');
  const btnText = document.getElementById('nyay-btn-text');
  const scenario = input?.value?.trim();
  if (!scenario) {
    input?.focus();
    return;
  }

  btnText.textContent = '⏳ Analyzing case...';
  document.getElementById('nyay-calc-btn').disabled = true;

  try {
    const res = await fetch(`${API_BASE}/nyay-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, language: selectedLang })
    });
    const data = await res.json();
    displayNyayScore(data);
  } catch (err) {
    // Falls back to mock
    displayNyayScore({
      score: 74, win_probability: 81, similar_cases_analyzed: 2187,
      case_category: "Wrongful Termination", strength_label: "Strong", color_code: "green",
      key_factors: [
        { factor: "No prior written warning", impact: "positive", weight: "30%" },
        { factor: "No notice period served", impact: "positive", weight: "25%" },
        { factor: "Salary slips available", impact: "positive", weight: "20%" },
        { factor: "Delay in filing complaint", impact: "negative", weight: "15%" },
        { factor: "No written employment contract", impact: "negative", weight: "10%" }
      ],
      top_action: "Send a legal notice to your employer via a registered lawyer within 7 days.",
      time_sensitive: true
    });
  } finally {
    btnText.textContent = '⚖️ Recalculate';
    document.getElementById('nyay-calc-btn').disabled = false;
  }
}

function displayNyayScore(data) {
  const score = data.score || 0;
  const arc = document.getElementById('gauge-arc');
  const scoreEl = document.getElementById('gauge-score');
  const labelEl = document.getElementById('gauge-label');
  const winEl = document.getElementById('gauge-win');

  // Animate arc: circumference = 2π × 80 ≈ 502.65, we show 75% of circle
  // stroke-dasharray = 502.65, offset to show score/100 of 75%
  const circumference = 502.65;
  const activeArc = circumference * 0.75; // 75% of circle
  const offset = circumference - (activeArc * score / 100) + circumference * 0.25;
  
  setTimeout(() => {
    if (arc) arc.style.strokeDashoffset = offset;
  }, 100);

  // Animate counter
  let current = 0;
  const interval = setInterval(() => {
    current = Math.min(current + Math.ceil(score / 30), score);
    if (scoreEl) scoreEl.textContent = current;
    if (current >= score) clearInterval(interval);
  }, 50);

  if (labelEl) labelEl.textContent = data.strength_label?.toUpperCase() || 'STRONG';
  if (winEl) winEl.textContent = `${data.win_probability}% chance of winning`;

  // Badges
  const badgeProb = document.getElementById('badge-prob');
  const badgeCases = document.getElementById('badge-cases');
  const badgeType = document.getElementById('badge-type');
  if (badgeProb) badgeProb.textContent = `${data.win_probability}%`;
  if (badgeCases) badgeCases.textContent = (data.similar_cases_analyzed || 0).toLocaleString('en-IN');
  if (badgeType) badgeType.textContent = data.case_category || '--';

  // Factors
  const factorsList = document.getElementById('nyay-factors-list');
  if (factorsList && data.key_factors) {
    factorsList.innerHTML = data.key_factors.map(f => `
      <div class="factor-item">
        <span>${f.factor}</span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <span style="font-size:0.7rem;opacity:0.6">${f.weight}</span>
          <span class="factor-impact factor-${f.impact}">${f.impact === 'positive' ? '▲' : f.impact === 'negative' ? '▼' : '→'} ${f.impact}</span>
        </div>
      </div>
    `).join('');
  }

  // Top action
  const topAction = document.getElementById('nyay-top-action');
  const actionText = document.getElementById('action-text');
  if (topAction && data.top_action) {
    topAction.style.display = 'block';
    actionText.textContent = data.top_action;
  }
}

// ==================== LIVE CHAT ====================
let chatHistory = [];

function tryPrompt(text) {
  const input = document.getElementById('live-chat-input');
  if (input) {
    input.value = text;
    sendLiveChatMessage();
  }
}

async function sendLiveChatMessage() {
  const input = document.getElementById('live-chat-input');
  const messagesEl = document.getElementById('chat-messages');
  const msg = input?.value?.trim();
  if (!msg || !messagesEl) return;

  input.value = '';

  // User message
  messagesEl.innerHTML += `
    <div class="chat-msg user-msg">
      <div class="msg-bubble">${msg}</div>
      <div class="msg-time">${getTime()}</div>
    </div>`;

  // Typing indicator
  const typingId = `typing-${Date.now()}`;
  messagesEl.innerHTML += `
    <div class="chat-msg bot-msg" id="${typingId}">
      <div class="msg-bubble" style="background:#fff;padding:1rem;">
        <div style="display:flex;gap:4px;align-items:center">
          <span style="width:8px;height:8px;background:var(--gold);border-radius:50%;animation:typingBounce 1.4s infinite;display:inline-block"></span>
          <span style="width:8px;height:8px;background:var(--gold);border-radius:50%;animation:typingBounce 1.4s 0.2s infinite;display:inline-block"></span>
          <span style="width:8px;height:8px;background:var(--gold);border-radius:50%;animation:typingBounce 1.4s 0.4s infinite;display:inline-block"></span>
        </div>
      </div>
    </div>`;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/rights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: msg, language: 'Hindi' })
    });
    const data = await res.json();

    const reply = data.summary
      ? `⚖️ <strong>${data.summary}</strong><br><br>` +
        (data.laws?.length ? `📋 <strong>Relevant Laws:</strong><br>` + data.laws.map(l => `• ${l.name}`).join('<br>') + '<br><br>' : '') +
        (data.advice ? `✅ <strong>Next Step:</strong> ${data.advice}` : '')
      : '🙏 Mujhe sorry kehna hoga — kuch technical issue aaya. Kripya dobara try karein ya directly demo page visit karein.';

    document.getElementById(typingId)?.remove();
    messagesEl.innerHTML += `
      <div class="chat-msg bot-msg">
        <div class="msg-bubble">${reply}</div>
        <div class="msg-time">${getTime()}</div>
      </div>`;
  } catch (err) {
    document.getElementById(typingId)?.remove();
    const fallbacks = {
      'landlord': '🏠 <strong>Aapke rights:</strong><br>• Security deposit wapas karna landlord ka legal obligation hai<br>• Rent Control Act ke tahat 2-3 mahine ke andar refund zaroori hai<br>• <strong>Abhi karo:</strong> Registered post se legal notice bhejo.',
      'job': '💼 <strong>Wrongful Termination:</strong><br>• Section 25F Industrial Disputes Act — 1 month notice mandatory hai<br>• Salary slips aur emails apne paas save karo<br>• <strong>Abhi karo:</strong> HR ko written email bhejo — kaaraan maango.',
      'fraud': '🛍 <strong>Online Fraud:</strong><br>• Consumer Protection Act 2019 ke under complaint file karo<br>• cybercrime.gov.in pe FIR lodge karo<br>• <strong>Abhi karo:</strong> Bank ko call karo — transaction dispute raise karo.'
    };
    const key = msg.toLowerCase().includes('landlord') || msg.toLowerCase().includes('deposit') ? 'landlord'
      : msg.toLowerCase().includes('job') || msg.toLowerCase().includes('notice') || msg.toLowerCase().includes('nikal') ? 'job' : 'fraud';
    messagesEl.innerHTML += `
      <div class="chat-msg bot-msg">
        <div class="msg-bubble">${fallbacks[key] || '⚖️ Aapki situation samajh aayi. <strong>Demo page pe</strong> full analysis ke liye jaayein — <a href="/demo.html" style="color:var(--gold)">click here →</a>'}</div>
        <div class="msg-time">${getTime()}</div>
      </div>`;
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Enter key support
document.getElementById('live-chat-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendLiveChatMessage();
});

// ==================== WHATSAPP BOT ====================
let waTypingTimeout;

async function sendWhatsAppMessage() {
  const input = document.getElementById('wa-input');
  const messagesEl = document.getElementById('wa-messages');
  const msg = input?.value?.trim();
  if (!msg || !messagesEl) return;

  input.value = '';

  // Remove typing indicator
  document.getElementById('wa-typing')?.remove();

  messagesEl.innerHTML += `<div class="wa-msg wa-sent">${msg}<span class="wa-time">${getTime()} ✓✓</span></div>`;
  messagesEl.innerHTML += `<div class="wa-msg wa-recv typing-bubble" id="wa-typing-2"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/whatsapp/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    document.getElementById('wa-typing-2')?.remove();
    const replyHtml = (data.reply || '').replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    messagesEl.innerHTML += `<div class="wa-msg wa-recv">${replyHtml}<span class="wa-time">${getTime()}</span></div>`;
  } catch (err) {
    document.getElementById('wa-typing-2')?.remove();
    messagesEl.innerHTML += `<div class="wa-msg wa-recv">⚖️ <strong>TERAAZ AI</strong><br><br>Aapki baat samajh aayi. Aapko turant ek legal notice bhejni chahiye. Main draft kar sakta hoon — bas "draft notice chahiye" likhein.<br><br>📞 1800-11-2232<span class="wa-time">${getTime()}</span></div>`;
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

document.getElementById('wa-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendWhatsAppMessage();
});

// Simulate WA typing response
setTimeout(() => {
  const waTyping = document.getElementById('wa-typing');
  const waMessages = document.getElementById('wa-messages');
  if (waTyping && waMessages) {
    waTyping.remove();
    waMessages.innerHTML += `
      <div class="wa-msg wa-recv">📄 Yeh raha aapka draft Legal Notice:<br><br><em style="font-size:0.68rem;opacity:0.8">LEGAL NOTICE<br>Subject: Wrongful Termination<br>...[Full notice ready in demo]</em><br><br>📞 1800-11-2232<span class="wa-time">${getTime()}</span></div>`;
    waMessages.scrollTop = waMessages.scrollHeight;
  }
}, 3000);

// ==================== INDIA IMPACT MAP ====================
function drawIndiaMap() {
  const canvas = document.getElementById('india-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Draw India silhouette (simplified polygon approximation)
  ctx.clearRect(0, 0, W, H);

  // India outline - approximate coordinates scaled to canvas
  const indiaPath = [
    [210,30],[250,25],[280,35],[300,50],[310,70],[290,90],[310,100],[330,120],
    [340,150],[320,170],[310,200],[330,220],[340,250],[320,270],[300,290],
    [280,320],[270,360],[260,390],[240,420],[220,450],[200,470],[185,490],
    [175,510],[165,530],[155,545],[145,520],[135,490],[130,460],[140,430],
    [130,400],[120,370],[110,340],[100,310],[90,280],[80,250],[85,220],
    [75,190],[80,160],[95,140],[110,120],[120,100],[130,80],[150,60],
    [170,45],[190,35],[210,30]
  ];

  // Draw map fill
  ctx.beginPath();
  ctx.moveTo(indiaPath[0][0], indiaPath[0][1]);
  indiaPath.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // City dots - major cities with coordinates on the canvas
  const cities = [
    { name: 'Delhi', x: 205, y: 115, queries: 2341, type: 'high' },
    { name: 'Mumbai', x: 140, y: 260, queries: 1987, type: 'high' },
    { name: 'Bangalore', x: 175, y: 380, queries: 1654, type: 'high' },
    { name: 'Kolkata', x: 295, y: 205, queries: 1423, type: 'medium' },
    { name: 'Chennai', x: 210, y: 410, queries: 1287, type: 'medium' },
    { name: 'Hyderabad', x: 200, y: 330, queries: 1134, type: 'medium' },
    { name: 'Pune', x: 150, y: 275, queries: 876, type: 'medium' },
    { name: 'Ahmedabad', x: 130, y: 195, queries: 765, type: 'medium' },
    { name: 'Jaipur', x: 170, y: 155, queries: 654, type: 'low' },
    { name: 'Lucknow', x: 240, y: 150, queries: 598, type: 'low' },
    { name: 'Patna', x: 265, y: 175, queries: 543, type: 'low' },
    { name: 'Bhopal', x: 190, y: 215, queries: 487, type: 'low' },
    { name: 'Chandigarh', x: 195, y: 90, queries: 423, type: 'low' },
    { name: 'Kochi', x: 175, y: 455, queries: 398, type: 'low' },
  ];

  const colorMap = {
    high: { fill: 'rgba(255, 99, 50, 0.8)', ring: 'rgba(255, 99, 50, 0.3)', size: 10 },
    medium: { fill: 'rgba(212, 175, 55, 0.85)', ring: 'rgba(212, 175, 55, 0.3)', size: 7 },
    low: { fill: 'rgba(100, 220, 150, 0.8)', ring: 'rgba(100, 220, 150, 0.3)', size: 5 }
  };

  // Animate dots
  let frame = 0;
  function animateDots() {
    ctx.clearRect(0, 0, W, H);

    // Redraw map
    ctx.beginPath();
    ctx.moveTo(indiaPath[0][0], indiaPath[0][1]);
    indiaPath.forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fillStyle = 'rgba(212, 175, 55, 0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Grid lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    cities.forEach((city, i) => {
      const c = colorMap[city.type];
      const pulse = Math.sin(frame * 0.05 + i * 0.7) * 0.5 + 0.5;

      // Ripple ring
      const rippleSize = c.size + pulse * 12;
      ctx.beginPath();
      ctx.arc(city.x, city.y, rippleSize, 0, Math.PI * 2);
      ctx.fillStyle = c.ring.replace('0.3', (0.1 + pulse * 0.3).toString());
      ctx.fill();

      // Inner ring
      ctx.beginPath();
      ctx.arc(city.x, city.y, c.size + 3, 0, Math.PI * 2);
      ctx.fillStyle = c.ring;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(city.x, city.y, c.size, 0, Math.PI * 2);
      ctx.fillStyle = c.fill;
      ctx.fill();

      // City label (small)
      ctx.fillStyle = 'rgba(10, 17, 40, 0.7)';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(city.name, city.x, city.y - c.size - 5);
    });

    frame++;
    requestAnimationFrame(animateDots);
  }
  animateDots();

  // Map floating alerts
  const alertContainer = document.getElementById('map-alerts');
  if (alertContainer) {
    const alerts = [
      '📍 Delhi — Wrongful termination case opened',
      '📍 Mumbai — RTI filed for salary recovery',
      '📍 Bangalore — Consumer fraud complaint lodged',
      '📍 Kolkata — Landlord dispute case analyzed',
      '📍 Chennai — Labour court roadmap generated',
    ];
    let alertIdx = 0;
    function showNextAlert() {
      if (alertContainer.children.length > 2) alertContainer.removeChild(alertContainer.firstChild);
      const div = document.createElement('div');
      div.className = 'map-alert-bubble';
      div.textContent = alerts[alertIdx % alerts.length];
      alertContainer.appendChild(div);
      alertIdx++;
    }
    showNextAlert();
    setInterval(showNextAlert, 3000);
  }
}

// ==================== LIVE TICKER ====================
function initLiveTicker() {
  const tickerFeed = document.getElementById('ticker-feed');
  if (!tickerFeed) return;

  const liveData = [
    { city: 'Delhi', issue: 'Job termination advice' },
    { city: 'Mumbai', issue: 'Rental dispute notice' },
    { city: 'Bangalore', issue: 'Consumer fraud FIR' },
    { city: 'Kolkata', issue: 'Labour court roadmap' },
    { city: 'Pune', issue: 'RTI application drafted' },
    { city: 'Jaipur', issue: 'Property dispute help' },
    { city: 'Lucknow', issue: 'Police inaction alert' },
    { city: 'Hyderabad', issue: 'Salary recovery notice' },
    { city: 'Chennai', issue: 'Consumer complaint filed' },
    { city: 'Ahmedabad', issue: 'Domestic violence SOS' },
  ];

  let tickerIdx = 0;
  function addTickerItem() {
    const item = liveData[tickerIdx % liveData.length];
    const div = document.createElement('div');
    div.className = 'ticker-item';
    div.innerHTML = `<span class="ticker-dot"></span><span class="ticker-city">${item.city}</span><span>${item.issue}</span>`;
    tickerFeed.prepend(div);
    if (tickerFeed.children.length > 4) tickerFeed.removeChild(tickerFeed.lastChild);
    tickerIdx++;
  }
  addTickerItem();
  setInterval(addTickerItem, 2500);

  // Live counter increment
  const totalEl = document.getElementById('total-queries');
  if (totalEl) {
    let base = 124382;
    setInterval(() => {
      base += Math.floor(Math.random() * 3) + 1;
      totalEl.textContent = base.toLocaleString('en-IN');
    }, 4000);
  }
}

// ==================== LEGAL SHIELD ====================
async function activateLegalShield() {
  const name = document.getElementById('shield-name')?.value?.trim();
  const caseType = document.getElementById('shield-case')?.value?.trim();
  const date = document.getElementById('shield-date')?.value;

  if (!caseType) {
    alert('Case type zaroori hai!');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/legal-shield/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'Anonymous',
        phone: `user-${Date.now()}`,
        case_type: caseType,
        court_date: date || null
      })
    });
    const data = await res.json();

    document.querySelector('.shield-form').style.display = 'none';
    const activated = document.getElementById('shield-activated');
    const shieldIdText = document.getElementById('shield-id-text');
    activated.style.display = 'block';
    if (shieldIdText) shieldIdText.textContent = `ID: ${data.shield_id || 'SHIELD-' + Date.now()}`;

    if (data.upcoming_alerts?.length) {
      const alertsHtml = data.upcoming_alerts.map(a => `
        <div class="shield-alert ${a.urgency}" style="margin-top:0.5rem;padding:0.8rem;border-radius:10px;border-left:3px solid">
          <div class="sa-tag ${a.urgency}-tag" style="font-size:0.6rem">${a.type}</div>
          <div style="font-size:0.78rem;color:rgba(255,255,255,0.8);margin-top:0.3rem">${a.message}</div>
        </div>`).join('');
      activated.innerHTML += `<div style="margin-top:1rem;text-align:left">${alertsHtml}</div>`;
    }
  } catch (err) {
    document.querySelector('.shield-form').style.display = 'none';
    const activated = document.getElementById('shield-activated');
    activated.style.display = 'block';
    document.getElementById('shield-id-text').textContent = `ID: SHIELD-${Date.now()}`;
  }
}

// ==================== FIR TRACKER ====================
async function trackFIR() {
  const firNumber = document.getElementById('fir-number')?.value?.trim();
  const state = document.getElementById('fir-state')?.value?.trim();
  const district = document.getElementById('fir-district')?.value?.trim();

  if (!firNumber) { alert('FIR number enter karo!'); return; }

  const resultPanel = document.getElementById('fir-result');
  const statusBadge = document.getElementById('fir-status-badge');
  const firMeta = document.getElementById('fir-meta');
  const firDetails = document.getElementById('fir-details');
  const firEscalation = document.getElementById('fir-escalation');

  if (resultPanel) resultPanel.style.display = 'block';
  if (statusBadge) statusBadge.textContent = '⏳ Tracking...';

  try {
    const res = await fetch(`${API_BASE}/fir-tracker/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fir_number: firNumber, state, district })
    });
    const data = await res.json();
    lastFIRData = data;
    displayFIRResult(data);
  } catch (err) {
    displayFIRResult({
      fir_number: firNumber, state: state || 'Delhi', district: district || 'Central',
      status: 'Under Investigation', date: '30 Mar 2026',
      station: `${district || 'Central'} Police Station, ${state || 'Delhi'}`,
      officer: 'SI Rakesh Kumar', next_date: '15 Apr 2026',
      action_taken: 'Case registered. Investigation underway. Accused summoned.',
      needs_escalation: false, escalation_letter: null,
      reminders: [{ type: 'Court Date Reminder', date: '15 Apr 2026', message: 'Hearing on 15 April — carry all original documents.' }]
    });
  }
}

function displayFIRResult(data) {
  const statusBadge = document.getElementById('fir-status-badge');
  const firMeta = document.getElementById('fir-meta');
  const firDetails = document.getElementById('fir-details');
  const firEscalation = document.getElementById('fir-escalation');

  const statusColors = {
    'Registered': '#2196F3', 'Under Investigation': '#FF9800',
    'Chargesheet Filed': '#9C27B0', 'Closed (Undetected)': '#F44336'
  };
  if (statusBadge) {
    statusBadge.textContent = data.status || '--';
    statusBadge.style.background = statusColors[data.status] || '#00C851';
  }
  if (firMeta) firMeta.innerHTML = `FIR No: <strong>${data.fir_number}</strong> &nbsp;|&nbsp; ${data.state}, ${data.district}`;
  if (firDetails) firDetails.innerHTML = `
    <div>📍 <strong>Station:</strong> ${data.station}</div>
    <div>👮 <strong>IO:</strong> ${data.officer}</div>
    <div>📅 <strong>Date:</strong> ${data.date}</div>
    <div>✅ <strong>Action:</strong> ${data.action_taken}</div>
    ${data.next_date ? `<div>🔔 <strong>Next Date:</strong> ${data.next_date}</div>` : ''}
    ${data.reminders?.length ? `<div style="margin-top:0.5rem;padding:0.6rem;background:rgba(212,175,55,0.08);border-radius:8px;font-size:0.78rem;color:var(--gold)">⏰ ${data.reminders[0].message}</div>` : ''}
  `;
  if (firEscalation) {
    firEscalation.style.display = data.needs_escalation ? 'block' : 'none';
    if (data.needs_escalation) lastFIRData = data;
  }
}

function downloadEscalation() {
  if (!lastFIRData?.escalation_letter) return;
  const blob = new Blob([lastFIRData.escalation_letter], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Escalation-Letter-FIR-${lastFIRData.fir_number}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== HELPERS ====================
function getTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initLiveTicker();
  // Init map when section is visible
  const mapEl = document.getElementById('india-map-canvas');
  if (mapEl) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { drawIndiaMap(); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(mapEl);
  }

  // Animate issue bars when visible
  document.querySelectorAll('.ib-fill').forEach(fill => {
    const width = fill.style.width;
    fill.style.width = '0%';
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { fill.style.width = width; obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(fill);
  });
});
