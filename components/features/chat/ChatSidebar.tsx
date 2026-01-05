"use client";

import { useChatStore } from "@/stores/chatStore";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
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
  } = useChatStore();

  const handleNewChat = () => {
    createSession("New Chat");
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this chat session?")) {
      deleteSession(sessionId);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-700 p-4">
        <h2 className="text-sm font-semibold text-zinc-100">
          Chats
        </h2>
        <button
          onClick={handleNewChat}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Session List */}
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
                      ? "bg-blue-950/30"
                      : "hover:bg-zinc-800"
                  }
                `}
                onClick={() => switchSession(session.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
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
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {session.messageCount} messages •{" "}
                      {formatDistanceToNow(session.lastActivity)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
