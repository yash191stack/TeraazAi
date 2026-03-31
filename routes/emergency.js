import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

// Pre-built emergency quick-responses (no AI latency needed for critical moments)
const EMERGENCY_QUICK = {
    arrested: {
        immediate_actions: [
            "STAY CALM. Do not resist.",
            "Demand to know the reason for arrest immediately.",
            "Assert your right: 'I want to contact my lawyer.'",
            "Do NOT sign any blank papers or statements.",
            "Request a copy of the FIR under Section 207 CrPC.",
            "Inform a trusted family member or friend of your location."
        ],
        critical_rights: [
            { right: "Article 22(1)", description: "Right to be informed of grounds of arrest." },
            { right: "Article 22(1)", description: "Right to consult and be defended by a lawyer." },
            { right: "Section 50 CrPC", description: "Police must inform you of grounds of arrest." },
            { right: "Section 57 CrPC", description: "Cannot be detained for more than 24 hours without magistrate order." },
            { right: "D.K. Basu Guidelines", description: "Right to medical examination and humane treatment." }
        ],
        warning: "Do NOT make any statements to police without your lawyer present. Anything you say can be used against you in court."
    },
    domestic_violence: {
        immediate_actions: [
            "Get to a safe place immediately — leave the house if possible.",
            "Call 181 (Women's Helpline) or 112 (Emergency).",
            "Go to the nearest police station and file a DV complaint.",
            "Contact a Protection Officer under the DV Act.",
            "Preserve evidence: Take photos of injuries, save threatening messages."
        ],
        critical_rights: [
            { right: "Protection of Women from DV Act 2005", description: "Right to live in the shared household free from violence." },
            { right: "Section 12 DV Act", description: "Right to file application for protection order before Magistrate." },
            { right: "One Stop Centre", description: "Free shelter, legal aid, medical assistance available at government OSCs." }
        ],
        warning: "Do not be pressured into withdrawing your complaint. You have the right to protection regardless of family or social pressure."
    }
};

/**
 * POST /api/emergency
 * Handles AI-powered emergency guidance for urgent legal situations.
 */
router.post('/', async (req, res) => {
    try {
        const { situation, quickType } = req.body;

        if (!situation && !quickType) {
            return res.status(400).json({ error: "Please describe your emergency situation." });
        }

        // Return instantly pre-built response for known critical emergencies
        if (quickType && EMERGENCY_QUICK[quickType]) {
            return res.json({ source: 'quick', ...EMERGENCY_QUICK[quickType] });
        }

        // For other situations, use Gemini
        const instruction = PROMPTS.EMERGENCY;
        const prompt = `Emergency Situation: ${situation}`;

        let responseText = await queryGemini(instruction, prompt);
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const guidance = JSON.parse(responseText);
        res.json({ source: 'ai', ...guidance });

    } catch (error) {
        // For emergency route — always fall back to basic guidance
        res.status(500).json({
            error: "AI guidance temporarily unavailable.",
            fallback: {
                national_helplines: {
                    emergency: "112",
                    women_helpline: "181",
                    legal_aid: "15100",
                    senior_citizen: "14567"
                },
                immediate_advice: "Go to your nearest police station or hospital immediately."
            }
        });
    }
});

/**
 * GET /api/emergency/helplines
 * Returns a static, always-available list of helpline numbers.
 */
router.get('/helplines', (req, res) => {
    res.json({
        emergency: "112",
        women_helpline: "181",
        child_helpline: "1098",
        legal_aid: "15100",
        senior_citizen: "14567",
        cyber_crime: "1930",
        anti_corruption: "1064",
        consumer_helpline: "1800-11-4000"
    });
});

export default router;
