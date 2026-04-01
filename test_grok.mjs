import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1"
});

async function main() {
    try {
        const response = await openai.chat.completions.create({
            model: "grok-3-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Test message" }
            ],
            temperature: 0.2, 
        });
        console.log("Response String:", JSON.stringify(response, null, 2));
        console.log("Choices:", response.choices);
    } catch (e) {
        console.error("Error connecting to GROK:", e);
    }
}
main();
