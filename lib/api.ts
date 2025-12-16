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
function parseError(error: AxiosError<ApiError>): ApiClientError {
  if (error.response?.data?.error) {
    const { message, type, code } = error.response.data.error;
    const requestId = error.response.data.request_id ?? "unknown";
    return new ApiClientError(
      message,
      error.response.status,
      type,
      code,
      requestId
    );
  }

  // Fallback for non-standard errors
  return new ApiClientError(
    error.message ?? "Unknown error",
    error.response?.status ?? 0,
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
      throw parseError(error as AxiosError<ApiError>);
    }
  },

  /** Get RAG system statistics */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await apiClient.get<StatsResponse>("/v1/stats");
      return response.data;
    } catch (error) {
      throw parseError(error as AxiosError<ApiError>);
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
      throw parseError(error as AxiosError<ApiError>);
    }
  },
};

// ===== Exports =====

export { API_BASE_URL, apiClient };
export default api;

