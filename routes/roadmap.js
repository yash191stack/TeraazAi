import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

/**
 * POST /api/roadmap
 * Accepts a legal issue description and returns a complete case strategy roadmap.
 */
router.post('/', async (req, res) => {
    try {
        const { issue, language = 'Hindi' } = req.body;

        if (!issue) {
            return res.status(400).json({ error: "Please describe the legal issue to generate a roadmap." });
        }

        const instruction = PROMPTS.CASE_ROADMAP;
        const prompt = `Legal Issue: ${issue}\n\nIMPORTANT: You MUST generate the JSON response strictly in the following language: ${language}. Ensure the steps are detailed and easy to understand.`;

        let responseText = await queryGemini(instruction, prompt);
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const roadmap = JSON.parse(responseText);
        res.json(roadmap);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

export default router;
