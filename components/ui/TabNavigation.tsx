"use client";

import { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * TabNavigation - Horizontal tab navigation component
 * Accessible with keyboard navigation and ARIA attributes
 */
export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-zinc-800">
      <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                }
              `}
            >
              {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
}

/**
 * TabPanel - Content container for a tab
 */
export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className="py-6"
    >
      {children}
    </div>
  );
}
