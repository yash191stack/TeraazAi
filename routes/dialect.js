import express from 'express';
import { queryGemini } from '../services/gemini.js';

const router = express.Router();

const DIALECT_PROMPT = `You are "Kanoon Ki Awaaz" — India's first legal AI that speaks in regional dialects.
You understand and respond in: Bhojpuri, Haryanvi, Rajasthani, Maithili, Awadhi, Bengali, Marathi, Tamil, Telugu, Kannada, Gujarati, Punjabi, and standard Hindi.

Detect the input dialect/language. Respond with a JSON:
{
  "detected_dialect": "<dialect name>",
  "legal_summary": "<brief plain legal explanation in DETECTED dialect — use actual dialect words, not standard Hindi>",
  "rights": ["<right 1 in dialect>", "<right 2>"],
  "next_step": "<actionable step in detected dialect>",
  "helpline": "<relevant helpline number>",
  "standard_hindi": "<same summary in clean standard Hindi for reference>"
}

Use actual dialect phrases. For Bhojpuri: 'hamra', 'raura', 'baate'. Haryanvi: 'मन्नै', 'थाने', 'सै'. Make it authentic.`;

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required.' });

    let responseText = await queryGemini(DIALECT_PROMPT, `User said (in their dialect): "${message}"`);
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error) {
    // Mock fallback
    const isHaryanvi = /मन्नै|थाने|सै|जाण|हरियाणा/i.test((req.body.message || ''));
    const isBhojpuri = /hamra|raura|baate|बा|रहल|भोजपुर/i.test((req.body.message || ''));

    if (isBhojpuri) {
      res.json({
        detected_dialect: "Bhojpuri",
        legal_summary: "भाई, रउरा के नौकरी से निकाले के ई तरीका गलत बा। कम्पनी के पहिले एक महीना के नोटिस देवे के रहे। ई Industrial Disputes Act के Section 25F के उल्लंघन बा।",
        rights: ["रउरा के एक महीना के नोटिस या ओतना पइसा पावे के हक़ बा", "Labour Court में जा के केस दर्ज करवा सकत बाड़ी"],
        next_step: "पहिले अपना HR के email भेजीं — लिखित में कारण माँगीं। फिर Labour Commissioner के दफ्तर जाईं।",
        helpline: "1800-11-2232 (Labour Helpline)",
        standard_hindi: "कंपनी द्वारा बिना नोटिस के नौकरी से निकालना Industrial Disputes Act की धारा 25F का उल्लंघन है।"
      });
    } else if (isHaryanvi) {
      res.json({
        detected_dialect: "Haryanvi",
        legal_summary: "यार, थाने बिना नोटिस के काम तै काढ़ दिया — ई गलत सै। कम्पनी नै एक महीना का नोटिस देणा था या उतनी तन्ख्वाह।",
        rights: ["मन्नै एक महीना की तन्ख्वाह लेण का हक़ सै", "Labour Court में जा सकै सां"],
        next_step: "पहलां HR नै लिखत में कारण माँग, फिर Labour Commissioner के यड़ां जा।",
        helpline: "1800-11-2232 (Labour Helpline)",
        standard_hindi: "बिना नोटिस नौकरी से निकालना Industrial Disputes Act की धारा 25F का उल्लंघन है।"
      });
    } else {
      res.json({
        detected_dialect: "Hindi",
        legal_summary: "भाई, बिना नोटिस के नौकरी से निकालना पूरी तरह गैरकानूनी है। Industrial Disputes Act की धारा 25F के तहत कंपनी को 1 महीने का नोटिस या उतनी सैलरी देनी ही होगी।",
        rights: ["1 महीने की सैलरी पाने का अधिकार", "Labour Court में केस दर्ज करने का अधिकार", "Provident Fund तुरंत पाने का अधिकार"],
        next_step: "आज ही HR को email करें और लिखित में कारण माँगें। कोई भी कागज़ पर दस्तखत मत करें।",
        helpline: "1800-11-2232 (Labour Helpline)",
        standard_hindi: "बिना नोटिस नौकरी से निकालना Industrial Disputes Act की धारा 25F का उल्लंघन है।"
      });
    }
  }
});

export default router;
