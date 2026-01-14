/**
 * Chat Store - Manages chat state, sessions, and messages
 * 
 * Uses Zustand for lightweight state management
 * Syncs with backend session/journal system
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, SessionMetadata, SessionMessage } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    promptTokens?: number;
    completionTokens?: number;
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
  ingestedAt?: string;
  ingestionStatus?: {
    ingested: boolean;
    hasNewMessages: boolean;
    chunkCount: number;
  };
}

interface ChatStore {
  // Session management
  sessions: Session[];
  currentSessionId: string | null;
  
  // UI state
  sidebarOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Actions - Sessions
  createSession: (name?: string) => string;
  deleteSession: (sessionId: string) => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  updateSessionName: (sessionId: string, name: string) => void;
  loadSessions: () => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<void>;
  
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

// Convert backend session metadata to local Session format
function backendSessionToLocal(backendSession: SessionMetadata): Session {
  return {
    id: backendSession.session_id,
    name: backendSession.name || 'New Chat',
    createdAt: backendSession.created_at ? new Date(backendSession.created_at).getTime() : Date.now(),
    lastActivity: new Date(backendSession.last_activity).getTime(),
    messageCount: backendSession.message_count,
    messages: [],
    ingestedAt: backendSession.ingested_at,
  };
}

// Convert backend message to local Message format
function backendMessageToLocal(backendMsg: SessionMessage, index: number): Message {
  return {
    id: `msg_${index}_${Date.now()}`,
    role: backendMsg.role,
    content: backendMsg.content,
    timestamp: new Date(backendMsg.timestamp).getTime(),
  };
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      currentSessionId: null,
      sidebarOpen: true,
      isLoading: false,
      isSyncing: false,
      error: null,
      
      // Load sessions from backend
      loadSessions: async () => {
        try {
          set({ isSyncing: true, error: null });
          const response = await api.listSessions(100);
          
          const backendSessions = response.sessions.map(backendSessionToLocal);
          
          set((state) => {
            // Merge with existing sessions, keeping local messages for sessions not yet loaded
            const existingSessionsMap = new Map(state.sessions.map(s => [s.id, s]));
            const mergedSessions = backendSessions.map(backendSession => {
              const existing = existingSessionsMap.get(backendSession.id);
              if (existing && existing.messages.length > 0) {
                // Keep local messages if we have them
                return { ...backendSession, messages: existing.messages };
              }
              return backendSession;
            });
            
            return {
              sessions: mergedSessions,
              isSyncing: false,
            };
          });
        } catch (error) {
          console.error('Failed to load sessions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load sessions',
            isSyncing: false 
          });
        }
      },
      
      // Load messages for a specific session from backend
      loadSessionMessages: async (sessionId: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.getSessionMessages(sessionId);
          
          const messages = response.messages.map((msg, idx) => backendMessageToLocal(msg, idx));
          
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages,
                    messageCount: response.message_count,
                    name: response.name || s.name,
                    lastActivity: new Date(response.last_activity).getTime(),
                    ingestedAt: response.ingestion_status.ingested_at,
                    ingestionStatus: {
                      ingested: response.ingestion_status.ingested,
                      hasNewMessages: response.ingestion_status.has_new_messages,
                      chunkCount: response.ingestion_status.chunk_count,
                    },
                  }
                : s
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error('Failed to load session messages:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load messages',
            isLoading: false 
          });
        }
      },
      
      // Session actions
      createSession: (name) => {
        // Generate session ID that matches backend format
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: Session = {
          id: sessionId,
          name: name || 'New Chat',
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
      
      deleteSession: async (sessionId: string) => {
        try {
          // Delete from backend
          await api.deleteSession(sessionId);
          
          // Remove from local state
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
        } catch (error) {
          console.error('Failed to delete session:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete session'
          });
          throw error;
        }
      },
      
      switchSession: async (sessionId: string) => {
        set({ currentSessionId: sessionId });
        
        // Check if we need to load messages
        const session = get().sessions.find((s) => s.id === sessionId);
        if (!session || session.messages.length === 0) {
          // Load messages from backend
          await get().loadSessionMessages(sessionId);
        }
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
        // Only persist UI state, not sessions (they come from backend)
        currentSessionId: state.currentSessionId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
