import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/check', async (req, res) => {
    try {
        const { evidence, language = 'English' } = req.body;

        if (!evidence) {
            return res.status(400).json({ error: "Evidence list is required." });
        }

        const instruction = PROMPTS.SABOOT_CHECKER;
        const prompt = `Language: ${language}\n\nList of Evidence:\n${evidence}\n\nPlease evaluate admissibility under Bharatiya Sakshya Adhiniyam as per the requested JSON structure.`;

        const responseText = await queryGemini(instruction, prompt);
        
        const cleanedResponse = responseText.replace(/```json|```/gi, '').trim();
        const sabootData = JSON.parse(cleanedResponse);

        res.json(sabootData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to analyze evidence admissibility." });
    }
});

export default router;
