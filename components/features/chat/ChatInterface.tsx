"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Menu, X } from "lucide-react";

/**
 * Chat Title Component - Shows current session name
 */
function ChatTitle() {
  const { getCurrentSession } = useChatStore();
  const session = getCurrentSession();
  
  return (
    <h1 className="text-sm font-medium text-zinc-100">
      {session?.name || "New Chat"}
    </h1>
  );
}

/**
 * Main Chat Interface - Container component
 * 
 * Layout: Discord-style collapsible sidebar + ChatGPT-style message area
 */
export function ChatInterface() {
  const { sidebarOpen, toggleSidebar, currentSessionId, createSession } = useChatStore();

  // Initialize with a default session if none exists
  useEffect(() => {
    const sessions = useChatStore.getState().sessions;
    if (sessions.length === 0) {
      createSession("New Chat");
    } else if (!currentSessionId && sessions.length > 0) {
      useChatStore.getState().switchSession(sessions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950">
      {/* Sidebar */}
      <div
        className={`
          flex-shrink-0 border-r border-zinc-700 bg-zinc-900 transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-0"}
        `}
      >
        {sidebarOpen && <ChatSidebar />}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1 text-center">
            <ChatTitle />
          </div>

          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden bg-zinc-950">
          <ChatMessages />
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-700 bg-zinc-900 p-4">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
