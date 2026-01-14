"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface SlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: "sm" | "md" | "lg";
  side?: "left" | "right";
}

/**
 * SlideOverDrawer - Reusable slide-over drawer component
 * Overlays content with backdrop blur, slides in from left or right
 */
export function SlideOverDrawer({
  isOpen,
  onClose,
  children,
  title,
  width = "md",
  side = "left",
}: SlideOverDrawerProps) {
  const widthClass = {
    sm: "w-64",
    md: "w-80",
    lg: "w-96",
  }[width];

  const slideClass = side === "left"
    ? "left-0"
    : "right-0";

  const translateClass = side === "left"
    ? isOpen ? "translate-x-0" : "-translate-x-full"
    : isOpen ? "translate-x-0" : "translate-x-full";

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 ${slideClass} bottom-0 z-50
          ${widthClass}
          transform transition-transform duration-300 ease-in-out
          ${translateClass}
          bg-zinc-900 border-r border-zinc-800 shadow-2xl
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
