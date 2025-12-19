"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { api, DetailedHealthResponse } from "@/lib/api";

export function SystemHealthDashboard() {
  const [health, setHealth] = useState<DetailedHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.healthCheckDetailed();
      setHealth(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health status");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-400";
      case "degraded":
        return "text-yellow-600 dark:text-yellow-400";
      case "unhealthy":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            System Health
          </h3>
        </div>
        <button
          onClick={loadHealth}
          disabled={loading}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          title="Refresh health status"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading && !health ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              Loading health status...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        ) : health ? (
          <>
            {/* Overall Status */}
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/50">
              <div className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  Overall Status
                </span>
              </div>
              <span className={`font-semibold capitalize ${getStatusColor(health.status)}`}>
                {health.status}
              </span>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Service</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {health.service}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-700/30">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Version</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {health.version}
                </p>
              </div>
            </div>

            {/* LLM Gateway Status */}
            {health.components?.llm_gateway && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/50">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    LLM Gateway
                  </span>
                  {health.components.llm_gateway.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {Object.entries(health.components.llm_gateway)
                  .filter(([key]) => key !== "ok")
                  .map(([key, value]) => (
                    <div key={key} className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                      <span className="font-mono">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Error Display */}
            {health.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                <p className="font-medium">Error:</p>
                <p className="mt-1">{health.error}</p>
              </div>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

