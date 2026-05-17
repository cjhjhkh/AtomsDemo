"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useStore } from "@/lib/store/use-store";
import { createBrowserClient } from "@supabase/ssr";

export default function Home() {
  const { user, setUser, setProjects, activeProjectId, setCurrentPreview, setMessages } = useStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        setAuthOpen(false);
      } else {
        setUser(null);
        setProjects([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProjects]);

  useEffect(() => {
    if (user) {
      fetch('/api/load-projects')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mappedProjects = data.map(p => ({
              id: p.id,
              name: p.name,
              updatedAt: new Date(p.updated_at),
              data: p.data,
              messages: p.messages
            }));
            setProjects(mappedProjects);
            
            // 为了保持和之前一样的状态，如果服务端返回了项目，并且我们有一个活跃的 id，
            // 确保相关对话也被加载过来，否则如果没有未保存的草稿，其实 zustand 本地已经有了
          }
        })
        .catch(console.error);
    }
  }, [user, setProjects]);

  if (!isHydrated) return null; // Avoid hydration mismatch for Persist store

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 左侧：项目历史边栏 */}
      <div className="w-64 flex-shrink-0 relative hidden md:block">
         <Sidebar onOpenAuth={() => setAuthOpen(true)} />
      </div>

      {/* 中间：聊天区域 */}
      <div className="flex-1 flex flex-col min-w-[300px] border-l border-white/5 relative z-10 transition-all">
         <ChatArea />
      </div>

      {/* 右侧：预览区域 */}
      <div className="w-1/2 flex-shrink-0 border-l border-white/5 hidden lg:block bg-muted/20">
         <PreviewPanel />
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}
