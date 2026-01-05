"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ChatMessage } from "./ChatMessage";
import { MessageSquare } from "lucide-react";

/**
 * Chat Messages - Displays message history with auto-scroll
 * 
 * ChatGPT-style message flow
 */
export function ChatMessages() {
  const { getCurrentMessages, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const messages = getCurrentMessages();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto"
    >
      <div className="mx-auto max-w-3xl px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-zinc-800 p-6">
              <MessageSquare className="h-12 w-12 text-zinc-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-zinc-100">
              Start a conversation
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Ask me anything, upload documents, or just chat!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-16 animate-pulse rounded bg-zinc-700" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-700" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-700" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
