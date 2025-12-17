"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { RefreshCw, FileText, Database, Clock } from "lucide-react";

export function FileStatus() {
  const [indexed, setIndexed] = useState<number | null>(null);
  const [blobs, setBlobs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get indexed stats
      const indexedData = await api.getIndexedStats();
      setIndexed(indexedData.total_documents);

      // Get blobs
      const blobsData = await api.listBlobs();
      setBlobs(blobsData.blobs);

      // Get job statuses from tracked job IDs
      const jobIds = JSON.parse(localStorage.getItem("jobIds") || "[]");
      const jobMap = new Map();
      for (const jobId of jobIds) {
        try {
          const jobStatus = await api.getJobStatus(jobId);
          jobMap.set(jobId, jobStatus);
          // Remove completed/failed jobs from tracking
          if (jobStatus.status === "completed" || jobStatus.status === "failed") {
            const updated = jobIds.filter((id: string) => id !== jobId);
            localStorage.setItem("jobIds", JSON.stringify(updated));
          }
        } catch (error) {
          // Job might not exist anymore, remove from tracking
          const updated = jobIds.filter((id: string) => id !== jobId);
          localStorage.setItem("jobIds", JSON.stringify(updated));
        }
      }
      setJobs(jobMap);
    } catch (error) {
      console.error("Failed to load file status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && indexed === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          File Status
        </h2>
        <button
          onClick={loadData}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="mr-1.5 inline h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Indexed Files */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
              Indexed Files
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {indexed ?? 0} documents in vector database
            </p>
          </div>
        </div>
      </div>

      {/* Blobs */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-3 flex items-center gap-3">
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            Blob Storage ({blobs.length})
          </h3>
        </div>
        {blobs.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No files in blob storage
          </p>
        ) : (
          <div className="space-y-2">
            {blobs.map((blob) => (
              <div
                key={blob.blob_id}
                className="rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/50"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {blob.original_filename}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {(blob.size_bytes / 1024).toFixed(2)} KB •{" "}
                  {new Date(blob.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jobs */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mb-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            Processing Jobs
          </h3>
        </div>
        {jobs.size === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No active jobs
          </p>
        ) : (
          <div className="space-y-2">
            {Array.from(jobs.values()).map((job) => (
              <div
                key={job.job_id}
                className="rounded border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-600 dark:bg-zinc-700/50"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {job.job_id}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                  Status: {job.status}
                  {job.error && ` • Error: ${job.error}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

