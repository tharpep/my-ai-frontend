"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Code, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useThemeStore, Theme } from "@/stores/themeStore";

/**
 * App Header - Navigation and theme toggle
 */
export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useThemeStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function applyTheme(theme: Theme) {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }

  const isActive = (path: string) => pathname === path;

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Logo/Brand */}
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-100 hover:text-blue-400"
        >
          My AI
        </Link>

        {/* Center: Navigation with Dropdowns */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Chat Options */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("chat")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                ["/", "/continuous"].includes(pathname)
                  ? "bg-blue-950/30 text-blue-100"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              Chat
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "chat" && (
              <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  <div className="font-medium">Session-based</div>
                  <div className="text-xs text-zinc-500">Classic chat sessions</div>
                </Link>
                <Link
                  href="/continuous"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  <div className="font-medium">Continuous (Infinite)</div>
                  <div className="text-xs text-zinc-500">One conversation, infinite memory</div>
                </Link>
              </div>
            )}
          </div>

          {/* Documents */}
          <Link
            href="/documents"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive("/documents") ? "bg-blue-950/30 text-blue-100" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            Documents
          </Link>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("tools")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                ["/playground", "/rag-visualizer", "/agents"].includes(pathname)
                  ? "bg-blue-950/30 text-blue-100"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              Tools
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "tools" && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                <Link
                  href="/playground"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Playground
                </Link>
                <Link
                  href="/rag-visualizer"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  RAG Visualizer
                </Link>
                <Link
                  href="/agents"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Custom Agents
                </Link>
              </div>
            )}
          </div>

          {/* Insights Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("insights")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                ["/sessions", "/analytics"].includes(pathname)
                  ? "bg-blue-950/30 text-blue-100"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              Insights
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "insights" && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                <Link
                  href="/sessions"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Chat History
                </Link>
                <Link
                  href="/analytics"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Analytics
                </Link>
              </div>
            )}
          </div>

          {/* Config Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("config")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                ["/prompts", "/settings", "/dev"].includes(pathname)
                  ? "bg-blue-950/30 text-blue-100"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              Config
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "config" && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                <Link
                  href="/prompts"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Prompts Library
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Settings
                </Link>
                <div className="my-1 border-t border-zinc-800" />
                <Link
                  href="/dev"
                  className="block px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-800"
                  onClick={() => setOpenDropdown(null)}
                >
                  Dev Tools
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800"
          aria-label={`Current theme: ${theme}. Click to cycle.`}
          title={`Theme: ${theme} (click to cycle)`}
        >
          <ThemeIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
