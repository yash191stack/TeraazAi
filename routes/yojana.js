import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/match', async (req, res) => {
    try {
        const { details, language = 'English' } = req.body;

        if (!details) {
            return res.status(400).json({ error: "Demographic details are required." });
        }

        const instruction = PROMPTS.YOJANA_MATCHER;
        const prompt = `Language: ${language}\n\nUser Demographics/Details:\n${details}\n\nPlease find applicable government schemes.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const data = JSON.parse(cleanedResponse);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to match schemes." });
    }
});

export default router;
