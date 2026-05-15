const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: "sk-4af8cecc1a2a4985ba7c01b8fa73cd10",
  baseURL: 'https://api.deepseek.com'
});
async function run() {
  try {
    const res = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log("Success:", res.choices[0].message.content);
  } catch (e) {
    console.error("API ERROR:", e.message);
  }
}
run();
