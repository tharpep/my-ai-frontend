"use client";

import { useState } from "react";
import { useProfilesStore } from "@/stores/profilesStore";
import { ChevronDown, Check, Settings } from "lucide-react";
import Link from "next/link";

export function ProfileSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { profiles, activeProfileId, setActiveProfile } = useProfilesStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  if (!activeProfile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 transition-colors"
      >
        <span className="text-lg">{activeProfile.icon || "🤖"}</span>
        <div className="flex flex-col items-start">
          <span className="font-medium text-zinc-100">{activeProfile.name}</span>
          <span className="text-xs text-zinc-500">{activeProfile.model}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 w-80 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-20">
            <div className="p-2">
              <div className="mb-2 px-2 py-1 text-xs font-semibold text-zinc-500 uppercase">
                AI Profiles
              </div>
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    setActiveProfile(profile.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-xl">{profile.icon || "🤖"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100">{profile.name}</span>
                      {profile.id === activeProfileId && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {profile.provider} • {profile.model}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 p-2">
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Manage Profiles
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
