"use client";

import { useState, useRef, useEffect } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Send, Loader2, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    model?: string;
    provider?: string;
    tokens?: number;
    requestId?: string;
  };
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const response = await api.chatCompletion({
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.choices[0]?.message?.content || "",
        metadata: {
          model: response.model,
          provider: response.provider,
          tokens: response.usage?.total_tokens,
          requestId: response.request_id,
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

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-700">
        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Chat</h3>
      </div>

      <div className="flex h-96 flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              placeholder="Type a message..."
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

