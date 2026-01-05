"use client";

import { useState } from "react";
import { Search, Sparkles, FileText, MessageSquare, Brain, X } from "lucide-react";
import { ProfileSwitcher } from "@/components/features/chat/ProfileSwitcher";

// Mock context data
const mockContexts = [
  {
    type: "document",
    title: "API Documentation.md",
    snippet: "The authentication endpoint requires a Bearer token...",
    relevance: 0.94,
  },
  {
    type: "chat",
    title: "Previous conversation (2 days ago)",
    snippet: "We discussed implementing OAuth2 for the API...",
    relevance: 0.87,
  },
  {
    type: "document",
    title: "Project Requirements.pdf",
    snippet: "Security requirements mandate JWT tokens with...",
    relevance: 0.82,
  },
];

export default function ContinuousPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [showContext, setShowContext] = useState(true);

  return (
    <div className="flex h-full bg-zinc-950">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <h1 className="text-lg font-semibold text-zinc-100">Infinite Assistant</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
              <Sparkles className="h-3 w-3" />
              <span>Context-aware across all history</span>
            </div>
          </div>
          <ProfileSwitcher />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-2xl text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-950/30">
                  <Brain className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-zinc-100">
                  Your Infinite Knowledge Assistant
                </h2>
                <p className="mb-6 text-zinc-400">
                  Ask me anything. I have access to all your past conversations and documents.
                  No need to remember which chat or file - I'll find the relevant context automatically.
                </p>
                <div className="grid gap-3 text-left">
                  <button className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <div className="font-medium text-zinc-100 mb-1">
                      💡 "What did we discuss about authentication?"
                    </div>
                    <div className="text-xs text-zinc-500">
                      Searches across all your chats automatically
                    </div>
                  </button>
                  <button className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <div className="font-medium text-zinc-100 mb-1">
                      📚 "Summarize my API documentation"
                    </div>
                    <div className="text-xs text-zinc-500">
                      Pulls from all relevant documents
                    </div>
                  </button>
                  <button className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                    <div className="font-medium text-zinc-100 mb-1">
                      🔗 "Connect the dots between project X and Y"
                    </div>
                    <div className="text-xs text-zinc-500">
                      Finds relationships across all your knowledge
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-900 text-zinc-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800 bg-zinc-900 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything... I'll search across all your knowledge"
                  rows={1}
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (query.trim()) {
                        setMessages([...messages, { role: "user", content: query }]);
                        setQuery("");
                      }
                    }
                  }}
                />
                <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span>Enter to send • Shift+Enter for new line</span>
                  <button
                    onClick={() => setShowContext(!showContext)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showContext ? "Hide" : "Show"} context sources
                  </button>
                </div>
              </div>
              <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      {showContext && (
        <div className="w-80 border-l border-zinc-800 bg-zinc-900 overflow-y-auto">
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-zinc-500" />
                <h3 className="font-semibold text-zinc-100">Context Sources</h3>
              </div>
              <button
                onClick={() => setShowContext(false)}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Relevant info automatically retrieved
            </p>
          </div>

          <div className="p-4 space-y-3">
            {mockContexts.map((ctx, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-2 flex items-start gap-2">
                  {ctx.type === "document" ? (
                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-400" />
                  ) : (
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-green-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-300 truncate">
                      {ctx.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 line-clamp-2">
                      {ctx.snippet}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">
                    {ctx.type === "document" ? "Document" : "Past Chat"}
                  </span>
                  <div className="flex items-center gap-1">
                    <div
                      className="h-1 w-12 rounded-full bg-zinc-800"
                      style={{
                        background: `linear-gradient(to right, rgb(34 197 94) ${ctx.relevance * 100}%, rgb(39 39 42) ${ctx.relevance * 100}%)`,
                      }}
                    />
                    <span className="text-xs font-mono text-green-400">
                      {(ctx.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 p-4">
            <div className="rounded-lg bg-zinc-950 p-3 text-xs text-zinc-500">
              <div className="mb-1 font-medium text-zinc-400">💡 Pro Tip</div>
              Your questions automatically search across all chats and documents. No need to
              specify which chat or file!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
