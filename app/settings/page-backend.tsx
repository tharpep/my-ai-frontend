"use client";

import { useState, useEffect } from "react";
import { api, ConfigValues, ApiClientError } from "@/lib/api";
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getConfig();
      setConfig(response.config);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateConfig({
        provider_name: config.provider_name,
        model_ollama: config.model_ollama,
        model_purdue: config.model_purdue,
        model_anthropic: config.model_anthropic,
        chat_context_enabled: config.chat_context_enabled,
        chat_library_enabled: config.chat_library_enabled,
        chat_library_top_k: config.chat_library_top_k,
        chat_library_similarity_threshold: config.chat_library_similarity_threshold,
        chat_journal_enabled: config.chat_journal_enabled,
        chat_journal_top_k: config.chat_journal_top_k,
        library_chunk_size: config.library_chunk_size,
        library_chunk_overlap: config.library_chunk_overlap,
        embedding_model: config.embedding_model,
        log_output: config.log_output,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Failed to load settings</p>
          <button
            onClick={loadConfig}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Configure your AI assistant behavior and preferences
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-900 dark:bg-red-950/30 dark:text-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-900 dark:bg-green-950/30 dark:text-green-100">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">Settings saved successfully!</p>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Provider Settings */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              AI Provider
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Provider
                </label>
                <select
                  value={config.provider_name}
                  onChange={(e) => setConfig({ ...config, provider_name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="ollama">Ollama</option>
                  <option value="purdue">Purdue</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Ollama Model
                </label>
                <input
                  type="text"
                  value={config.model_ollama}
                  onChange={(e) => setConfig({ ...config, model_ollama: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>
          </section>

          {/* RAG Settings */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              RAG Context
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Enable Context
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Use Library and Journal for enhanced responses
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.chat_context_enabled}
                  onChange={(e) =>
                    setConfig({ ...config, chat_context_enabled: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600"
                />
              </div>

              {config.chat_context_enabled && (
                <>
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Library (Documents)
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Use uploaded documents for context
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.chat_library_enabled}
                      onChange={(e) =>
                        setConfig({ ...config, chat_library_enabled: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600"
                    />
                  </div>

                  {config.chat_library_enabled && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Library Top-K Documents
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={config.chat_library_top_k}
                        onChange={(e) =>
                          setConfig({ ...config, chat_library_top_k: parseInt(e.target.value) })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Journal (Chat History)
                      </label>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Use previous conversations for context
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.chat_journal_enabled}
                      onChange={(e) =>
                        setConfig({ ...config, chat_journal_enabled: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600"
                    />
                  </div>

                  {config.chat_journal_enabled && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Journal Top-K Entries
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={config.chat_journal_top_k}
                        onChange={(e) =>
                          setConfig({ ...config, chat_journal_top_k: parseInt(e.target.value) })
                        }
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Advanced
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Embedding Model
                </label>
                <input
                  type="text"
                  value={config.embedding_model}
                  onChange={(e) => setConfig({ ...config, embedding_model: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Debug Logging
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enable verbose console output
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.log_output}
                  onChange={(e) => setConfig({ ...config, log_output: e.target.checked })}
                  className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={loadConfig}
            disabled={loading || saving}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
