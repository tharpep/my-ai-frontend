/**
 * Prompts Store - Manages saved system prompts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Prompt {
  id: string;
  name: string;
  content: string;
  category: 'general' | 'coding' | 'creative' | 'analysis' | 'custom';
  isFavorite: boolean;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
}

interface PromptsStore {
  prompts: Prompt[];
  activePromptId: string | null;

  // Actions
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'useCount'>) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  setActivePrompt: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  incrementUseCount: (id: string) => void;
  getPromptById: (id: string) => Prompt | undefined;
  getActivePrompt: () => Prompt | undefined;
}

export const usePromptsStore = create<PromptsStore>()(
  persist(
    (set, get) => ({
      prompts: [
        // Default prompts
        {
          id: 'default-general',
          name: 'General Assistant',
          content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.',
          category: 'general',
          isFavorite: true,
          createdAt: Date.now(),
          useCount: 0,
        },
        {
          id: 'default-coding',
          name: 'Code Helper',
          content: 'You are an expert programmer. Provide clean, well-documented code with explanations. Follow best practices and consider edge cases.',
          category: 'coding',
          isFavorite: false,
          createdAt: Date.now(),
          useCount: 0,
        },
        {
          id: 'default-creative',
          name: 'Creative Writer',
          content: 'You are a creative writing assistant. Help craft engaging, imaginative content with vivid descriptions and compelling narratives.',
          category: 'creative',
          isFavorite: false,
          createdAt: Date.now(),
          useCount: 0,
        },
      ],
      activePromptId: null,

      addPrompt: (prompt) =>
        set((state) => ({
          prompts: [
            {
              ...prompt,
              id: `prompt-${Date.now()}`,
              createdAt: Date.now(),
              useCount: 0,
            },
            ...state.prompts,
          ],
        })),

      updatePrompt: (id, updates) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
          activePromptId: state.activePromptId === id ? null : state.activePromptId,
        })),

      setActivePrompt: (id) => set({ activePromptId: id }),

      toggleFavorite: (id) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
          ),
        })),

      incrementUseCount: (id) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id
              ? { ...p, useCount: p.useCount + 1, lastUsed: Date.now() }
              : p
          ),
        })),

      getPromptById: (id) => get().prompts.find((p) => p.id === id),

      getActivePrompt: () => {
        const { activePromptId, prompts } = get();
        return activePromptId ? prompts.find((p) => p.id === activePromptId) : undefined;
      },
    }),
    {
      name: 'prompts-storage',
    }
  )
);
