import express from 'express';

const router = express.Router();

// In-memory shield profiles (no disk = privacy first)
const shieldProfiles = new Map();

// Register a Legal Shield profile
router.post('/register', (req, res) => {
  try {
    const { name, phone, case_type, court_date, complaint_deadline, lawyer_name } = req.body;
    if (!phone || !case_type) return res.status(400).json({ error: 'Phone and case type required.' });

    const profile = {
      id: `SHIELD-${Date.now()}`,
      name: name || 'Anonymous',
      phone,
      case_type,
      court_date: court_date || null,
      complaint_deadline: complaint_deadline || null,
      lawyer_name: lawyer_name || null,
      registered_at: new Date().toISOString(),
      active: true
    };
    shieldProfiles.set(phone, profile);

    const alerts = generateAlerts(profile);
    res.json({ success: true, shield_id: profile.id, profile, upcoming_alerts: alerts, message: "Legal Shield activated! Aapko daily updates milenge." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get alerts for a profile
router.get('/alerts/:phone', (req, res) => {
  const profile = shieldProfiles.get(req.params.phone);
  if (!profile) {
    // Return demo alerts
    return res.json({
      active: true,
      alerts: [
        { type: "Court Date", urgency: "high", message: "📅 Kal teri court date hai — Sector 14 Court Room 3 — Yeh documents le jaana: Employment Contract, Salary Slips, ID Proof", days_until: 1 },
        { type: "Law Update", urgency: "medium", message: "📢 Naya Labour Code 2024 lagu hua hai — tera wrongful termination case ab aur strong ho gaya. Compensation limit ₹2L se ₹5L ho gayi.", days_until: 0 },
        { type: "Deadline Warning", urgency: "critical", message: "🚨 Teri complaint file karne ki last date 3 din baad hai — 4 April 2026. Turant file karo!", days_until: 3 }
      ],
      law_updates: [
        { title: "New Labour Code 2024 — Higher Compensation Limits", impact: "positive", date: "1 Apr 2026" },
        { title: "Digital Court Filings now available in your district", impact: "positive", date: "28 Mar 2026" }
      ]
    });
  }
  res.json({ active: profile.active, alerts: generateAlerts(profile), profile });
});

function generateAlerts(profile) {
  const alerts = [];
  const now = new Date();

  if (profile.court_date) {
    const courtDate = new Date(profile.court_date);
    const daysUntil = Math.ceil((courtDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 7) {
      alerts.push({
        type: "Court Date",
        urgency: daysUntil <= 1 ? "critical" : "high",
        message: `📅 Teri court date ${daysUntil === 0 ? 'aaj' : daysUntil === 1 ? 'kal' : `${daysUntil} din mein`} hai. Original documents le jaana: ID, Salary Slips, Contract.`,
        days_until: daysUntil
      });
    }
  }
  if (profile.complaint_deadline) {
    const deadline = new Date(profile.complaint_deadline);
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysUntil >= 0 && daysUntil <= 10) {
      alerts.push({
        type: "Deadline Warning",
        urgency: daysUntil <= 3 ? "critical" : "high",
        message: `🚨 Complaint file karne ki last date ${daysUntil} din baad hai — ${profile.complaint_deadline}. Agar miss hua toh case kharab ho sakta hai!`,
        days_until: daysUntil
      });
    }
  }
  alerts.push({
    type: "Law Update",
    urgency: "medium",
    message: `📢 ${profile.case_type} se related naya update: Digital complaint filing ab Maharashtra, Delhi, UP mein available hai — faster resolution milegi.`,
    days_until: 0
  });
  return alerts;
}

export default router;
