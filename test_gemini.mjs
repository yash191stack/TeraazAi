import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log('Key present:', !!process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

try {
  const result = await model.generateContent('Say hello in one sentence.');
  console.log('SUCCESS:', result.response.text());
} catch(e) {
  console.error('FAIL:', e.message);
  console.error('STATUS:', e.status);
}
