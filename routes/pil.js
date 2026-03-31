import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/evaluate', async (req, res) => {
    try {
        const { issue, language = 'English' } = req.body;

        if (!issue) {
            return res.status(400).json({ error: "Social issue details are required to evaluate PIL." });
        }

        const instruction = PROMPTS.PIL_IDEATOR;
        const prompt = `Language: ${language}\n\nSocial Issue:\n${issue}\n\nPlease evaluate if this qualifies for a Public Interest Litigation under Article 32 or 226 as per the requested JSON structure.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const pilData = JSON.parse(cleanedResponse);

        res.json(pilData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to evaluate PIL." });
    }
});

export default router;
