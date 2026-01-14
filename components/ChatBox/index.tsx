"use client";

import { useState, useRef, useEffect } from "react";
import { api, ApiClientError, ConfigValues, RAGContext } from "@/lib/api";
import { Send, Loader2, MessageSquare, ChevronDown, ChevronUp, FileText, History, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    requestId?: string;
    ragContext?: RAGContext;
  };
}

function RAGContextDisplay({ context }: { context: RAGContext }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"library" | "journal" | null>(null);

  return (
    <div className="mt-3 rounded border border-zinc-300/50 bg-zinc-50/50 dark:border-zinc-600/50 dark:bg-zinc-800/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
      >
        <span className="flex items-center gap-2">
          <FileText className="h-3 w-3" />
          RAG Context
          {context.library.enabled && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {context.library.doc_count} docs
            </span>
          )}
          {context.journal.enabled && (
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              {context.journal.entry_count} entries
            </span>
          )}
        </span>
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-zinc-300/50 p-2 space-y-3 text-xs dark:border-zinc-600/50">
          {/* Timing */}
          <div className="text-zinc-600 dark:text-zinc-400">
            <p>Prep: {context.prep_time_ms.toFixed(1)}ms • LLM: {context.llm_time_ms.toFixed(1)}ms</p>
          </div>

          {/* Library Context */}
          {context.library.enabled && (
            <div className="rounded border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => setExpandedSection(expandedSection === "library" ? null : "library")}
                className="flex w-full items-center justify-between text-left font-medium text-zinc-700 dark:text-zinc-300"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  Library ({context.library.doc_count} docs)
                </span>
                {expandedSection === "library" ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expandedSection === "library" && (
                <div className="mt-2 space-y-2">
                  {context.library.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Doc {idx + 1}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Similarity: {(doc.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400">{doc.text}</p>
                    </div>
                  ))}
                  {context.library.context_text && (
                    <div className="mt-2 rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
                      <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">
                        Context Text:
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {context.library.context_text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Journal Context */}
          {context.journal.enabled && (
            <div className="rounded border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => setExpandedSection(expandedSection === "journal" ? null : "journal")}
                className="flex w-full items-center justify-between text-left font-medium text-zinc-700 dark:text-zinc-300"
              >
                <span className="flex items-center gap-2">
                  <History className="h-3 w-3" />
                  Journal ({context.journal.entry_count} entries)
                </span>
                {expandedSection === "journal" ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {expandedSection === "journal" && (
                <div className="mt-2 space-y-2">
                  {context.journal.entries.map((entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          Entry {idx + 1}
                        </span>
                        {entry.similarity && (
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Similarity: {(entry.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                        {entry.session_name && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {entry.session_name}
                          </span>
                        )}
                      </div>
                      {entry.text || entry.content ? (
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {entry.text || entry.content}
                        </p>
                      ) : (
                        <pre className="text-[10px] text-zinc-600 dark:text-zinc-400">
                          {JSON.stringify(entry, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                  {context.journal.context_text && (
                    <div className="mt-2 rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
                      <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-300">
                        Context Text:
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {context.journal.context_text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigValues | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load dev config from localStorage on mount
  useEffect(() => {
    const loadDevConfig = () => {
      try {
        const stored = localStorage.getItem("dev-page-config");
        if (stored) {
          setConfig(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load dev config for chat:", error);
      }
    };
    loadDevConfig();
    
    // Listen for config changes (when user saves in ConfigSection)
    const handleStorageChange = () => {
      loadDevConfig();
    };
    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    window.addEventListener("devConfigChanged", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("devConfigChanged", handleStorageChange);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      // Use config values for context settings, with fallbacks if config not loaded
      const useLibrary = config?.chat_context_enabled && config?.chat_library_enabled;
      const useJournal = config?.chat_context_enabled && config?.chat_journal_enabled;
      
      const response = await api.chatCompletion({
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        use_library: useLibrary ?? undefined,
        use_journal: useJournal ?? undefined,
        library_top_k: config?.chat_library_top_k ?? undefined,
        journal_top_k: config?.chat_journal_top_k ?? undefined,
        // No session_id - dev page doesn't save messages
        save_messages: false, // Explicitly don't save messages
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "",
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.usage?.total_tokens,
          requestId: response.request_id,
          ragContext: response.rag_context,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.message
          : "Failed to send message";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isContextEnabled = config?.chat_context_enabled && (config?.chat_library_enabled || config?.chat_journal_enabled);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Chat</h3>
          {isContextEnabled && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              Context
            </span>
          )}
          <button
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            title="Clear chat"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        {config && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              {config.chat_library_enabled && (
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-700">Library</span>
              )}
            {config.chat_journal_enabled && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-700">Journal</span>
            )}
          </div>
          </div>
        )}
      </div>

      <div className="flex h-96 flex-col">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Start a conversation...
            </p>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.metadata && (
                    <div className="mt-2 space-y-1 border-t border-zinc-300/30 pt-2 text-xs opacity-75">
                      {message.metadata.provider && (
                        <p>Provider: {message.metadata.provider}</p>
                      )}
                      {message.metadata.model && (
                        <p>Model: {message.metadata.model}</p>
                      )}
                      {message.metadata.tokens && (
                        <p>Tokens: {message.metadata.tokens}</p>
                      )}
                      {message.metadata.requestId && (
                        <p className="font-mono text-[10px]">
                          ID: {message.metadata.requestId}
                        </p>
                      )}
                    </div>
                  )}
                  {message.metadata?.ragContext && (
                    <RAGContextDisplay context={message.metadata.ragContext} />
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-700">
                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="border-t border-zinc-200 bg-red-50 p-2 text-sm text-red-600 dark:border-zinc-700 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message... (Press Enter to send)"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

