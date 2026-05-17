"use client";

import React from 'react';
import { useStore } from '@/lib/store/use-store';
import { LogOut, User as UserIcon, Plus } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export function Sidebar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, projects, activeProjectId, setActiveProject, setCurrentPreview, setMessages } = useStore();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateNew = () => {
    setActiveProject(null);
    setCurrentPreview(null);
    setMessages([]);
  };

  const handleSelectProject = (p: any) => {
    setActiveProject(p.id);
    if (p.data) {
      setCurrentPreview(p.data);
    } else {
      setCurrentPreview(null);
    }
    if (p.messages) {
      setMessages(p.messages);
    } else {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-sidebar border-r border-sidebar-border p-4 glass relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-glow">Atoms Demo</h2>
        <button 
          onClick={handleCreateNew} 
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground"
          title="New Project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Projects
        </h3>
        <div className="space-y-1 pr-2">
          {projects.length === 0 ? (
            <div className="text-sm text-muted-foreground italic px-2">No projects yet.</div>
          ) : (
            projects.map((p) => (
              <button 
                key={p.id}
                onClick={() => handleSelectProject(p)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                  activeProjectId === p.id 
                    ? 'bg-primary/20 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
                title={p.name}
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="pt-4 mt-auto border-t border-white/5">
        {user ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground truncate" title={user.email}>{user.email}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors flex-shrink-0" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
