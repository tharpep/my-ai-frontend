"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, BarChart3 } from "lucide-react";
import { api, StatsResponse, IndexedStatsResponse } from "@/lib/api";

export function RAGStatisticsPanel() {
  const [ragStats, setRagStats] = useState<StatsResponse | null>(null);
  const [indexedStats, setIndexedStats] = useState<IndexedStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both RAG stats and indexed stats in parallel
      const [ragData, indexedData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getIndexedStats().catch(() => null),
      ]);

      setRagStats(ragData);
      setIndexedStats(indexedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "N/A";
    return num.toLocaleString();
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            RAG Statistics
          </h3>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          title="Refresh statistics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading && !ragStats && !indexedStats ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              Loading statistics...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            {/* Indexed Stats */}
            {indexedStats && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Indexed Documents
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Collection</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {indexedStats.collection || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Documents</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(indexedStats.total_documents)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Vector Dimension</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(indexedStats.vector_dimension)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Storage Type</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {indexedStats.storage_type || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* RAG Stats */}
            {ragStats && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  RAG System Stats
                </h4>
                <div className="space-y-2">
                  {Object.entries(ragStats)
                    .filter(([key]) => key !== "request_id")
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/30"
                      >
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 font-mono">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {!ragStats && !indexedStats && !error && (
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                No statistics available
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

