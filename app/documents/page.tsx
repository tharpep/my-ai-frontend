"use client";

import { useState, useCallback } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { api, ApiClientError } from "@/lib/api";
import { Upload, FileText, Trash2, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

export default function DocumentsPage() {
  const { documents, addDocument, updateDocument, removeDocument, setError, error } = useDocumentStore();
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    for (const file of acceptedFiles) {
      const docId = `${file.name}-${Date.now()}`;
      
      // Add to store with uploading status
      addDocument({
        id: docId,
        filename: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        uploadedAt: Date.now(),
      });

      setUploadingFiles(prev => new Set(prev).add(docId));

      try {
        // Upload to backend
        const response = await api.uploadDocument(file);
        
        // Update status to processing
        updateDocument(docId, { 
          status: 'processing',
        });

        // Poll for completion (simplified - in production use webhooks or SSE)
        setTimeout(() => {
          updateDocument(docId, { 
            status: 'indexed',
            metadata: {
              chunks: Math.floor(Math.random() * 50) + 10, // Placeholder
            }
          });
          setUploadingFiles(prev => {
            const next = new Set(prev);
            next.delete(docId);
            return next;
          });
        }, 2000);

      } catch (err) {
        const errorMessage = err instanceof ApiClientError
          ? err.message
          : "Failed to upload document";
        
        updateDocument(docId, { 
          status: 'failed',
          error: errorMessage,
        });
        
        setUploadingFiles(prev => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      }
    }
  }, [addDocument, updateDocument, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document? It will be removed from your library.")) return;
    
    try {
      // In production, call API to delete from backend
      removeDocument(docId);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete document");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'indexed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-zinc-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Documents</h1>
          <p className="mt-2 text-zinc-400">
            Upload and manage documents for your AI assistant's knowledge base
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-950/30 p-4 text-red-100">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`
            mb-8 cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors
            ${
              isDragActive
                ? "border-blue-500 bg-blue-950/20"
                : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900/50"
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-zinc-500" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-100">
            {isDragActive ? "Drop files here" : "Upload Documents"}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Drag and drop files here, or click to browse
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Supports PDF, TXT, MD, DOCX
          </p>
        </div>

        {/* Document Library */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-100">
            Library ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-600" />
              <p className="mt-4 text-zinc-400">No documents yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-zinc-100">
                          {doc.filename}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatFileSize(doc.size)}
                          {doc.metadata?.chunks && ` • ${doc.metadata.chunks} chunks`}
                        </p>
                        {doc.status === 'failed' && doc.error && (
                          <p className="mt-1 text-xs text-red-400">{doc.error}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="flex-shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-zinc-500">
                      {doc.status === 'uploading' && "Uploading..."}
                      {doc.status === 'processing' && "Processing..."}
                      {doc.status === 'indexed' && "Ready"}
                      {doc.status === 'failed' && "Failed"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
