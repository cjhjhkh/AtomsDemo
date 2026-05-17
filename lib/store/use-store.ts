import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, Project, AIResponsePayload, User } from '@/types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;

  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
  setProjects: (projects: Project[]) => void;

  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (messages: Message[]) => void;

  currentPreview: AIResponsePayload | null;
  setCurrentPreview: (preview: AIResponsePayload | null) => void;
  updateCurrentPreviewCode: (code: string) => void;
  
  isPreviewLoading: boolean;
  setIsPreviewLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      projects: [],
      activeProjectId: null,
      setActiveProject: (id) => set({ activeProjectId: id }),
      setProjects: (projects) => set({ projects }),

      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      setMessages: (messages) => set({ messages }),

      currentPreview: null,
      setCurrentPreview: (preview) => set({ currentPreview: preview }),
      updateCurrentPreviewCode: (code) => set((state) => ({
        currentPreview: state.currentPreview ? { ...state.currentPreview, previewHtml: code, fullCode: code } : null
      })),

      isPreviewLoading: false,
      setIsPreviewLoading: (loading) => set({ isPreviewLoading: loading }),
    }),
    {
      name: 'atoms-storage',
      // Merge function is important for converting date strings back into Date objects after JSON parsing
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;

        const restoredMessages = (persistedState.messages || []).map((m: any) => ({
          ...m,
          createdAt: typeof m.createdAt === 'string' ? new Date(m.createdAt) : m.createdAt
        }));

        const restoredProjects = (persistedState.projects || []).map((p: any) => ({
          ...p,
          updatedAt: typeof p.updatedAt === 'string' ? new Date(p.updatedAt) : p.updatedAt
        }));

        return {
          ...currentState,
          ...persistedState,
          messages: restoredMessages,
          projects: restoredProjects,
          isPreviewLoading: false // Reset loading state on hydration
        };
      },
      partialize: (state) => ({
        ...state,
        isPreviewLoading: false, // Don't persist loading states
      })
    }
  )
);
