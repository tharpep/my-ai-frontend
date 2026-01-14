/**
 * API Client for Personal AI Assistant Backend
 * 
 * Provides typed methods for all backend endpoints:
 * - Health checks
 * - RAG queries
 * - Document ingestion
 * - System statistics
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// ===== Configuration =====

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ===== Type Definitions =====

/** Standard API error response structure */
export interface ApiError {
  error: {
    message: string;
    type: string;
    code: string;
  };
  request_id: string;
}

/** Health check response */
export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  service: string;
  version: string;
  error?: string;
}

/** Detailed health check response */
export interface DetailedHealthResponse extends HealthResponse {
  components?: {
    llm_gateway: {
      ok: boolean;
      [key: string]: unknown;
    };
  };
}

/** RAG query request payload */
export interface QueryRequest {
  question: string;
  context_limit?: number;
  summarize?: boolean;
}

/** RAG query response */
export interface QueryResponse {
  answer: string;
  citations: string[];
  context_docs: string[];
  context_scores: number[];
  model_used: string;
  provider_used: string;
}

/** Document ingestion request payload */
export interface IngestRequest {
  folder_path?: string;
}

/** Individual file processing result */
export interface FileResult {
  file: string;
  success: boolean;
  error?: string;
}

/** Document ingestion response */
export interface IngestResponse {
  success: boolean;
  processed: number;
  failed: number;
  files: FileResult[];
  errors: string[];
  request_id: string;
}

/** RAG system statistics */
export interface StatsResponse {
  request_id: string;
  [key: string]: unknown;
}

/** Chat completion message */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Chat completion request */
export interface ChatCompletionRequest {
  model?: string;
  provider?: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  use_library?: boolean;
  use_journal?: boolean;
  library_top_k?: number;
  journal_top_k?: number;
  session_id?: string;
  save_messages?: boolean;
  system_prompt?: string;
  context_prompt_template?: string;
}

/** RAG context document */
export interface RAGDocument {
  text: string;
  similarity: number;
  full_text?: string;
}

/** RAG context metadata */
export interface RAGContext {
  library: {
    enabled: boolean;
    doc_count: number;
    documents: RAGDocument[];
    context_text?: string;
  };
  journal: {
    enabled: boolean;
    entry_count: number;
    entries: Array<Record<string, unknown>>;
    context_text?: string;
  };
  prep_time_ms: number;
  llm_time_ms: number;
}

/** Chat completion response */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  request_id: string;
  rag_context?: RAGContext;
}

/** Embedding request */
export interface EmbeddingRequest {
  input: string;
  model?: string;
}

/** Embedding response */
export interface EmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
  request_id: string;
}

/** Model information */
export interface ModelInfo {
  id: string;
  object: string;
  owned_by: string;
  permission: unknown[];
}

/** Models list response */
export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
  request_id: string;
}

/** Upload document response */
export interface UploadResponse {
  job_id: string;
  blob_id: string;
  filename: string;
  status: string;
  request_id: string;
}

/** Job status response */
export interface JobStatusResponse {
  job_id: string;
  status: string;
  created_at?: string;
  completed_at?: string;
  error?: string;
  request_id: string;
}

/** Blob information */
export interface BlobInfo {
  blob_id: string;
  original_filename: string;
  file_extension: string;
  size_bytes: number;
  created_at: string;
}

/** List blobs response */
export interface ListBlobsResponse {
  blobs: BlobInfo[];
  count: number;
  request_id: string;
}

/** Delete blob response */
export interface DeleteBlobResponse {
  deleted: boolean;
  blob_id: string;
  request_id: string;
}

/** Indexed stats response */
export interface IndexedStatsResponse {
  collection: string;
  total_documents: number;
  vector_dimension: number;
  storage_type: string;
  request_id: string;
}

/** Indexed file info */
export interface IndexedFileInfo {
  blob_id: string;
  filename: string;
  chunk_count: number;
}

/** List indexed files response */
export interface ListIndexedFilesResponse {
  files: IndexedFileInfo[];
  total_files: number;
  request_id: string;
}

/** Delete indexed file response */
export interface DeleteIndexedFileResponse {
  deleted: boolean;
  blob_id: string;
  message: string;
  request_id: string;
}

/** Configuration values */
export interface ConfigValues {
  provider_type: string;
  provider_name: string;
  provider_fallback: string;
  model_ollama: string;
  model_purdue: string;
  model_anthropic: string;
  chat_context_enabled: boolean;
  chat_library_enabled: boolean;
  chat_library_top_k: number;
  chat_library_similarity_threshold: number;
  chat_library_use_cache: boolean;
  chat_journal_enabled: boolean;
  chat_journal_top_k: number;
  chat_journal_similarity_threshold?: number;
  library_collection_name: string;
  library_chunk_size: number;
  library_chunk_overlap: number;
  journal_chunk_size?: number;
  journal_chunk_overlap?: number;
  storage_use_persistent: boolean;
  embedding_model: string;
  hardware_mode: string;
  hybrid_sparse_weight?: number;
  rerank_enabled?: boolean;
  rerank_candidates?: number;
  rerank_model?: string;
  query_expansion_enabled?: boolean;
  query_expansion_model?: string;
  qdrant_host: string;
  qdrant_port: number;
  redis_host: string;
  redis_port: number;
  blob_storage_path: string;
  worker_job_timeout: number;
  log_output: boolean;
  purdue_api_key_set: boolean;
  anthropic_api_key_set: boolean;
  openai_api_key_set: boolean;
}

/** Get config response */
export interface GetConfigResponse {
  config: ConfigValues;
  request_id: string;
}

/** Config update request */
export interface ConfigUpdateRequest {
  provider_name?: string;
  model_ollama?: string;
  model_purdue?: string;
  model_anthropic?: string;
  chat_context_enabled?: boolean;
  chat_library_enabled?: boolean;
  chat_library_top_k?: number;
  chat_library_similarity_threshold?: number;
  chat_journal_enabled?: boolean;
  chat_journal_top_k?: number;
  chat_journal_similarity_threshold?: number;
  library_chunk_size?: number;
  library_chunk_overlap?: number;
  journal_chunk_size?: number;
  journal_chunk_overlap?: number;
  embedding_model?: string;
  // Hybrid Search
  hybrid_sparse_weight?: number;
  // Reranking
  rerank_enabled?: boolean;
  rerank_candidates?: number;
  rerank_model?: string;
  // Query Expansion
  query_expansion_enabled?: boolean;
  query_expansion_model?: string;
  // Infrastructure
  qdrant_host?: string;
  qdrant_port?: number;
  redis_host?: string;
  redis_port?: number;
  log_output?: boolean;
}

/** Config update response */
export interface ConfigUpdateResponse {
  updated: boolean;
  fields?: string[];
  message: string;
  request_id: string;
}

/** Config schema field */
export interface ConfigSchemaField {
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  description: string;
}

/** Get config schema response */
export interface GetConfigSchemaResponse {
  schema: Record<string, ConfigSchemaField>;
  request_id: string;
}

/** Log entry */
export interface LogEntry {
  request_id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status_code: number;
  provider?: string;
  model?: string;
  response_time_ms?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  error_type?: string;
  error_message?: string;
}

/** Get logs response */
export interface GetLogsResponse {
  object: string;
  data: LogEntry[];
  meta: {
    limit: number;
    offset: number;
    count: number;
  };
  request_id: string;
}

/** Session metadata */
export interface SessionMetadata {
  session_id: string;
  name?: string;
  message_count: number;
  last_activity: string;
  created_at?: string;
  ingested_at?: string;
}

/** Session message */
export interface SessionMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

/** Ingestion status */
export interface IngestionStatus {
  ingested: boolean;
  ingested_at?: string;
  has_new_messages: boolean;
  chunk_count: number;
}

/** Session with messages response */
export interface SessionWithMessagesResponse {
  session_id: string;
  name?: string;
  created_at: string;
  last_activity: string;
  message_count: number;
  ingestion_status: IngestionStatus;
  messages: SessionMessage[];
  request_id: string;
}

/** List sessions response */
export interface ListSessionsResponse {
  sessions: SessionMetadata[];
  total: number;
  request_id: string;
}

/** Delete session response */
export interface DeleteSessionResponse {
  status: string;
  session_id: string;
  request_id: string;
}

/** Ingest session response */
export interface IngestSessionResponse {
  status: string;
  session_id: string;
  chunks_created: number;
  blob_path?: string;
  ingested_at: string;
  message_count: number;
  request_id: string;
}

/** Session status response */
export interface SessionStatusResponse extends IngestionStatus {
  request_id: string;
}

/** Memory stats response */
export interface MemoryStatsResponse {
  initialized?: boolean;
  journal_available?: boolean;
  qdrant?: {
    points_count?: number;
    [key: string]: unknown;
  };
  sessions?: {
    total: number;
    needing_ingest: number;
  };
  request_id: string;
}

// ===== Error Handling =====

/** Typed API error class */
export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly errorCode: string;
  public readonly requestId: string;

  constructor(
    message: string,
    statusCode: number,
    errorType: string,
    errorCode: string,
    requestId: string
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.errorCode = errorCode;
    this.requestId = requestId;
  }
}

/** Parse axios error into typed ApiClientError */
function parseError(error: unknown): ApiClientError {
  const axiosError = error as AxiosError<ApiError>;

  if (axiosError.response?.data?.error) {
    const errorData = axiosError.response.data.error;
    const message = errorData?.message ?? "Unknown error";
    const type = errorData?.type ?? "unknown_error";
    const code = errorData?.code ?? "unknown";
    const requestId = axiosError.response.data.request_id ?? "unknown";

    return new ApiClientError(
      message,
      axiosError.response.status ?? 500,
      type,
      code,
      requestId
    );
  }

  // Fallback for non-standard errors
  return new ApiClientError(
    axiosError.message ?? "Unknown error",
    axiosError.response?.status ?? 0,
    "network_error",
    "unknown",
    "unknown"
  );
}

// ===== API Client =====

/** Create configured axios instance */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return client;
}

const apiClient = createApiClient();

// ===== API Methods =====

export const api = {
  // ----- Health Endpoints -----

  /** Basic health check */
  async healthCheck(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>("/health/");
    return response.data;
  },

  /** Detailed health check with component status */
  async healthCheckDetailed(): Promise<DetailedHealthResponse> {
    const response = await apiClient.get<DetailedHealthResponse>(
      "/health/detailed"
    );
    return response.data;
  },

  // ----- RAG Query Endpoints -----

  /** Query the RAG system with a question */
  async query(request: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await apiClient.post<QueryResponse>(
        "/v1/query",
        request
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get RAG system statistics */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await apiClient.get<StatsResponse>("/v1/stats");
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- Document Ingestion Endpoints -----

  /** Trigger document ingestion from server folder */
  async ingestDocuments(request?: IngestRequest): Promise<IngestResponse> {
    try {
      const response = await apiClient.post<IngestResponse>(
        "/v1/ingest",
        request ?? {}
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Upload a document for async processing */
  async uploadDocument(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<UploadResponse>(
        "/v1/ingest/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000, // 2 minutes for file uploads (larger files may take time)
        }
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get job status */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const response = await apiClient.get<JobStatusResponse>(
        `/v1/ingest/jobs/${jobId}`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** List all blobs */
  async listBlobs(): Promise<ListBlobsResponse> {
    try {
      const response = await apiClient.get<ListBlobsResponse>(
        "/v1/ingest/blobs"
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Delete a blob */
  async deleteBlob(blobId: string): Promise<DeleteBlobResponse> {
    try {
      const response = await apiClient.delete<DeleteBlobResponse>(
        `/v1/ingest/blobs/${encodeURIComponent(blobId)}`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get indexed documents stats */
  async getIndexedStats(): Promise<IndexedStatsResponse> {
    try {
      const response = await apiClient.get<IndexedStatsResponse>(
        "/v1/ingest/indexed"
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** List indexed files */
  async listIndexedFiles(): Promise<ListIndexedFilesResponse> {
    try {
      const response = await apiClient.get<ListIndexedFilesResponse>(
        "/v1/ingest/indexed/files"
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Delete indexed file by blob_id */
  async deleteIndexedFile(blobId: string): Promise<DeleteIndexedFileResponse> {
    try {
      const response = await apiClient.delete<DeleteIndexedFileResponse>(
        `/v1/ingest/indexed/${encodeURIComponent(blobId)}`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- LLM Endpoints -----

  /** Chat completion (OpenAI-compatible) */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await apiClient.post<ChatCompletionResponse>(
        "/v1/chat/completions",
        request
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Create embeddings */
  async createEmbedding(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    try {
      const response = await apiClient.post<EmbeddingResponse>(
        "/v1/embeddings",
        request
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** List available models */
  async listModels(): Promise<ModelsResponse> {
    try {
      const response = await apiClient.get<ModelsResponse>("/v1/models");
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- Config Endpoints -----

  /** Get current configuration */
  async getConfig(): Promise<GetConfigResponse> {
    try {
      const response = await apiClient.get<GetConfigResponse>("/v1/config");
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Update configuration values */
  async updateConfig(
    request: ConfigUpdateRequest
  ): Promise<ConfigUpdateResponse> {
    try {
      const response = await apiClient.patch<ConfigUpdateResponse>(
        "/v1/config",
        request
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get configuration schema */
  async getConfigSchema(): Promise<GetConfigSchemaResponse> {
    try {
      const response = await apiClient.get<GetConfigSchemaResponse>(
        "/v1/config/schema"
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- Logs Endpoints -----

  /** Get recent request logs */
  async getLogs(limit?: number, offset?: number): Promise<GetLogsResponse> {
    try {
      const params: any = {};
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;
      const response = await apiClient.get<GetLogsResponse>("/v1/logs", {
        params,
      });
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- Memory/Session Endpoints -----

  /** List all chat sessions */
  async listSessions(limit?: number): Promise<ListSessionsResponse> {
    try {
      const params: any = {};
      if (limit) params.limit = limit;
      const response = await apiClient.get<ListSessionsResponse>(
        "/v1/memory/sessions",
        { params }
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get a session with all its messages */
  async getSessionMessages(sessionId: string): Promise<SessionWithMessagesResponse> {
    try {
      const response = await apiClient.get<SessionWithMessagesResponse>(
        `/v1/memory/sessions/${encodeURIComponent(sessionId)}/messages`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Delete a chat session */
  async deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
    try {
      const response = await apiClient.delete<DeleteSessionResponse>(
        `/v1/memory/sessions/${encodeURIComponent(sessionId)}`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Manually ingest a session into journal RAG */
  async ingestSession(sessionId: string): Promise<IngestSessionResponse> {
    try {
      const response = await apiClient.post<IngestSessionResponse>(
        `/v1/memory/sessions/${encodeURIComponent(sessionId)}/ingest`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get session ingestion status */
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const response = await apiClient.get<SessionStatusResponse>(
        `/v1/memory/sessions/${encodeURIComponent(sessionId)}/status`
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  /** Get memory/journal statistics */
  async getMemoryStats(): Promise<MemoryStatsResponse> {
    try {
      const response = await apiClient.get<MemoryStatsResponse>(
        "/v1/memory/stats"
      );
      return response.data;
    } catch (error) {
      throw parseError(error);
    }
  },

  // ----- Journal Management -----
  // Note: Journal stats are available via getMemoryStats() which returns qdrant stats
};

// ===== Exports =====

export { API_BASE_URL, apiClient };
export default api;

