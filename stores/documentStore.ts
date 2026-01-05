/**
 * Document Store - Manages document uploads and library
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'indexed' | 'failed';
  uploadedAt: number;
  error?: string;
  metadata?: {
    chunks?: number;
    pages?: number;
  };
}

interface DocumentStore {
  documents: Document[];
  uploading: boolean;
  error: string | null;

  // Actions
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setUploading: (uploading: boolean) => void;
  setError: (error: string | null) => void;
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set) => ({
      documents: [],
      uploading: false,
      error: null,

      addDocument: (doc) =>
        set((state) => ({
          documents: [doc, ...state.documents],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        })),

      setUploading: (uploading) => set({ uploading }),
      
      setError: (error) => set({ error }),

      clearDocuments: () => set({ documents: [] }),
    }),
    {
      name: 'document-storage',
    }
  )
);
