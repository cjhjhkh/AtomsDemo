const OpenAI = require('openai');

async function test() {
  const openai = new OpenAI({
    apiKey: "sk-4af8cecc1a2a4985ba7c01b8fa73cd10",
    baseURL: 'https://api.deepseek.com'
  });

  try {
    const res = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: 'Say hello in JSON format {"message": "hello"}' }
      ],
      response_format: { type: 'json_object' }
    });
    console.log(res.choices[0].message.content);
  } catch (error) {
    console.error("DeepSeek API Error:", error.message);
  }
}
test();
