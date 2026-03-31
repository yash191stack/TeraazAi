import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/estimate', async (req, res) => {
    try {
        const { details, language = 'English' } = req.body;

        if (!details) {
            return res.status(400).json({ error: "Case details are required to estimate cost." });
        }

        const instruction = PROMPTS.COST_ESTIMATOR;
        const prompt = `Language: ${language}\n\nCase Details:\n${details}\n\nPlease estimate the total cost, lawyer type, and breakdown under the requested JSON structure.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const costData = JSON.parse(cleanedResponse);

        res.json(costData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to estimate legal cost." });
    }
});

export default router;
