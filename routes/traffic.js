import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
    try {
        const { details, language = 'English' } = req.body;

        if (!details) {
            return res.status(400).json({ error: "Challan details are required." });
        }

        const instruction = PROMPTS.TRAFFIC_ANALYZER;
        const prompt = `Language: ${language}\n\nTraffic Challan Details:\n${details}\n\nPlease analyze this according to Motor Vehicles Act.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const data = JSON.parse(cleanedResponse);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to analyze traffic dispute." });
    }
});

export default router;
