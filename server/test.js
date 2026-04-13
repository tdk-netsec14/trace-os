require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const GEMINI_MODEL = 'gemini-1.5-flash';

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY.trim(); // Trim any space
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: "Hello"
    });
    console.log(response.text);
  } catch (e) {
    console.error("Gemini Error:", e);
  }
}
test();
