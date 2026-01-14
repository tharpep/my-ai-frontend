"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { api, ApiClientError } from "@/lib/api";
import { Send, Paperclip, Loader2 } from "lucide-react";

/**
 * Chat Input Component
 * 
 * Message input with file upload and send functionality.
 * Uses backend's saved configuration (set via Settings page).
 */
export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    addMessage,
    setError,
    getCurrentSession,
    isLoading,
    setLoading,
  } = useChatStore();

  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentSession = getCurrentSession();
    if (!currentSession) {
      setError("No active session. Please create a new chat.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
    });

    setLoading(true);
    setError(null);

    try {
      // Send request - backend will use its saved config from Settings page
      const response = await api.chatCompletion({
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
          provider: response.provider,
          tokens: response.usage?.total_tokens,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          ragContext: response.rag_context,
          requestId: response.request_id,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof ApiClientError
        ? error.message
        : "Failed to send message. Please try again.";
      
      setError(errorMessage);

      // Add error message to chat
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Error: ${errorMessage}`,
        timestamp: Date.now(),
      });
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-end gap-2">
        {/* File Upload Button */}
        <button
          className="flex-shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
          aria-label="Attach file"
          disabled
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
            disabled={isLoading}
            style={{ minHeight: '40px', maxHeight: '200px' }}
            className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 rounded-lg bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
  );
}
