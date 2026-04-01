import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/protect', async (req, res) => {
    try {
        const { details, language = 'English' } = req.body;

        if (!details) {
            return res.status(400).json({ error: "Incident details are required." });
        }

        const instruction = PROMPTS.MAHILA_KAVACH;
        const prompt = `Language: ${language}\n\nIncident Details:\n${details}\n\nPlease analyze based on Women's Rights and Domestic Violence Act.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const data = JSON.parse(cleanedResponse);

        res.json(data);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to analyze women's rights issue." });
    }
});

export default router;
