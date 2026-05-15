const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyCApVSiKfZG0CyhyFgGsFvsO2-cUiVf7E0");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("API ERROR:", e.message);
  }
}
run();
