import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIProfile {
  id: string;
  name: string;
  provider: "ollama" | "anthropic" | "purdue";
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  ragEnabled: boolean;
  libraryEnabled: boolean;
  journalEnabled: boolean;
  topK: number;
  icon?: string; // emoji or icon identifier
  color?: string; // for visual identification
}

interface ProfilesStore {
  profiles: AIProfile[];
  activeProfileId: string | null;
  
  // Actions
  addProfile: (profile: Omit<AIProfile, "id">) => void;
  updateProfile: (id: string, updates: Partial<AIProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  getActiveProfile: () => AIProfile | null;
}

const defaultProfiles: AIProfile[] = [
  {
    id: "default-ollama",
    name: "Local (Fast)",
    provider: "ollama",
    model: "llama3.2:latest",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    ragEnabled: true,
    libraryEnabled: true,
    journalEnabled: true,
    topK: 5,
    icon: "🚀",
    color: "blue",
  },
  {
    id: "default-claude",
    name: "Claude (Smart)",
    provider: "anthropic",
    model: "claude-3-sonnet",
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    ragEnabled: true,
    libraryEnabled: true,
    journalEnabled: true,
    topK: 7,
    icon: "🧠",
    color: "purple",
  },
  {
    id: "creative",
    name: "Creative Writer",
    provider: "ollama",
    model: "llama3.2:latest",
    temperature: 0.9,
    maxTokens: 3000,
    topP: 0.95,
    ragEnabled: false,
    libraryEnabled: false,
    journalEnabled: false,
    topK: 3,
    icon: "✨",
    color: "pink",
  },
];

export const useProfilesStore = create<ProfilesStore>()(
  persist(
    (set, get) => ({
      profiles: defaultProfiles,
      activeProfileId: "default-ollama",

      addProfile: (profile) => {
        const newProfile: AIProfile = {
          ...profile,
          id: `profile-${Date.now()}`,
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
        }));
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProfile: (id) => {
        set((state) => {
          const newProfiles = state.profiles.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProfileId === id && newProfiles.length > 0
              ? newProfiles[0].id
              : state.activeProfileId;
          return {
            profiles: newProfiles,
            activeProfileId: newActiveId,
          };
        });
      },

      setActiveProfile: (id) => {
        set({ activeProfileId: id });
      },

      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
      },
    }),
    {
      name: "ai-profiles",
    }
  )
);
