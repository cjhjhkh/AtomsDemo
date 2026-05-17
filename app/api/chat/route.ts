import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.QWEN_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Qwen API key is not configured' },
        { status: 500 }
      );
    }
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
    
    const { messages } = await req.json();
    
    // 映射全部历史消息，支持在上下文中"Remix"
    const apiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));
    
    const systemPrompt = `
      You are an expert web developer, UI/UX designer, and frontend architect. 
      You will build or refine a web application based on user request and the chat history.
      
      You must respond strictly with a valid JSON object matching this exact structure. DO NOT wrap it in a markdown block, JUST return the literal JSON plain text:
      {
        "appName": "Name of the app",
        "description": "Short description",
        "previewHtml": "<!DOCTYPE html><html><head><script src='https://cdn.tailwindcss.com'></script></head><body class='bg-gray-900 text-white'>... your code ...</body></html>",
        "fullCode": {
          "index.html": "<!DOCTYPE html>...",
          "styles.css": "body { ... }",
          "script.js": "console.log('...');"
        },
        "techStack": ["HTML5", "Tailwind CSS", "JavaScript"],
        "suggestions": ["Suggestion 1", "Suggestion 2"]
      }

      Important rules for previewHtml:
      - It must be a complete HTML document starting with <!DOCTYPE html>.
      - Include Tailwind CSS via https://cdn.tailwindcss.com.
      - Ensure modern, beautiful, and dark-themed UI (compatible with the prompt).
      - Add necessary inline scripts to make the basic interactions work.
      
      Important rules for fullCode:
      - This object will be displayed in a file tree editor, so provide sensible file names as keys (e.g. index.html, styles.css, script.js).
      - Break down the logic from previewHtml into separate files in this field.

      - If the user asks to modify the app, update the code from your previous responses.
    `;

    const completion = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        ...apiMessages
      ],
      response_format: { type: 'json_object' }
    });

    let text = completion.choices[0].message.content || '';
    
    text = text.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error calling Qwen API:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate response. Please try again.',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
