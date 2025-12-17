"use client";

import React, { useCallback, useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";

/** Accepted file extensions - matching backend supported types */
const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".docx"];

export interface DocumentDropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentDropzone({
  onFilesSelected,
  disabled = false,
  className = "",
}: DocumentDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      onFilesSelected?.(files);

      // Upload files
      for (const file of files) {
        try {
          const response = await api.uploadDocument(file);
          // Store job ID in localStorage for tracking
          const jobIds = JSON.parse(localStorage.getItem("jobIds") || "[]");
          jobIds.push(response.job_id);
          localStorage.setItem("jobIds", JSON.stringify(jobIds));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files: File[] = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, handleFiles]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files: File[] = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        handleFiles(files);
      }
      e.target.value = "";
    },
    [handleFiles]
  );

  const openFileDialog = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFileDialog();
        }
      }}
      aria-label="Drop files here or click to upload"
      aria-disabled={disabled}
      className={`
        relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center
        rounded-xl border-2 border-dashed p-8 transition-all duration-200
        ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20"
            : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800/30 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50"
        }
        ${disabled ? "pointer-events-none opacity-50" : ""}
        ${className}
      `}
    >
      <div
        className={`
          mb-4 rounded-full p-4 transition-colors
          ${
            isDragOver
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
              : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
          }
        `}
      >
        <Upload className="h-8 w-8" />
      </div>

      <p className="mb-1 text-base font-medium text-zinc-700 dark:text-zinc-200">
        {isDragOver ? "Drop files here" : "Drag & drop files here"}
      </p>

      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        or click to browse
      </p>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Supports: PDF, TXT, MD, DOCX
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        disabled={disabled}
      />
    </div>
  );
}
