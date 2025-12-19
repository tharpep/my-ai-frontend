"use client";

import { DocumentDropzone } from "@/components/DocumentDropzone";
import { FileStatus } from "@/components/FileStatus";
import { ChatBox } from "@/components/ChatBox";
import { ConfigSection } from "@/components/ConfigSection";
import { TerminalOutput } from "@/components/TerminalOutput";
import { SystemHealthDashboard } from "@/components/SystemHealthDashboard";
import { RAGStatisticsPanel } from "@/components/RAGStatisticsPanel";
import { RequestAnalyticsPanel } from "@/components/RequestAnalyticsPanel";

export default function Home() {
  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dev Page
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Developer page for testing and development
          </p>
        </div>

        <div className="space-y-6">
          {/* System Health Dashboard - Full Width at Top */}
          <SystemHealthDashboard />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <DocumentDropzone onFilesSelected={handleFilesSelected} />
              <FileStatus />
              <RAGStatisticsPanel />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ChatBox />
              <ConfigSection />
              <RequestAnalyticsPanel />
            </div>
          </div>

          {/* Terminal Output - Full Width */}
          <TerminalOutput />
        </div>
      </main>
    </div>
  );
}
