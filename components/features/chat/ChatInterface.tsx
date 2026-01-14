"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Plus, Menu } from "lucide-react";
import { SlideOverDrawer } from "@/components/layout/SlideOverDrawer";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { StatusBar } from "@/components/layout/StatusBar";

/**
 * Main Chat Interface - Clean workspace layout
 *
 * Layout: Full-height messages + slide-over drawer + floating actions
 */
export function ChatInterface() {
  const { sidebarOpen, toggleSidebar, currentSessionId, createSession, loadSessions, switchSession } = useChatStore();

  // Load sessions from backend on mount
  useEffect(() => {
    const initialize = async () => {
      // Load sessions from backend
      await loadSessions();

      const state = useChatStore.getState();
      const sessions = state.sessions;

      // If no sessions exist, create a new one
      if (sessions.length === 0) {
        createSession("New Chat");
      } else if (!currentSessionId && sessions.length > 0) {
        // Switch to first session and load its messages
        await switchSession(sessions[0].id);
      } else if (currentSessionId) {
        // If we have a current session, make sure its messages are loaded
        const session = sessions.find(s => s.id === currentSessionId);
        if (session && session.messages.length === 0) {
          await switchSession(currentSessionId);
        }
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = () => {
    createSession("New Chat");
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-950">
      {/* Slide-over Drawer for Sessions */}
      <SlideOverDrawer
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
        title="Chats"
        width="md"
        side="left"
      >
        <ChatSidebar />
      </SlideOverDrawer>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        onClick={handleNewChat}
        icon={<Plus className="h-4 w-4" />}
        label="New Chat"
        position="top-right"
        variant="primary"
      />

      <FloatingActionButton
        onClick={toggleSidebar}
        icon={<Menu className="h-4 w-4" />}
        label="History"
        position="top-left"
        variant="secondary"
      />

      {/* Main Chat Area - Full height */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages Area - Fills available space */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages />
        </div>

        {/* Input Area - Minimal styling */}
        <div className="bg-zinc-900/50 backdrop-blur-sm p-3">
          <ChatInput />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
