"use client";

import { useState, useEffect } from "react";
import { api, ApiClientError, ConfigValues } from "@/lib/api";
import { Settings, Save, RefreshCw, CheckCircle2, XCircle, RotateCcw, Loader2, Database, Cpu, Sliders, Key } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TabNavigation, TabPanel } from "@/components/ui/TabNavigation";

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [journalStats, setJournalStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("ai-models");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const loadConfig = async () => {
    setLoading(true);
    setMessage(null);
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
    loadJournalStats();
    loadAvailableModels();
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!saving && !loading && config) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  }, [config, saving, loading]);

  const loadJournalStats = async () => {
    try {
      const stats = await api.getMemoryStats().catch(() => null);
      if (stats && stats.qdrant) {
        setJournalStats({
          collection: stats.qdrant.collection_name || "journal_entries",
          total_documents: stats.qdrant.points_count || 0,
          vector_dimension: stats.qdrant.vector_size || 0,
          storage_type: "server",
          request_id: stats.request_id
        });
      }
    } catch (error) {
      // Silently fail - journal might not be available
    }
  };

  const loadAvailableModels = async () => {
    try {
      const response = await api.listModels();
      const modelIds = response.data.map(model => model.id);
      setAvailableModels(modelIds);
    } catch (error) {
      console.error("Failed to load models:", error);
      // Silently fail - use empty list
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setMessage(null);

    try {
      const updates: any = {};

      // Send all configurable values
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
      if (config.chat_journal_similarity_threshold !== undefined) updates.chat_journal_similarity_threshold = config.chat_journal_similarity_threshold;
      if (config.library_chunk_size !== undefined) updates.library_chunk_size = config.library_chunk_size;
      if (config.library_chunk_overlap !== undefined) updates.library_chunk_overlap = config.library_chunk_overlap;
      if (config.journal_chunk_size !== undefined) updates.journal_chunk_size = config.journal_chunk_size;
      if (config.journal_chunk_overlap !== undefined) updates.journal_chunk_overlap = config.journal_chunk_overlap;
      if (config.embedding_model !== undefined) updates.embedding_model = config.embedding_model;
      if (config.log_output !== undefined) updates.log_output = config.log_output;
      if (config.hybrid_sparse_weight !== undefined) updates.hybrid_sparse_weight = config.hybrid_sparse_weight;
      if (config.rerank_enabled !== undefined) updates.rerank_enabled = config.rerank_enabled;
      if (config.rerank_candidates !== undefined) updates.rerank_candidates = config.rerank_candidates;
      if (config.rerank_model !== undefined) updates.rerank_model = config.rerank_model;
      if (config.query_expansion_enabled !== undefined) updates.query_expansion_enabled = config.query_expansion_enabled;
      if (config.query_expansion_model !== undefined) updates.query_expansion_model = config.query_expansion_model;

      const response = await api.updateConfig(updates);

      setMessage({
        type: "success",
        text: response.message,
      });

      // Reload config to get server-side adjustments
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

  const tabs = [
    { id: "ai-models", label: "AI & Models", icon: <Cpu className="h-4 w-4" /> },
    { id: "rag-context", label: "RAG & Context", icon: <Database className="h-4 w-4" /> },
    { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
    { id: "advanced", label: "Advanced", icon: <Sliders className="h-4 w-4" /> },
  ];

  return (
    <AppShell maxWidth="4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="mt-2 text-zinc-400">
          Configure your AI assistant&apos;s behavior and RAG system
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex justify-end gap-3">
        <button
          onClick={loadConfig}
          disabled={loading || saving}
          className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving || loading || !config}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          title="Save changes (Ctrl/Cmd+S)"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-3 text-sm ${message.type === "success"
            ? "border-green-800 bg-green-950/20 text-green-200"
            : "border-red-800 bg-red-950/20 text-red-200"
            }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-lg text-zinc-400">Loading settings...</p>
        </div>
      ) : !config ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-lg text-zinc-300">Failed to load configuration</p>
          <p className="mt-2 text-sm text-zinc-500">
            Make sure the backend is running at http://localhost:8000
          </p>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* AI & Models Tab */}
          <TabPanel id="ai-models" activeTab={activeTab}>
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-zinc-100">AI Provider & Models</h2>
                <p className="mb-6 text-sm text-zinc-400">
                  Configure which AI provider and models to use for chat completions
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Provider
                    </label>
                    <select
                      value={config.provider_name}
                      onChange={(e) => setConfig({ ...config, provider_name: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ollama">Ollama (Local)</option>
                      <option value="purdue">Purdue API</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                    </select>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Select your preferred AI provider
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Ollama Model
                    </label>
                    <select
                      value={config.model_ollama}
                      onChange={(e) => setConfig({ ...config, model_ollama: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {availableModels.length === 0 ? (
                        <option value={config.model_ollama}>{config.model_ollama || "Loading..."}</option>
                      ) : (
                        availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))
                      )}
                    </select>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Model name for Ollama provider
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Purdue Model
                    </label>
                    <select
                      value={config.model_purdue}
                      onChange={(e) => setConfig({ ...config, model_purdue: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {availableModels.length === 0 ? (
                        <option value={config.model_purdue}>{config.model_purdue || "Loading..."}</option>
                      ) : (
                        availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))
                      )}
                    </select>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Model name for Purdue API
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Anthropic Model
                    </label>
                    <select
                      value={config.model_anthropic}
                      onChange={(e) => setConfig({ ...config, model_anthropic: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {availableModels.length === 0 ? (
                        <option value={config.model_anthropic}>{config.model_anthropic || "Loading..."}</option>
                      ) : (
                        availableModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))
                      )}
                    </select>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Model name for Anthropic provider
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* RAG & Context Tab */}
          <TabPanel id="rag-context" activeTab={activeTab}>
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-zinc-100">RAG Configuration</h2>
                <p className="mb-6 text-sm text-zinc-400">
                  Configure Retrieval-Augmented Generation settings for context injection
                </p>

                {/* Global RAG Toggle */}
                <label className="mb-6 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <input
                    type="checkbox"
                    checked={config.chat_context_enabled}
                    onChange={(e) => setConfig({ ...config, chat_context_enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div>
                    <span className="font-medium text-zinc-200">Enable Context Injection</span>
                    <p className="text-xs text-zinc-500">Inject relevant context from documents and chat history</p>
                  </div>
                </label>

                {/* Library (Documents) */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <h3 className="mb-4 font-medium text-zinc-200">Library (Documents)</h3>

                  <label className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.chat_library_enabled}
                      onChange={(e) => setConfig({ ...config, chat_library_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-zinc-300">Enable Library Context</span>
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-400">
                        Top K Results
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={config.chat_library_top_k}
                        onChange={(e) => setConfig({ ...config, chat_library_top_k: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Number of chunks to retrieve</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-400">
                        Similarity Threshold
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={config.chat_library_similarity_threshold}
                        onChange={(e) => setConfig({ ...config, chat_library_similarity_threshold: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Minimum similarity score (0-1)</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <h4 className="mb-3 text-sm font-medium text-zinc-300">Library Chunking</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-400">
                          Chunk Size
                        </label>
                        <input
                          type="number"
                          min={100}
                          max={5000}
                          value={config.library_chunk_size}
                          onChange={(e) => setConfig({ ...config, library_chunk_size: parseInt(e.target.value) || 1000 })}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Characters per chunk (default: 1000)</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-400">
                          Chunk Overlap
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={config.library_chunk_overlap}
                          onChange={(e) => setConfig({ ...config, library_chunk_overlap: parseInt(e.target.value) || 100 })}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Overlap between chunks (default: 100)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journal (Chat History) */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <h3 className="mb-4 font-medium text-zinc-200">Journal (Chat History)</h3>

                  <label className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.chat_journal_enabled}
                      onChange={(e) => setConfig({ ...config, chat_journal_enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <span className="text-sm text-zinc-300">Enable Journal Context</span>
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-400">
                        Top K Results
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={config.chat_journal_top_k}
                        onChange={(e) => setConfig({ ...config, chat_journal_top_k: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Number of chunks to retrieve</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-400">
                        Similarity Threshold
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        value={config.chat_journal_similarity_threshold ?? config.chat_library_similarity_threshold ?? 0.15}
                        onChange={(e) => setConfig({ ...config, chat_journal_similarity_threshold: parseFloat(e.target.value) || 0.15 })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Minimum similarity score (0-1)</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <h4 className="mb-3 text-sm font-medium text-zinc-300">Journal Chunking</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-400">
                          Chunk Size
                        </label>
                        <input
                          type="number"
                          min={100}
                          max={5000}
                          value={config.journal_chunk_size || 1000}
                          onChange={(e) => setConfig({ ...config, journal_chunk_size: parseInt(e.target.value) || 1000 })}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Characters per chunk (default: 1000)</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-400">
                          Chunk Overlap
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={config.journal_chunk_overlap ?? 100}
                          onChange={(e) => setConfig({ ...config, journal_chunk_overlap: parseInt(e.target.value) || 100 })}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Overlap between chunks (default: 100)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced RAG Settings */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <h3 className="mb-4 font-medium text-zinc-200">Advanced RAG Settings</h3>
                  <p className="mb-4 text-xs text-zinc-500">
                    Fine-tune hybrid search, reranking, and query expansion
                  </p>

                  {/* Hybrid Search Weight */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-zinc-400">
                      Hybrid Sparse Weight ({((config.hybrid_sparse_weight ?? 0.3) * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={config.hybrid_sparse_weight ?? 0.3}
                      onChange={(e) => setConfig({ ...config, hybrid_sparse_weight: parseFloat(e.target.value) })}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>Dense (semantic)</span>
                      <span>Sparse (keyword)</span>
                    </div>
                  </div>

                  {/* Reranking */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <label className="mb-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.rerank_enabled ?? true}
                        onChange={(e) => setConfig({ ...config, rerank_enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-sm text-zinc-300">Enable Cross-Encoder Reranking</span>
                    </label>

                    {config.rerank_enabled && (
                      <div className="grid gap-4 md:grid-cols-2 mt-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-400">Rerank Candidates</label>
                          <input
                            type="number"
                            min={5}
                            max={100}
                            value={config.rerank_candidates ?? 30}
                            onChange={(e) => setConfig({ ...config, rerank_candidates: parseInt(e.target.value) || 30 })}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-400">Reranker Model</label>
                          <input
                            type="text"
                            value={config.rerank_model ?? "BAAI/bge-reranker-v2-m3"}
                            onChange={(e) => setConfig({ ...config, rerank_model: e.target.value })}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Query Expansion */}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <label className="mb-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.query_expansion_enabled ?? true}
                        onChange={(e) => setConfig({ ...config, query_expansion_enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="text-sm text-zinc-300">Enable Query Expansion</span>
                    </label>

                    {config.query_expansion_enabled && (
                      <div className="mt-3">
                        <label className="mb-2 block text-sm font-medium text-zinc-400">Expansion Model</label>
                        <input
                          type="text"
                          value={config.query_expansion_model ?? "llama3.2:1b"}
                          onChange={(e) => setConfig({ ...config, query_expansion_model: e.target.value })}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Fast LLM for expanding vague queries</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* General Tab */}
          <TabPanel id="general" activeTab={activeTab}>
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-zinc-100">General Settings</h2>
                <p className="mb-6 text-sm text-zinc-400">
                  General application preferences and behavior
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Embedding Model
                    </label>
                    <input
                      type="text"
                      value={config.embedding_model || ""}
                      placeholder="nomic-embed-text"
                      onChange={(e) => setConfig({ ...config, embedding_model: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Model used for generating embeddings (leave empty for default)
                    </p>
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <input
                      type="checkbox"
                      checked={config.log_output}
                      onChange={(e) => setConfig({ ...config, log_output: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <div>
                      <span className="font-medium text-zinc-200">Verbose Logging</span>
                      <p className="text-xs text-zinc-500">Enable detailed logging output for debugging</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel id="advanced" activeTab={activeTab}>
            <div className="space-y-6">
              {/* Journal Management */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-zinc-100">Journal Management</h2>
                <p className="mb-4 text-sm text-zinc-400">
                  Manage journal (chat history) RAG chunks in the vector database
                </p>

                {journalStats && (
                  <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="h-4 w-4 text-purple-400" />
                        <p className="text-xs text-zinc-400">Journal Points</p>
                      </div>
                      <p className="text-lg font-bold text-zinc-100">
                        {journalStats.total_documents || 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                      <p className="text-xs text-zinc-400 mb-1">Collection</p>
                      <p className="text-sm font-medium text-zinc-100">
                        {journalStats.collection || 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                      <p className="text-xs text-zinc-400 mb-1">Vector Dim</p>
                      <p className="text-sm font-medium text-zinc-100">
                        {journalStats.vector_dimension || 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                      <p className="text-xs text-zinc-400 mb-1">Storage</p>
                      <p className="text-sm font-medium text-zinc-100">
                        {journalStats.storage_type || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={loadJournalStats}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Stats
                </button>
              </div>

              {/* API Key Status */}
              <div>
                <h2 className="mb-4 text-xl font-semibold text-zinc-100">API Key Status</h2>
                <p className="mb-4 text-sm text-zinc-400">
                  View the status of configured API keys (managed via backend environment variables)
                </p>

                <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-400">Anthropic API Key:</span>
                    <span className={config.anthropic_api_key_set ? "text-green-400 font-medium" : "text-zinc-500"}>
                      {config.anthropic_api_key_set ? "✓ Configured" : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-zinc-800">
                    <span className="text-zinc-400">OpenAI API Key:</span>
                    <span className={config.openai_api_key_set ? "text-green-400 font-medium" : "text-zinc-500"}>
                      {config.openai_api_key_set ? "✓ Configured" : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-zinc-800">
                    <span className="text-zinc-400">Purdue API Key:</span>
                    <span className={config.purdue_api_key_set ? "text-green-400 font-medium" : "text-zinc-500"}>
                      {config.purdue_api_key_set ? "✓ Configured" : "Not set"}
                    </span>
                  </div>
                  <p className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                    API keys are configured via environment variables on the backend server
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>
        </>
      )}
    </AppShell>
  );
}
