import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

// Load Environment Variables
dotenv.config();

// Main App Initialization
const app = express();
const PORT = process.env.PORT || 3000;

// Essential Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strict Privacy Setup: Multer Memory Storage (No disk interaction)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Import Core Routes
import rightsRoute from './routes/rights.js';
import roadmapRoute from './routes/roadmap.js';
import documentRoute from './routes/document.js';
import draftingRoute from './routes/drafting.js';
import emergencyRoute from './routes/emergency.js';

// Advanced 5 Routes
import judgeRoute from './routes/judge.js';
import evidenceRoute from './routes/evidence.js';
import costRoute from './routes/cost.js';
import negotiationRoute from './routes/negotiation.js';
import pilRoute from './routes/pil.js';

// Base Route
app.get('/', (req, res) => {
  res.json({ message: "TERAAZ AI Privacy-First API Runtime Active. Zero logs maintained." });
});

// Appending Routes
// Mount Core Routes
app.use('/api/rights', rightsRoute);
app.use('/api/roadmap', roadmapRoute);
app.use('/api/document', documentRoute(upload));
app.use('/api/drafting', draftingRoute);
app.use('/api/emergency', emergencyRoute);

// Mount Advanced 5 Routes
app.use('/api/ai-judge', judgeRoute);
app.use('/api/evidence', evidenceRoute);
app.use('/api/cost', costRoute);
app.use('/api/negotiation', negotiationRoute);
app.use('/api/pil', pilRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal API Error occurred."); // Maintain privacy, generic log
  res.status(500).json({ error: 'An unexpected error occurred.', details: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[TERAAZ Backend] Secure API running on http://localhost:${PORT}`);
});
