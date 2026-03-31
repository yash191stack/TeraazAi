import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { queryGemini } from '../services/gemini.js';
import { PROMPTS } from '../utils/prompts.js';

// This function receives the multer upload middleware from server.js
const createDocumentRouter = (upload) => {
    const router = express.Router();

    /**
     * POST /api/document/analyze
     * Accepts a PDF or text file upload and returns analysis.
     * STRICT PRIVACY: File exists ONLY in memory, dropped after request resolves.
     */
    router.post('/analyze', upload.single('document'), async (req, res) => {
        try {
            let documentText = '';

            if (!req.file && !req.body.text) {
                return res.status(400).json({ error: "No document or text provided." });
            }

            if (req.file) {
                const mimeType = req.file.mimetype;

                if (mimeType === 'application/pdf') {
                    // Parse PDF directly from in-memory buffer — never touches disk
                    const parsedPDF = await pdfParse(req.file.buffer);
                    documentText = parsedPDF.text;
                } else if (mimeType.startsWith('text/')) {
                    // Text file — convert buffer to string
                    documentText = req.file.buffer.toString('utf-8');
                } else {
                    return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or text file." });
                }
            } else {
                // Plain text sent in request body
                documentText = req.body.text;
            }

            if (!documentText || documentText.trim().length < 20) {
                return res.status(400).json({ error: "Document appears empty or too short to analyze." });
            }

            const instruction = PROMPTS.DOCUMENT_ANALYSIS;
            const prompt = `Analyze this legal document:\n\n${documentText.substring(0, 15000)}`; // Limit for API token safety

            let responseText = await queryGemini(instruction, prompt);
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

            const analysis = JSON.parse(responseText);
            res.json(analysis);

        } catch (error) {
            res.status(500).json({ error: "Failed to analyze document. Please ensure it contains readable text." });
        }
    });

    return router;
};

export default createDocumentRouter;
