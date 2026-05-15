import { create } from 'zustand';
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
  
  isPreviewLoading: boolean;
  setIsPreviewLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
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

  isPreviewLoading: false,
  setIsPreviewLoading: (loading) => set({ isPreviewLoading: loading }),
}));
