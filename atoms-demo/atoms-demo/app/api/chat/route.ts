import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // 提取最后一条用户消息
    const userMessage = messages[messages.length - 1].content;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      You are an expert web developer and UI/UX designer.
      The user wants to build a web application based on this description: "${userMessage}"
      
      You must respond strictly with a valid JSON object matching this structure. DO NOT wrap it in markdown block, ONLY return the literal JSON:
      {
        "appName": "Name of the app",
        "description": "Short description",
        "previewHtml": "A complete, self-contained HTML document with Tailwind CSS via CDN and interactive scripts if necessary.",
        "fullCode": "The verbatim HTML code again.",
        "techStack": ["HTML", "Tailwind CSS", "JavaScript"],
        "suggestions": ["suggestion 1", "suggestion 2"]
      }
    `;
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // 清理可能由于 markdown 包裹导致的前后额外的标记
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
