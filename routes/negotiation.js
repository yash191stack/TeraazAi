import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/script', async (req, res) => {
    try {
        const { context, language = 'English' } = req.body;

        if (!context) {
            return res.status(400).json({ error: "Context is required for the negotiation script." });
        }

        const instruction = PROMPTS.NEGOTIATION_BOT;
        const prompt = `Language: ${language}\n\nOut-of-Court Context:\n${context}\n\nPlease generate a strategic negotiation script according to the requested JSON structure.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const scriptData = JSON.parse(cleanedResponse);

        res.json(scriptData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to generate negotiation script." });
    }
});

export default router;
