"use client";

import { DocumentDropzone } from "@/components/DocumentDropzone";
import { FileStatus } from "@/components/FileStatus";
import { ChatBox } from "@/components/ChatBox";
import { ConfigSection } from "@/components/ConfigSection";
import { TerminalOutput } from "@/components/TerminalOutput";
import { SystemHealthDashboard } from "@/components/SystemHealthDashboard";
import { RAGStatisticsPanel } from "@/components/RAGStatisticsPanel";
import { RequestAnalyticsPanel } from "@/components/RequestAnalyticsPanel";
import { AppShell } from "@/components/layout/AppShell";

export default function DevPage() {
  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
  };

  return (
    <AppShell maxWidth="7xl">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dev Page
            </h1>
          </div>
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
    </AppShell>
  );
}
