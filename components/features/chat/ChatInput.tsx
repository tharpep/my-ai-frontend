"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useChatStore } from "@/stores/chatStore";
import { api, ApiClientError } from "@/lib/api";
import { Send, Paperclip, Loader2 } from "lucide-react";

/**
 * Chat Input Component
 * 
 * Message input with file upload and send functionality
 */
export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    addMessage,
    setLoading,
    setError,
    isLoading,
    getCurrentSession,
  } = useChatStore();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentSession = getCurrentSession();
    if (!currentSession) {
      setError("No active session. Please create a new chat.");
      return;
    }

    const userMessage = input.trim();
    setInput("");

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    });

    setLoading(true);
    setError(null);

    try {
      const response = await api.chat({
        messages: [{ role: "user", content: userMessage }],
        session_id: currentSession.id,
      });

      // Add assistant message
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.choices[0].message.content,
        timestamp: Date.now(),
        metadata: {
          model: response.model,
          ragContext: response.rag_context,
          requestId: response.request_id,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof ApiClientError
        ? error.message
        : "Failed to send message. Please try again.";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-end gap-2">
          {/* File Upload Button */}
          <button
            className="flex-shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={1}
              className="w-full resize-none rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
