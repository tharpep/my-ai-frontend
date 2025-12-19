"use client";

import { useState, useEffect } from "react";
import { api, ApiClientError, ConfigValues } from "@/lib/api";
import { Settings, Save, RefreshCw, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

export function ConfigSection() {
  const [config, setConfig] = useState<ConfigValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await api.getConfig();
      setConfig(response.config);
    } catch (error) {
      console.error("Failed to load config:", error);
      setMessage({
        type: "error",
        text: error instanceof ApiClientError ? error.message : "Failed to load config",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates: any = {};
      
      // Send all configurable values (including false booleans and empty strings)
      // Only skip undefined/null values
      if (config.provider_name !== undefined) updates.provider_name = config.provider_name;
      if (config.model_ollama !== undefined) updates.model_ollama = config.model_ollama;
      if (config.model_purdue !== undefined) updates.model_purdue = config.model_purdue;
      if (config.model_anthropic !== undefined) updates.model_anthropic = config.model_anthropic;
      if (config.chat_context_enabled !== undefined) updates.chat_context_enabled = config.chat_context_enabled;
      if (config.chat_library_enabled !== undefined) updates.chat_library_enabled = config.chat_library_enabled;
      if (config.chat_library_top_k !== undefined) updates.chat_library_top_k = config.chat_library_top_k;
      if (config.chat_library_similarity_threshold !== undefined) updates.chat_library_similarity_threshold = config.chat_library_similarity_threshold;
      if (config.chat_journal_enabled !== undefined) updates.chat_journal_enabled = config.chat_journal_enabled;
      if (config.chat_journal_top_k !== undefined) updates.chat_journal_top_k = config.chat_journal_top_k;
      if (config.library_chunk_size !== undefined) updates.library_chunk_size = config.library_chunk_size;
      if (config.library_chunk_overlap !== undefined) updates.library_chunk_overlap = config.library_chunk_overlap;
      if (config.embedding_model !== undefined) updates.embedding_model = config.embedding_model;
      if (config.log_output !== undefined) updates.log_output = config.log_output;

      const response = await api.updateConfig(updates);
      
      setMessage({
        type: "success",
        text: response.message,
      });
      
      // Reload config to get any server-side adjustments
      await loadConfig();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof ApiClientError ? error.message : "Failed to update config",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Failed to load configuration
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">Configuration</h3>
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
            placeholder="bge-m3"
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
            onClick={loadConfig}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

