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
  use_rag?: boolean;
  rag_top_k?: number;
  system_prompt?: string;
  rag_prompt_template?: string;
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
        `/v1/ingest/blobs/${blobId}`
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
};

// ===== Exports =====

export { API_BASE_URL, apiClient };
export default api;

