/**
 * Chat Store - Manages chat state, sessions, and messages
 * 
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    requestId?: string;
    ragContext?: any;
  };
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  lastActivity: number;
  messageCount: number;
  messages: Message[];
}

interface ChatStore {
  // Session management
  sessions: Session[];
  currentSessionId: string | null;
  
  // UI state
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions - Sessions
  createSession: (name?: string) => string;
  deleteSession: (sessionId: string) => void;
  switchSession: (sessionId: string) => void;
  updateSessionName: (sessionId: string, name: string) => void;
  
  // Actions - Messages
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearCurrentMessages: () => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getCurrentSession: () => Session | null;
  getCurrentMessages: () => Message[];
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      currentSessionId: null,
      sidebarOpen: true,
      isLoading: false,
      error: null,
      
      // Session actions
      createSession: (name) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: Session = {
          id: sessionId,
          name: name || `Chat ${get().sessions.length + 1}`,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          messageCount: 0,
          messages: [],
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
        }));
        
        return sessionId;
      },
      
      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          const newCurrentId = state.currentSessionId === sessionId
            ? (newSessions[0]?.id || null)
            : state.currentSessionId;
          
          return {
            sessions: newSessions,
            currentSessionId: newCurrentId,
          };
        });
      },
      
      switchSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },
      
      updateSessionName: (sessionId, name) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, name } : s
          ),
        }));
      },
      
      // Message actions
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        set((state) => {
          const currentSession = state.sessions.find(
            (s) => s.id === state.currentSessionId
          );
          
          if (!currentSession) return state;
          
          return {
            sessions: state.sessions.map((s) =>
              s.id === state.currentSessionId
                ? {
                    ...s,
                    messages: [...s.messages, newMessage],
                    messageCount: s.messageCount + 1,
                    lastActivity: Date.now(),
                    name: s.messageCount === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : s.name,
                  }
                : s
            ),
          };
        });
      },
      
      clearCurrentMessages: () => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === state.currentSessionId
              ? { ...s, messages: [], messageCount: 0 }
              : s
          ),
        }));
      },
      
      // UI actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      // Computed
      getCurrentSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.currentSessionId) || null;
      },
      
      getCurrentMessages: () => {
        const session = get().getCurrentSession();
        return session?.messages || [];
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
