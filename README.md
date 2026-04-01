# ⚖ TERAAZ AI | Kanoon Ka Kavach

**India's First AI Civil Rights Defender.** Built to provide 50 Crore Indians with free, instant legal help in their own language.

## 🚀 Overview

Teraaz AI is an advanced legal intelligence platform designed to break down the paywall of justice. With over 5.1 Crore pending cases in India and extremely low legal awareness in rural areas, Teraaz AI acts as a "pocket defender"—explaining your rights, analyzing legal documents, and generating legal notices, completely free of charge.

Built by **Runtime Terror**.

## ✨ Key Features

- **🎙️ Voice-to-Law AI:** Speak your problem in Hindi, and get exact IPC/BNS sections and legal advice in seconds.
- **📄 Auto Legal Notice Generator:** Draft professional legal notices for landlord disputes, consumer protection, and more.
- **📜 Document Scanner & Explainer:** Upload any complex legal document (PDF) and get a plain-Hindi summary of what it means.
- **⚡ Instant Justice Roadmap:** Get step-by-step guidance on how to proceed legally without a lawyer.
- **🚨 Emergency Assistance:** Immediate legal protocols for urgent situations.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla JS with Vite)
- **Animation & 3D:** Three.js, GSAP (ScrollTrigger)
- **Backend:** Node.js, Express.js
- **AI Integration:** Google Generative AI (Gemini Pro)
- **File Handling:** Multer (Memory Storage for strict privacy), PDF-Parse

## 🔒 Privacy-First

Teraaz AI maintains **zero logs**. It runs on a strict privacy-first runtime. File uploads are stored strictly in memory and are discarded immediately after processing.

## ⚙️ Getting Started (Local Development)

Follow these steps to run Teraaz AI locally on your system.

### Prerequisites
- Node.js (v18 or higher recommended)
- A Google Gemini API Key

### Installation

1. **Navigate to the project directory**
   ```bash
   cd TeraazAi
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the Development Servers**
   This project uses `concurrently` to run both the Vite frontend and Express backend simultaneously.
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints Architecture

The Express backend provides dedicated routes for specialized AI legal intelligence:

- `/api/rights`: Analyzes constitutional and civil rights for a given situation.
- `/api/roadmap`: Generates a step-by-step legal action plan.
- `/api/document`: Parses uploaded PDFs and explains their legal implications.
- `/api/drafting`: Auto-generates legal drafts, notices, and letters.
- `/api/emergency`: Instant triage for emergency legal situations.
- `/api/ai-judge`: Simulates a judicial perspective on cases.
- `/api/evidence`: Advises on evidence collection and validity.
- `/api/cost`: Estimates legal costs for specific procedures.
- `/api/negotiation`: Provides alternative dispute resolution tactics.
- `/api/pil`: Guidance on Public Interest Litigations.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Let's make justice accessible to every Indian.

## 📜 License
*Privacy-first. Built for Bharat.*
© 2024 Teraaz AI.
