"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { api, LogEntry } from "@/lib/api";

export function TerminalOutput() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, autoScroll]);

  const loadLogs = async () => {
    try {
      const response = await api.getLogs(100);
      setLogs(response.logs);
    } catch (error) {
      // Endpoint might not exist yet, silently fail
      console.error("Failed to load logs:", error);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const formatLogEntry = (log: LogEntry) => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const statusColor =
      log.status_code >= 500
        ? "text-red-400"
        : log.status_code >= 400
        ? "text-yellow-400"
        : "text-green-400";

    let line = `[${time}] ${log.method} ${log.endpoint} `;
    line += `<span class="${statusColor}">${log.status_code}</span>`;

    if (log.response_time_ms) {
      line += ` (${log.response_time_ms.toFixed(0)}ms)`;
    }

    if (log.provider) {
      line += ` | Provider: ${log.provider}`;
    }

    if (log.model) {
      line += ` | Model: ${log.model}`;
    }

    if (log.error_type) {
      line += ` | Error: ${log.error_type}`;
    }

    if (log.error_message) {
      line += ` - ${log.error_message}`;
    }

    return line;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-900 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 p-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <h3 className="text-sm font-medium text-zinc-300">Request Logs</h3>
          <span className="text-xs text-zinc-500">({logs.length} entries)</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-700 text-green-400 focus:ring-green-400"
            />
            Auto-scroll
          </label>
          <button
            onClick={() => setLogs([])}
            className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
            title="Clear logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="h-64 overflow-y-auto p-3 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-zinc-500">
            No logs yet. Logs will appear here when requests are made.
          </p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <div
                key={`${log.request_id}-${idx}`}
                className="text-zinc-300"
                dangerouslySetInnerHTML={{
                  __html: formatLogEntry(log),
                }}
              />
            ))}
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

