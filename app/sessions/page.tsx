"use client";

import { useChatStore } from "@/stores/chatStore";
import { MessageSquare, Trash2, MessageCircle, Search } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default function SessionsPage() {
  const { sessions, deleteSession, switchSession } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenSession = (sessionId: string) => {
    switchSession(sessionId);
    router.push("/");
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this chat session? This cannot be undone.")) {
      deleteSession(sessionId);
    }
  };


  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <AppShell maxWidth="6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">Chat History</h1>
              <p className="mt-2 text-zinc-400">
                View and manage all your conversation sessions
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Stats - Compact */}
        <div className="mb-6 flex items-center gap-6 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-zinc-400">Sessions:</span>
            <span className="font-medium text-zinc-100">{sessions.length}</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-400" />
            <span className="text-zinc-400">Messages:</span>
            <span className="font-medium text-zinc-100">{sessions.reduce((sum, s) => sum + s.messageCount, 0)}</span>
          </div>
        </div>

        {/* Sessions List */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">
            {filteredSessions.length} {filteredSessions.length === 1 ? 'Session' : 'Sessions'}
            {searchQuery && ` matching "${searchQuery}"`}
          </h2>

          {filteredSessions.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
              {searchQuery ? (
                <>
                  <Search className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-4 text-zinc-400">No sessions found</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Try a different search term
                  </p>
                </>
              ) : (
                <>
                  <MessageSquare className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-4 text-zinc-400">No chat sessions yet</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Start a conversation to see your history here
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions
                .sort((a, b) => b.lastActivity - a.lastActivity)
                .map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleOpenSession(session.id)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 transition-colors hover:border-zinc-700 hover:bg-zinc-850"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-zinc-400" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-zinc-100">
                            {session.name}
                          </h3>
                          {session.ingestionStatus?.ingested && (
                            <span
                              className="rounded-full bg-purple-600/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-400"
                              title={`Ingested (${session.ingestionStatus.chunk_count} chunks)`}
                            >
                              RAG
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                          <span>{session.messageCount} messages</span>
                          <span>•</span>
                          <span>Updated {formatDistanceToNow(session.lastActivity)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="rounded p-1.5 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
    </AppShell>
  );
}
