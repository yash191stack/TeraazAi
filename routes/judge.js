import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/simulate', async (req, res) => {
    try {
        const { dispute, language = 'English' } = req.body;

        if (!dispute) {
            return res.status(400).json({ error: "Dispute details are required." });
        }

        const instruction = PROMPTS.AI_JUDGE;
        const prompt = `Language: ${language}\n\nDispute Details:\n${dispute}\n\nPlease simulate a judgment predicting the outcome, laws, and reasoning as per the JSON structure requested.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const verdictData = JSON.parse(cleanedResponse);

        res.json(verdictData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to simulate judgment." });
    }
});

export default router;
