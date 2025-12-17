"use client";

import { DocumentDropzone } from "@/components/DocumentDropzone";

export default function Home() {
  const handleFilesSelected = (files: File[]) => {
    console.log("Files selected:", files);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <main className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Document Ingestion
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload documents to be processed by the AI system
          </p>
        </div>

        <DocumentDropzone onFilesSelected={handleFilesSelected} />
      </main>
    </div>
  );
}
