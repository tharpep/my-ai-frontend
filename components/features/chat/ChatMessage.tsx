"use client";

import { useState } from "react";
import { Message } from "@/stores/chatStore";
import { User, Bot, ChevronDown, ChevronUp, FileText, History } from "lucide-react";
import { RAGContext } from "@/lib/api";

interface ChatMessageProps {
  message: Message;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * RAG Context Display Component
 */
function RAGContextDisplay({ context }: { context: RAGContext }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
      >
        <FileText className="h-3 w-3" />
        RAG Context
        {context.library.enabled && (
          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
            {context.library.doc_count} docs
          </span>
        )}
        {context.journal.enabled && (
          <span className="rounded bg-purple-600 px-1.5 py-0.5 text-[10px] text-white">
            {context.journal.entry_count} entries
          </span>
        )}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs">
          {/* Timing */}
          <div className="flex justify-between text-zinc-400">
            <span>Prep: {context.prep_time_ms.toFixed(1)}ms</span>
            <span>LLM: {context.llm_time_ms.toFixed(1)}ms</span>
          </div>

          {/* Library Context */}
          {context.library.enabled && context.library.documents.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-zinc-100">
                <FileText className="inline h-3 w-3 mr-1" />
                Library ({context.library.doc_count} documents)
              </p>
              <div className="space-y-2">
                {context.library.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-zinc-700 bg-zinc-800 p-2"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-zinc-300">Doc {idx + 1}</span>
                      <span className="text-zinc-500">
                        {(doc.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-zinc-400">{truncateText(doc.text, 300)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal Context */}
          {context.journal.enabled && context.journal.entry_count > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-zinc-100">
                <History className="inline h-3 w-3 mr-1" />
                Journal ({context.journal.entry_count} entries)
              </p>
              <div className="space-y-2">
                {context.journal.entries && context.journal.entries.length > 0 ? (
                  context.journal.entries.map((entry: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded border border-zinc-700 bg-zinc-800 p-2"
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-zinc-300">Entry {idx + 1}</span>
                        {entry.similarity && (
                          <span className="text-zinc-500">
                            {(entry.similarity * 100).toFixed(1)}% match
                          </span>
                        )}
                        {entry.session_name && (
                          <span className="text-xs text-zinc-500">
                            {entry.session_name}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400">
                        {truncateText(entry.text || entry.content || JSON.stringify(entry), 300)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">
                    Previous conversation history included
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Chat Message Component
 * 
 * Displays user/assistant messages with optional RAG context
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const ragContext = message.metadata?.ragContext;

  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div
        className={`
          flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white
          ${isUser ? "bg-zinc-600" : "bg-blue-600"}
        `}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            {isUser ? "You" : "AI Assistant"}
          </span>
          {message.metadata?.model && (
            <span className="text-xs text-zinc-500">
              {message.metadata.model}
            </span>
          )}
          {message.metadata?.tokens && (
            <span className="text-xs text-zinc-500">
              • {message.metadata.tokens.toLocaleString()} tokens
            </span>
          )}
        </div>

        <div className="mt-1 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* RAG Context */}
        {ragContext && <RAGContextDisplay context={ragContext} />}
      </div>
    </div>
  );
}
