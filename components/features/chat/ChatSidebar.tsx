"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { api } from "@/lib/api";
import { Plus, MessageSquare, Trash2, Database, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

/**
 * Chat Sidebar - Discord-style session list
 * 
 * Shows list of chat sessions with quick actions
 */
export function ChatSidebar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    switchSession,
    deleteSession,
    loadSessions,
  } = useChatStore();

  const handleNewChat = () => {
    createSession("New Chat");
  };

  const [ingestingSessionId, setIngestingSessionId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    const sessionName = session?.name || "this session";
    
    if (confirm(`Delete "${sessionName}"?\n\nThis will permanently delete:\n• All messages in this session\n• RAG chunks from vector database\n• Exported session data\n\nThis cannot be undone.`)) {
      try {
        await deleteSession(sessionId);
        // Reload sessions to get updated list
        await loadSessions();
      } catch (error) {
        console.error("Failed to delete session:", error);
        alert(error instanceof Error ? error.message : "Failed to delete session. Please try again.");
      }
    }
  };

  const handleSwitchSession = async (sessionId: string) => {
    try {
      await switchSession(sessionId);
    } catch (error) {
      console.error("Failed to switch session:", error);
    }
  };

  const handleIngestSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIngestingSessionId(sessionId);
      await api.ingestSession(sessionId);
      // Reload sessions to get updated ingestion status
      await loadSessions();
      // Reload current session if it's the one we just ingested
      if (sessionId === currentSessionId) {
        await switchSession(sessionId);
      }
    } catch (error) {
      console.error("Failed to ingest session:", error);
      alert(error instanceof Error ? error.message : "Failed to ingest session");
    } finally {
      setIngestingSessionId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Session List - header removed (SlideOverDrawer provides it) */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-8 w-8 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400">
              No chats yet
            </p>
            <button
              onClick={handleNewChat}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Start chatting
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group relative flex w-full flex-col items-start rounded-lg p-3
                  transition-colors cursor-pointer
                  ${
                    session.id === currentSessionId
                      ? "bg-blue-950/30 border-l-2 border-blue-500"
                      : "hover:bg-zinc-800 border-l-2 border-transparent"
                  }
                `}
                onClick={() => handleSwitchSession(session.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p
                        className={`
                          truncate text-sm font-medium
                          ${
                            session.id === currentSessionId
                              ? "text-blue-100"
                              : "text-zinc-100"
                          }
                        `}
                      >
                        {session.name}
                      </p>
                      {session.ingestionStatus && (
                        <span
                          className={`
                            rounded-full px-1.5 py-0.5 text-[10px] font-medium
                            ${
                              session.ingestionStatus.ingested
                                ? session.ingestionStatus.hasNewMessages
                                  ? "bg-amber-600/20 text-amber-400"
                                  : "bg-green-600/20 text-green-400"
                                : "bg-zinc-700 text-zinc-400"
                            }
                          `}
                          title={
                            session.ingestionStatus.ingested
                              ? session.ingestionStatus.hasNewMessages
                                ? "Ingested (has new messages)"
                                : `Ingested (${session.ingestionStatus.chunkCount} chunks)`
                              : "Not ingested"
                          }
                        >
                          {session.ingestionStatus.ingested
                            ? session.ingestionStatus.hasNewMessages
                              ? "⚠"
                              : "✓"
                            : "○"}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {session.messageCount} messages •{" "}
                      {formatDistanceToNow(session.lastActivity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {session.messageCount > 0 && (
                      <button
                        onClick={(e) => handleIngestSession(session.id, e)}
                        className="p-1 text-zinc-500 hover:text-blue-400"
                        aria-label="Ingest to journal"
                        title="Ingest session to journal RAG"
                        disabled={ingestingSessionId === session.id}
                      >
                        {ingestingSessionId === session.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Database className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-zinc-500 hover:text-red-400"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
