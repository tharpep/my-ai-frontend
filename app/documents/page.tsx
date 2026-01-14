"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { api, ApiClientError, BlobInfo } from "@/lib/api";
import { Upload, FileText, Trash2, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, Database, Search, Grid3x3, List } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { AppShell } from "@/components/layout/AppShell";

interface UploadingFile {
  filename: string;
  status: 'uploading' | 'processing' | 'complete' | 'failed';
  error?: string;
  jobId?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<BlobInfo[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indexedStats, setIndexedStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [blobsResponse, statsResponse] = await Promise.all([
        api.listBlobs(),
        api.getIndexedStats().catch(() => null),
      ]);
      
      setDocuments(blobsResponse.blobs);
      setIndexedStats(statsResponse);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const pollJobStatus = async (jobId: string, filename: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.set(filename, {
            filename,
            status: 'failed',
            error: 'Processing timeout',
          });
          return next;
        });
        return;
      }

      try {
        const status = await api.getJobStatus(jobId);
        
        if (status.status === 'completed') {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            next.set(filename, {
              filename,
              status: 'complete',
            });
            return next;
          });
          
          // Reload documents after completion
          setTimeout(() => {
            loadDocuments();
            setUploadingFiles(prev => {
              const next = new Map(prev);
              next.delete(filename);
              return next;
            });
          }, 1000);
        } else if (status.status === 'failed') {
          setUploadingFiles(prev => {
            const next = new Map(prev);
            next.set(filename, {
              filename,
              status: 'failed',
              error: status.error || 'Processing failed',
            });
            return next;
          });
        } else {
          // Still processing
          setUploadingFiles(prev => {
            const next = new Map(prev);
            next.set(filename, {
              filename,
              status: 'processing',
              jobId,
            });
            return next;
          });
          attempts++;
          setTimeout(poll, 1000);
        }
      } catch (err) {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.set(filename, {
            filename,
            status: 'failed',
            error: err instanceof ApiClientError ? err.message : 'Status check failed',
          });
          return next;
        });
      }
    };

    poll();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    for (const file of acceptedFiles) {
      setUploadingFiles(prev => new Map(prev).set(file.name, {
        filename: file.name,
        status: 'uploading',
      }));

      try {
        const response = await api.uploadDocument(file);
        
        // Start polling for job completion
        pollJobStatus(response.job_id, file.name);

      } catch (err) {
        const errorMessage = err instanceof ApiClientError
          ? err.message
          : "Failed to upload document";
        
        setUploadingFiles(prev => new Map(prev).set(file.name, {
          filename: file.name,
          status: 'failed',
          error: errorMessage,
        }));
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    noClick: true,
    noKeyboard: true,
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await onDrop(Array.from(files));
      e.target.value = ''; // Reset input
    }
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (blobId: string) => {
    if (!confirm("Delete this document? It will be removed from your library.")) return;
    
    try {
      await api.deleteBlob(blobId);
      setDocuments(prev => prev.filter(doc => doc.blob_id !== blobId));
      
      // Also delete from indexed collection
      try {
        await api.deleteIndexedFile(blobId);
      } catch (err) {
        console.warn("Failed to delete from index:", err);
      }
      
      // Reload stats
      loadDocuments();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to delete document");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <AppShell maxWidth="6xl">
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />

        {/* Drag Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-950/20 backdrop-blur-sm">
            <div className="text-center">
              <Upload className="mx-auto h-16 w-16 text-blue-400" />
              <p className="mt-4 text-lg font-semibold text-blue-100">Drop files here</p>
              <p className="mt-1 text-sm text-blue-300">PDF, TXT, MD, DOCX</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">Documents</h1>
              <p className="mt-2 text-zinc-400">
                Upload and manage documents for your AI assistant&apos;s knowledge base
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadDocuments}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleUploadClick}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-900">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-zinc-800 text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats - Compact */}
        {indexedStats && (
          <div className="mb-6 flex items-center gap-6 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-zinc-400">Documents:</span>
              <span className="font-medium text-zinc-100">{indexedStats.total_documents || 0}</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Collection:</span>
              <span className="font-medium text-zinc-100">{indexedStats.collection || 'N/A'}</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Dimension:</span>
              <span className="font-medium text-zinc-100">{indexedStats.vector_dimension || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-800 p-3 text-red-100">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Uploading Files */}
        {uploadingFiles.size > 0 && (
          <div className="mb-4">
            <div className="space-y-2">
              {Array.from(uploadingFiles.values()).map((file) => (
                <div
                  key={file.filename}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2"
                >
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{file.filename}</p>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {file.status === 'uploading' && "Uploading..."}
                    {file.status === 'processing' && "Processing..."}
                    {file.status === 'complete' && "Complete"}
                    {file.status === 'failed' && "Failed"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Library */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'Document' : 'Documents'}
            {searchQuery && ` matching "${searchQuery}"`}
          </h2>

          {loading && documents.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="ml-3 text-zinc-400">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-600" />
              <p className="mt-4 text-zinc-400">No documents yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Click Upload to add your first document
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-zinc-600" />
              <p className="mt-4 text-zinc-400">No documents found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Try a different search term
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.blob_id}
                  className="group rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0 text-blue-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="truncate text-sm font-medium text-zinc-100">
                          {doc.original_filename}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <span>{formatFileSize(doc.size_bytes)}</span>
                          <span>•</span>
                          <span>{doc.file_extension.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.blob_id)}
                      className="flex-shrink-0 rounded p-1 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                      aria-label="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.blob_id}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-4 w-4 flex-shrink-0 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-medium text-zinc-100">
                        {doc.original_filename}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{formatFileSize(doc.size_bytes)}</span>
                      <span>{doc.file_extension.toUpperCase()}</span>
                      <span className="hidden md:block">{formatDate(doc.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.blob_id)}
                    className="flex-shrink-0 rounded p-1 text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
