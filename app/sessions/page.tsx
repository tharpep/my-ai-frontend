"use client";

import { useChatStore } from "@/stores/chatStore";
import { MessageSquare, Trash2, Calendar, MessageCircle, Search } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Chat History</h1>
          <p className="mt-2 text-zinc-400">
            View and manage all your conversation sessions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-950/30 p-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{sessions.length}</p>
                <p className="text-xs text-zinc-500">Total Sessions</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-950/30 p-2">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {sessions.reduce((sum, s) => sum + s.messageCount, 0)}
                </p>
                <p className="text-xs text-zinc-500">Total Messages</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-950/30 p-2">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {sessions.length > 0 ? formatDistanceToNow(Math.max(...sessions.map(s => s.lastActivity))) : 'N/A'}
                </p>
                <p className="text-xs text-zinc-500">Last Activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-100">
            All Sessions ({filteredSessions.length})
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
            <div className="space-y-2">
              {filteredSessions
                .sort((a, b) => b.lastActivity - a.lastActivity)
                .map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleOpenSession(session.id)}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-850"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="rounded-lg bg-zinc-800 p-2">
                        <MessageSquare className="h-5 w-5 text-zinc-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-zinc-100">
                          {session.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                          <span>{session.messageCount} messages</span>
                          <span>•</span>
                          <span>{formatDate(session.createdAt)}</span>
                          <span>•</span>
                          <span>Updated {formatDistanceToNow(session.lastActivity)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="rounded p-2 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
