"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { api, StatsResponse, IndexedStatsResponse, MemoryStatsResponse, ApiClientError } from "@/lib/api";
import { Database, RefreshCw, BarChart3, Activity, HardDrive, Loader2, FileText, History } from "lucide-react";

export default function RAGVisualizerPage() {
  const [ragStats, setRagStats] = useState<StatsResponse | null>(null);
  const [indexedStats, setIndexedStats] = useState<IndexedStatsResponse | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ragData, indexedData, memoryData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getIndexedStats().catch(() => null),
        api.getMemoryStats().catch(() => null),
      ]);

      setRagStats(ragData);
      setIndexedStats(indexedData);
      setMemoryStats(memoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString();
  };

  return (
    <AppShell maxWidth="7xl">
      
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">RAG Visualizer</h1>
            <p className="mt-2 text-zinc-400">
              Monitor your RAG system&apos;s performance and statistics
            </p>
          </div>
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-950/30 border border-red-800 p-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading && !ragStats && !indexedStats && !memoryStats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg text-zinc-400">Loading statistics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Library Stats */}
            {indexedStats && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-zinc-100">
                    Library (Documents)
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <p className="text-xs text-zinc-400">Collection Name</p>
                    </div>
                    <p className="mt-2 text-lg font-bold text-zinc-100">
                      {indexedStats.collection || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-400" />
                      <p className="text-xs text-zinc-400">Total Documents</p>
                    </div>
                    <p className="mt-2 text-lg font-bold text-zinc-100">
                      {formatNumber(indexedStats.total_documents)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-purple-400" />
                      <p className="text-xs text-zinc-400">Vector Dimension</p>
                    </div>
                    <p className="mt-2 text-lg font-bold text-zinc-100">
                      {formatNumber(indexedStats.vector_dimension)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-orange-400" />
                      <p className="text-xs text-zinc-400">Storage Type</p>
                    </div>
                    <p className="mt-2 text-lg font-bold text-zinc-100">
                      {indexedStats.storage_type || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Journal Stats */}
            {memoryStats && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <History className="h-6 w-6 text-purple-400" />
                  <h2 className="text-xl font-semibold text-zinc-100">
                    Journal (Chat History)
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {memoryStats.journal_available !== false && memoryStats.qdrant && (
                    <>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-400" />
                          <p className="text-xs text-zinc-400">Journal Points</p>
                        </div>
                        <p className="mt-2 text-lg font-bold text-zinc-100">
                          {formatNumber((memoryStats.qdrant as any)?.points_count)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-400" />
                          <p className="text-xs text-zinc-400">Total Sessions</p>
                        </div>
                        <p className="mt-2 text-lg font-bold text-zinc-100">
                          {formatNumber(memoryStats.sessions?.total)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-amber-400" />
                          <p className="text-xs text-zinc-400">Needs Ingestion</p>
                        </div>
                        <p className="mt-2 text-lg font-bold text-zinc-100">
                          {formatNumber(memoryStats.sessions?.needing_ingest)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-blue-400" />
                          <p className="text-xs text-zinc-400">Status</p>
                        </div>
                        <p className="mt-2 text-lg font-bold text-zinc-100">
                          {memoryStats.initialized ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {memoryStats.journal_available === false && (
                    <div className="col-span-full rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                      <p className="text-sm text-zinc-400">
                        Journal system not available. RAG may be disabled.
                      </p>
                      {memoryStats.sessions && (
                        <p className="mt-2 text-sm text-zinc-500">
                          Total Sessions: {formatNumber(memoryStats.total_sessions)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RAG System Stats */}
            {ragStats && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-zinc-100">
                    RAG System Statistics
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(ragStats)
                    .filter(([key]) => key !== "request_id")
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                      >
                        <span className="text-sm text-zinc-400 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-base font-semibold text-zinc-100 font-mono">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Placeholder for Future Visualizations */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-xl font-semibold text-zinc-100">
                Advanced Visualizations
              </h2>
              <div className="rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-zinc-700" />
                <p className="mt-4 text-zinc-500">
                  Document relationship graphs and usage heatmaps coming soon
                </p>
              </div>
            </div>

            {!ragStats && !indexedStats && !memoryStats && !error && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
                <p className="text-zinc-400">No statistics available</p>
                <p className="mt-2 text-sm text-zinc-500">
                  Make sure the backend is running at http://localhost:8000
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
