export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: Date;
}

export interface AIResponsePayload {
  appName: string;
  description: string;
  previewHtml: string;
  fullCode: string;
  techStack: string[];
  suggestions: string[];
}
