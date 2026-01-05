"use client";

import { useState } from "react";
import { Message } from "@/stores/chatStore";
import { User, MessageSquare, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { RAGContext } from "@/lib/api";

interface ChatMessageProps {
  message: Message;
}

/**
 * Individual Chat Message Component
 * 
 * Displays user/assistant messages with optional RAG context
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const [ragExpanded, setRagExpanded] = useState(false);

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
        {isUser ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            {isUser ? "You" : "AI Assistant"}
          </span>
        </div>

        <div className="mt-1 text-sm text-zinc-300">
          {message.content}
        </div>

        {/* RAG Context */}
        {ragContext && (
          <div className="mt-3">
            <button
              onClick={() => setRagExpanded(!ragExpanded)}
              className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
            >
              <FileText className="h-3 w-3" />
              {ragExpanded ? "Hide" : "Show"} Context
              {ragExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {ragExpanded && (
              <div className="mt-2 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs">
                {ragContext.library_context && ragContext.library_context.length > 0 && (
                  <div>
                    <p className="font-semibold text-zinc-100">
                      Library ({ragContext.library_context.length} documents)
                    </p>
                    <p className="mt-1 text-zinc-400">
                      {ragContext.library_context
                        .map((doc: any) => doc.metadata?.filename || "Unknown")
                        .join(", ")}
                    </p>
                  </div>
                )}

                {ragContext.journal_context && ragContext.journal_context.length > 0 && (
                  <div>
                    <p className="font-semibold text-zinc-100">
                      Journal ({ragContext.journal_context.length} entries)
                    </p>
                    <p className="mt-1 text-zinc-400">
                      Previous conversation history included
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
