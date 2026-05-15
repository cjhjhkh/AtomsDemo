"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useStore } from "@/lib/store/use-store";
import { createBrowserClient } from "@supabase/ssr";

export default function Home() {
  const { user, setUser, setProjects } = useStore();
  const [authOpen, setAuthOpen] = useState(false);

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
            setProjects(data.map(p => ({
              id: p.id,
              name: p.name,
              updatedAt: new Date(p.updated_at),
              data: p.data,
              messages: p.messages
            })));
          }
        })
        .catch(console.error);
    }
  }, [user, setProjects]);

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
