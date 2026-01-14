"use client";

import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  showStatusBar?: boolean;
  maxWidth?: "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

/**
 * AppShell - Unified layout wrapper for all pages
 * Provides consistent structure: header → content → optional status bar
 */
export function AppShell({
  children,
  showStatusBar = false,
  maxWidth = "7xl"
}: AppShellProps) {
  const maxWidthClass = {
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    "full": "max-w-full"
  }[maxWidth];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${maxWidthClass} mx-auto w-full min-h-0`}>
        {children}
      </div>

      {showStatusBar && (
        <div className="h-8 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex h-full items-center justify-between px-4 text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span>Model: <span className="text-zinc-200">llama3.2</span></span>
              <span>RAG: <span className="text-green-400">Enabled</span> (3 docs)</span>
            </div>
            <div>
              <span>Session: <span className="text-zinc-200">Untitled</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
