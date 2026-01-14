"use client";

import { ReactNode } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variant?: "primary" | "secondary";
}

/**
 * FloatingActionButton - Floating action button with icon
 * Used for primary actions like "+ New Chat"
 */
export function FloatingActionButton({
  onClick,
  icon,
  label,
  position = "top-right",
  variant = "primary",
}: FloatingActionButtonProps) {
  const positionClass = {
    "top-left": "top-16 left-4",
    "top-right": "top-16 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }[position];

  const variantClass = variant === "primary"
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 shadow-lg";

  return (
    <button
      onClick={onClick}
      className={`
        fixed ${positionClass} z-20
        flex items-center gap-2
        rounded-lg px-4 py-2
        text-sm font-medium
        transition-all duration-200
        hover:scale-105
        ${variantClass}
      `}
      aria-label={label}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
