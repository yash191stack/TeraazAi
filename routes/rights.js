import express from 'express';
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { scenario, language = 'Hindi' } = req.body;
        if (!scenario) return res.status(400).json({ error: "No scenario provided." });

        const instruction = PROMPTS.KNOW_YOUR_RIGHTS;
        const prompt = `User's Legal Issue: ${scenario}\n\nIMPORTANT: You MUST generate the JSON response strictly in the following language: ${language}. Ensure the explanations are highly detailed, lengthy, and extremely easy to understand in layman's terms.`;
        
        let responseText = await queryGemini(instruction, prompt);
        
        // Strip markdown backticks if Gemini includes them
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        const legalData = JSON.parse(responseText);
        res.json(legalData);

    } catch (error) {
        res.status(500).json({ error: true, message: error.message || "Failed to map legal rights to this scenario." });
    }
});

export default router;
