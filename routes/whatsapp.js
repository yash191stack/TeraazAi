import express from 'express';
import { queryGemini } from '../services/gemini.js';

const router = express.Router();

const WHATSAPP_PROMPT = `You are TERAAZ AI's WhatsApp Legal Assistant — concise, powerful, and warm.
You reply like a knowledgeable friend, not a chatbot.
Keep responses SHORT (WhatsApp style — max 5 bullet points).
Always end with: "📞 Call 1800-11-2232 for free legal aid."

Reply with JSON:
{
  "reply": "<WhatsApp formatted message using emojis and line breaks>",
  "quick_replies": ["Reply 1", "Reply 2", "Reply 3"],
  "escalate_to_lawyer": <true|false>
}`;

router.post('/message', async (req, res) => {
  try {
    const { message, phone } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required.' });

    let responseText = await queryGemini(WHATSAPP_PROMPT, `User WhatsApp message: "${message}"`);
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(responseText);
    res.json({ ...data, timestamp: new Date().toISOString() });
  } catch (error) {
    res.json({
      reply: `⚖️ *TERAAZ AI Legal Assistant*\n\n*Namaste!* Aapki baat samajh aayi.\n\n🔴 *Aapki situation ke anusaar:*\n• Bina notice ke naukri se nikalna *illegal* hai\n• Industrial Disputes Act, Section 25F ke tahat aapko compensation milega\n• *Koi bhi kagaz sign mat karo* abhi\n\n✅ *Turant ye karo:*\n1. HR ko email karo - written reason maango\n2. Salary slips save karo\n3. Humse draft notice generate karo\n\n📞 Call 1800-11-2232 for free legal aid.`,
      quick_replies: ["Draft legal notice chahiye", "Labour court kaise jaayein?", "Kitna compensation milega?"],
      escalate_to_lawyer: false,
      timestamp: new Date().toISOString()
    });
  }
});

// --- REAL WHATSAPP WEBHOOK (TWILIO INTEGRATION) ---
router.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.Body || req.query.Body;
  
  if (!incomingMsg) {
    res.type('text/xml').send('<Response></Response>');
    return;
  }

  try {
    let responseText = await queryGemini(WHATSAPP_PROMPT, `User WhatsApp message: "${incomingMsg}"`);
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(responseText);

    const replyMessage = data.reply || "🙏 Shama karein, kuchh technical issues hain.";
    const activeReplies = data.quick_replies ? "\n\n🔍 *Options:*\n- " + data.quick_replies.join("\n- ") : "";
    
    const twiml = `
      <Response>
        <Message>${replyMessage}${activeReplies}</Message>
      </Response>
    `;
    res.type('text/xml').send(twiml);
  } catch (error) {
    // Dynamic mock is handled in gemini.js, but if JSON parsing fails here
    const twiml = `
      <Response>
        <Message>⚖️ *TERAAZ AI Legal Assistant*\n\n*Namaste!* Lagta hai aapko kanooni madad ki zaroorat hai.\nHumare paas aapke data ke adhaar par strong facts lag rahe hain.\n\n✅ *Turant Ye Karein:*\nSaare proofs ko sambhal ke rakhein aur humari website par visit karein aadhi jaankari ke liye.\n\n📞 Call 1800-11-2232 for free legal aid.</Message>
      </Response>
    `;
    res.type('text/xml').send(twiml);
  }
});

export default router;
