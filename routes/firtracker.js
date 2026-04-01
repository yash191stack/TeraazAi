import express from 'express';

const router = express.Router();

// FIR Tracker — stores in memory (no disk, privacy-first)
const firDatabase = new Map();

// Mock FIR status data for demo reliability
const MOCK_FIR_STATUSES = [
  { status: "Registered", date: "28 Mar 2026", station: "Sector 14 Police Station, Gurugram", officer: "SI Rakesh Sharma", next_date: "15 Apr 2026", action_taken: "Case registered under IPC 420. Investigation started." },
  { status: "Under Investigation", date: "30 Mar 2026", station: "Malviya Nagar PS, Delhi", officer: "SI Priya Nair", next_date: "20 Apr 2026", action_taken: "Accused summoned. Statement recorded." },
  { status: "Chargesheet Filed", date: "25 Mar 2026", station: "Bandra PS, Mumbai", officer: "PI Suresh Patil", next_date: "10 Apr 2026", action_taken: "Chargesheet filed in magistrate court. Trial pending." },
  { status: "Closed (Undetected)", date: "15 Mar 2026", station: "Ashok Nagar PS, Bangalore", officer: "SI Meena KR", next_date: null, action_taken: "Case closed. No arrest made. Escalation recommended." },
];

router.post('/track', (req, res) => {
  try {
    const { fir_number, state, district } = req.body;
    if (!fir_number) return res.status(400).json({ error: 'FIR number required.' });

    // Return mock data for demo (real integration would hit state police API)
    const mockIndex = Math.abs(fir_number.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % MOCK_FIR_STATUSES.length;
    const status = MOCK_FIR_STATUSES[mockIndex];

    const needsEscalation = status.status === "Closed (Undetected)";

    res.json({
      fir_number,
      state: state || "Delhi",
      district: district || "Central",
      ...status,
      needs_escalation: needsEscalation,
      escalation_letter: needsEscalation ? generateEscalationLetter(fir_number, state, district) : null,
      reminders: status.next_date ? [
        { type: "Court Date Reminder", date: status.next_date, message: `Your case hearing is on ${status.next_date}. Bring all original documents.` }
      ] : [],
      last_updated: new Date().toLocaleDateString('en-IN')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateEscalationLetter(firNum, state, district) {
  return `
TO,
The Superintendent of Police,
${district || 'Central'} District, ${state || 'Delhi'}

SUBJECT: Escalation — FIR No. ${firNum} — No Action Taken by Local Police

Sir/Madam,

With utmost respect, I wish to bring to your notice that despite filing FIR No. ${firNum} at the local police station, no concrete action has been taken against the accused till date.

I request your kind intervention and direction to the concerned Station House Officer to expedite the investigation and provide me with a written status update within 7 working days.

If no action is taken, I shall be constrained to approach the Hon'ble High Court for directions under Section 482 CrPC.

Yours faithfully,
[Your Name]
[Contact Number]
Date: ${new Date().toLocaleDateString('en-IN')}
  `.trim();
}

export default router;
