"use client";

import { useState, useEffect } from "react";
import { ConfigValues } from "@/lib/api";
import { Settings, Save, RefreshCw, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// Default dev config (separate from backend)
const DEFAULT_DEV_CONFIG: ConfigValues = {
  provider_type: "llm",
  provider_name: "ollama",
  provider_fallback: "ollama",
  model_ollama: "llama3.2:latest",
  model_purdue: "llama3.1:latest",
  model_anthropic: "claude-3-sonnet",
  chat_context_enabled: true,
  chat_library_enabled: true,
  chat_library_top_k: 5,
  chat_library_similarity_threshold: 0.3,
  chat_library_use_cache: true,
  chat_journal_enabled: true,
  chat_journal_top_k: 3,
  library_collection_name: "library_docs",
  library_chunk_size: 1000,
  library_chunk_overlap: 100,
  storage_use_persistent: true,
  embedding_model: "nomic-embed-text",
  hardware_mode: "local",
  qdrant_host: "localhost",
  qdrant_port: 6333,
  redis_host: "localhost",
  redis_port: 6379,
  blob_storage_path: "./storage/blobs",
  worker_job_timeout: 300,
  log_output: false,
  purdue_api_key_set: false,
  anthropic_api_key_set: false,
  openai_api_key_set: false,
};

const LOCAL_STORAGE_KEY = "dev-page-config";

export function ConfigSection() {
  const [config, setConfig] = useState<ConfigValues>(DEFAULT_DEV_CONFIG);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load dev config:", error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      setMessage({
        type: "success",
        text: "Dev config saved locally",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save dev config",
      });
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_DEV_CONFIG);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMessage({
      type: "success",
      text: "Reset to default dev config",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Dev Configuration</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Local Only
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/20 dark:text-green-200"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Provider */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Provider
          </label>
          <select
            value={config.provider_name}
            onChange={(e) => setConfig({ ...config, provider_name: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="ollama">Ollama</option>
            <option value="purdue">Purdue</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>

        {/* Models */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ollama Model
            </label>
            <input
              type="text"
              value={config.model_ollama}
              onChange={(e) => setConfig({ ...config, model_ollama: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Purdue Model
            </label>
            <input
              type="text"
              value={config.model_purdue}
              onChange={(e) => setConfig({ ...config, model_purdue: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Anthropic Model
            </label>
            <input
              type="text"
              value={config.model_anthropic}
              onChange={(e) => setConfig({ ...config, model_anthropic: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>

        {/* Context Settings */}
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/50">
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Context Settings</h4>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.chat_context_enabled}
              onChange={(e) => setConfig({ ...config, chat_context_enabled: e.target.checked })}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Enable Context Injection</span>
          </label>

          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800">
            <h5 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Library (Documents)</h5>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.chat_library_enabled}
                onChange={(e) => setConfig({ ...config, chat_library_enabled: e.target.checked })}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Enable Library Context</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Library Top K
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.chat_library_top_k}
                  onChange={(e) => setConfig({ ...config, chat_library_top_k: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Similarity Threshold
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.chat_library_similarity_threshold}
                  onChange={(e) => setConfig({ ...config, chat_library_similarity_threshold: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800">
            <h5 className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Journal (Chat History)</h5>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.chat_journal_enabled}
                onChange={(e) => setConfig({ ...config, chat_journal_enabled: e.target.checked })}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Enable Journal Context</span>
            </label>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Journal Top K
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={config.chat_journal_top_k}
                onChange={(e) => setConfig({ ...config, chat_journal_top_k: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Chunk Size
              </label>
              <input
                type="number"
                min={100}
                max={5000}
                value={config.library_chunk_size || 1000}
                onChange={(e) => setConfig({ ...config, library_chunk_size: parseInt(e.target.value) || 1000 })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Default: 1000 characters
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Chunk Overlap
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={config.library_chunk_overlap ?? 100}
                onChange={(e) => setConfig({ ...config, library_chunk_overlap: parseInt(e.target.value) || 100 })}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Default: 100 characters
              </p>
            </div>
          </div>
        </div>

        {/* Embedding Model */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Embedding Model
          </label>
          <input
            type="text"
            value={config.embedding_model || ""}
            placeholder="nomic-embed-text"
            onChange={(e) => setConfig({ ...config, embedding_model: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>

        {/* Logging */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.log_output}
            onChange={(e) => setConfig({ ...config, log_output: e.target.checked })}
            className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Verbose Logging</span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Export function to get current dev config for ChatBox
export function getDevConfig(): ConfigValues {
  if (typeof window === "undefined") return DEFAULT_DEV_CONFIG;
  
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to load dev config:", error);
    }
  }
  return DEFAULT_DEV_CONFIG;
}