import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

// Supported document types the AI can draft
const SUPPORTED_TYPES = [
    'RTI Application',
    'Legal Notice',
    'Police Complaint',
    'Consumer Forum Complaint',
    'Affidavit',
    'Bail Application',
    'FIR Request',
    'Rental Agreement Dispute Letter'
];

/**
 * POST /api/drafting/generate
 * Accepts document type + user details to auto-generate a legal document.
 */
router.post('/generate', async (req, res) => {
    try {
        const { type, details } = req.body;

        if (!type) {
            return res.status(400).json({
                error: "Document type is required.",
                supported_types: SUPPORTED_TYPES
            });
        }

        const instruction = PROMPTS.LEGAL_DRAFTING;
        const prompt = `
Document Type: ${type}

User Details:
${JSON.stringify(details || {}, null, 2)}

Draft a complete, formal, legally valid ${type} in India based on the above details.
Use [PLACEHOLDER] for any missing information to be filled by the user.
Include date, proper addressing, and formal closing.
        `.trim();

        const draftedDocument = await queryGemini(instruction, prompt);

        res.json({
            document_type: type,
            content: draftedDocument.trim(),
            note: "Review this document. Replace any [PLACEHOLDER] fields with your actual information before use."
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to draft the legal document. Please try again." });
    }
});

/**
 * GET /api/drafting/types
 * Returns a list of supported document types.
 */
router.get('/types', (req, res) => {
    res.json({ supported_types: SUPPORTED_TYPES });
});

export default router;
