import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/calculate', async (req, res) => {
    try {
        const { details, language = 'English' } = req.body;

        if (!details) {
            return res.status(400).json({ error: "Offense details are required." });
        }

        const instruction = PROMPTS.BAIL_CALCULATOR;
        const prompt = `Language: ${language}\n\nOffense Details:\n${details}\n\nPlease determine bail eligibility.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const data = JSON.parse(cleanedResponse);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to calculate bail eligibility." });
    }
});

export default router;
