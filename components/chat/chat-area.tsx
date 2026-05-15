"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store/use-store';
import { Send, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export function ChatArea() {
  const { user, messages, addMessage, setIsPreviewLoading, setCurrentPreview, setProjects } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const saveProjectToDb = async (aiData: any, newMessages: any) => {
    if (!user) return; // 只有登录用户才保存

    try {
      await fetch('/api/save-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: aiData.appName || 'Untitled App',
          data: aiData,
          messages: newMessages
        }),
      });

      // 刷新项目列表
      const { data: userProjects } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (userProjects) {
        setProjects(userProjects.map((p: any) => ({
          id: p.id,
          name: p.name,
          updatedAt: new Date(p.updated_at),
          data: p.data,
          messages: p.messages
        })));
      }
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      createdAt: new Date()
    };
    
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);
    setIsPreviewLoading(true);

    const currentMessages = [...messages, userMsg];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `为您生成了项目：**${data.appName || '未命名应用'}**。\n\n${data.description || '请查看右侧预览面板！'}`,
        createdAt: new Date()
      };

      addMessage(assistantMsg);
      setCurrentPreview(data);
      
      // 生成成功后尝试保存到数据库
      await saveProjectToDb(data, [...currentMessages, assistantMsg]);
      
    } catch (error: any) {
      console.error(error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `抱歉，生成时发生错误：**${error.message}**。\n\n这往往是因为后端未正确配置 API Key 等问题导致。`,
        createdAt: new Date()
      });
    } finally {
      setIsTyping(false);
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-[20vh]">
            <h1 className="text-3xl font-bold mb-2 text-glow">How can I help you today?</h1>
            <p>Describe your project to get started.</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'glass-card border border-white/5 rounded-bl-sm text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass-card rounded-2xl rounded-bl-sm px-5 py-4 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 md:p-8 pt-0">
        <div className="relative rounded-2xl glass-card p-2 border-glow focus-within:border-primary transition-all">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={user ? "Type your message..." : "Please Sign In from the sidebar to save projects..."} 
            className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] p-2 text-sm text-foreground"
          />
          <div className="flex justify-between items-center mt-2 px-2">
            <div className="text-xs text-muted-foreground">Press Enter to send (Shift+Enter for newline)</div>
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
