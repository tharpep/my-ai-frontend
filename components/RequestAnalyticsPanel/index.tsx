"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, RefreshCw, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { api, LogEntry } from "@/lib/api";

export function RequestAnalyticsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getLogs(1000); // Get last 1000 logs for analytics
      setLogs(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const analytics = useMemo(() => {
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        successRate: 0,
        errorRate: 0,
        avgResponseTime: 0,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        endpointCounts: {} as Record<string, number>,
        errorBreakdown: {} as Record<string, number>,
        statusCodeCounts: {} as Record<number, number>,
      };
    }

    const successCount = logs.filter((log) => log.status_code < 400).length;
    const errorCount = logs.filter((log) => log.status_code >= 400).length;
    const responseTimes = logs
      .map((log) => log.response_time_ms)
      .filter((time): time is number => time !== undefined && time !== null);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    const totalTokens = logs.reduce(
      (sum, log) => sum + (log.total_tokens || 0),
      0
    );
    const totalPromptTokens = logs.reduce(
      (sum, log) => sum + (log.prompt_tokens || 0),
      0
    );
    const totalCompletionTokens = logs.reduce(
      (sum, log) => sum + (log.completion_tokens || 0),
      0
    );

    const endpointCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const key = `${log.method} ${log.endpoint}`;
      endpointCounts[key] = (endpointCounts[key] || 0) + 1;
    });

    const errorBreakdown: Record<string, number> = {};
    logs
      .filter((log) => log.status_code >= 400)
      .forEach((log) => {
        const errorType = log.error_type || "unknown";
        errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
      });

    const statusCodeCounts: Record<number, number> = {};
    logs.forEach((log) => {
      statusCodeCounts[log.status_code] = (statusCodeCounts[log.status_code] || 0) + 1;
    });

    return {
      totalRequests: logs.length,
      successCount,
      errorCount,
      successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
      errorRate: logs.length > 0 ? (errorCount / logs.length) * 100 : 0,
      avgResponseTime,
      totalTokens,
      totalPromptTokens,
      totalCompletionTokens,
      endpointCounts,
      errorBreakdown,
      statusCodeCounts,
    };
  }, [logs]);

  const topEndpoints = useMemo(() => {
    return Object.entries(analytics.endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [analytics.endpointCounts]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            Request Analytics
          </h3>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
          title="Refresh analytics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              Loading analytics...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        ) : analytics.totalRequests === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            No requests logged yet
          </p>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Requests</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatNumber(analytics.totalRequests)}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Response Time</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatTime(analytics.avgResponseTime)}
                </p>
              </div>
            </div>

            {/* Success/Error Rates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <p className="text-xs text-green-700 dark:text-green-300">Success Rate</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-green-700 dark:text-green-300">
                  {analytics.successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {formatNumber(analytics.successCount)} successful
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-xs text-red-700 dark:text-red-300">Error Rate</p>
                </div>
                <p className="mt-1 text-lg font-semibold text-red-700 dark:text-red-300">
                  {analytics.errorRate.toFixed(1)}%
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formatNumber(analytics.errorCount)} errors
                </p>
              </div>
            </div>

            {/* Token Usage */}
            {analytics.totalTokens > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    Token Usage
                  </p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Total:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(analytics.totalTokens)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Prompt:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(analytics.totalPromptTokens)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Completion:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {formatNumber(analytics.totalCompletionTokens)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Endpoints */}
            {topEndpoints.length > 0 && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-700/30">
                <p className="mb-2 text-xs font-medium text-zinc-900 dark:text-zinc-50">
                  Top Endpoints
                </p>
                <div className="space-y-1">
                  {topEndpoints.map(([endpoint, count]) => (
                    <div
                      key={endpoint}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-zinc-600 dark:text-zinc-400 truncate flex-1">
                        {endpoint}
                      </span>
                      <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-50">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Breakdown */}
            {Object.keys(analytics.errorBreakdown).length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
                <p className="mb-2 text-xs font-medium text-red-700 dark:text-red-300">
                  Error Breakdown
                </p>
                <div className="space-y-1">
                  {Object.entries(analytics.errorBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([errorType, count]) => (
                      <div
                        key={errorType}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-red-600 dark:text-red-400 capitalize">
                          {errorType.replace(/_/g, " ")}
                        </span>
                        <span className="ml-2 font-medium text-red-700 dark:text-red-300">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

