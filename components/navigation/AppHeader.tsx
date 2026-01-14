"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useThemeStore, Theme } from "@/stores/themeStore";

/**
 * App Header - Clean workspace navigation
 * Flattened 2-level hierarchy: Primary links + Tools/Profile dropdowns
 */
export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useThemeStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openDropdown]);

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
  const isActiveGroup = (paths: string[]) => paths.includes(pathname);

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900">
      <div className="flex h-12 items-center justify-between px-4">
        {/* Left: Logo/Brand */}
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-100 hover:text-blue-400 transition-colors"
        >
          My AI
        </Link>

        {/* Center: Primary Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Chat */}
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-blue-950/30 text-blue-100"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            Chat
          </Link>

          {/* Documents */}
          <Link
            href="/documents"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive("/documents")
                ? "bg-blue-950/30 text-blue-100"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            Documents
          </Link>

          {/* Sessions */}
          <Link
            href="/sessions"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive("/sessions")
                ? "bg-blue-950/30 text-blue-100"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            Sessions
          </Link>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("tools");
              }}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActiveGroup(["/playground", "/rag-visualizer", "/agents", "/analytics"])
                  ? "bg-blue-950/30 text-blue-100"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              Tools
              <ChevronDown className="h-3 w-3" />
            </button>
            {openDropdown === "tools" && (
              <div className="absolute left-0 top-full mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg z-50">
                <Link
                  href="/playground"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  Playground
                </Link>
                <Link
                  href="/rag-visualizer"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  RAG Visualizer
                </Link>
                <Link
                  href="/agents"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  Custom Agents
                </Link>
                <div className="my-1 border-t border-zinc-800" />
                <Link
                  href="/analytics"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  Analytics
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Icon Buttons */}
        <div className="flex items-center gap-1">
          {/* Settings Icon Button */}
          <Link
            href="/settings"
            className={`rounded-lg p-2 transition-colors ${
              isActive("/settings")
                ? "bg-blue-950/30 text-blue-400"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("profile");
              }}
              className={`rounded-lg p-2 transition-colors ${
                isActiveGroup(["/prompts", "/dev"])
                  ? "bg-blue-950/30 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              aria-label="Profile menu"
              title="Profile"
            >
              <User className="h-5 w-5" />
            </button>
            {openDropdown === "profile" && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-lg z-50">
                <Link
                  href="/prompts"
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  Prompts Library
                </Link>
                <div className="my-1 border-t border-zinc-800" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleTheme();
                  }}
                  className="flex w-full items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  <span>Theme</span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <ThemeIcon className="h-3 w-3" />
                    {theme}
                  </span>
                </button>
                <div className="my-1 border-t border-zinc-800" />
                <Link
                  href="/dev"
                  className="block px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-800 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  Dev Tools
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
