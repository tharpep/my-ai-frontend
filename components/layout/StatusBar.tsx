"use client";

import { useChatStore } from "@/stores/chatStore";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StatusBarProps {
  showModel?: boolean;
  showRAG?: boolean;
  showSession?: boolean;
}

/**
 * StatusBar - Global context footer
 * Shows current model, RAG status, and session info
 */
export function StatusBar({
  showModel = true,
  showRAG = true,
  showSession = true,
}: StatusBarProps) {
  const { currentSessionId, sessions } = useChatStore();
  const [docCount, setDocCount] = useState<number>(0);
  const [ragEnabled, setRagEnabled] = useState<boolean>(false);
  const [model, setModel] = useState<string>("llama3.2");

  // Get current session data
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const sessionName = currentSession?.title || "Untitled";

  // Fetch config and document count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get config for RAG status and model
        const configResponse = await api.getConfig();
        setRagEnabled(configResponse.config.chat_context_enabled || false);

        // Get current model based on provider
        const provider = configResponse.config.provider_name;
        if (provider === "ollama") {
          setModel(configResponse.config.model_ollama || "llama3.2");
        } else if (provider === "anthropic") {
          setModel(configResponse.config.model_anthropic || "claude-3-5-sonnet");
        } else if (provider === "purdue") {
          setModel(configResponse.config.model_purdue || "purdue-model");
        }

        // Get document count
        const blobsResponse = await api.listBlobs();
        setDocCount(blobsResponse.blobs.length);
      } catch (error) {
        // Silently fail - use defaults
        console.error("Failed to fetch status bar data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-8 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          {showModel && (
            <span>
              Model: <span className="text-zinc-200">{model}</span>
            </span>
          )}
          {showRAG && (
            <span>
              RAG:{" "}
              {ragEnabled ? (
                <>
                  <span className="text-green-400">Enabled</span>
                  {docCount > 0 && (
                    <span className="text-zinc-500"> ({docCount} docs)</span>
                  )}
                </>
              ) : (
                <span className="text-zinc-500">Disabled</span>
              )}
            </span>
          )}
        </div>
        {showSession && (
          <div>
            <span>
              Session: <span className="text-zinc-200">{sessionName}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
