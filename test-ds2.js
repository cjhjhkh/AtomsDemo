const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: "sk-4af8cecc1a2a4985ba7c01b8fa73cd10",
  baseURL: 'https://api.deepseek.com' // or https://api.deepseek.com/v1
});
async function run() {
  console.log("Starting...");
  try {
    const res = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'hello' }]
    }, { timeout: 5000 });
    console.log("Success!");
  } catch (e) {
    console.error("API Error details:", e);
  }
}
run();
