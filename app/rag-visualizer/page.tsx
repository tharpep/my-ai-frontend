"use client";

import { useState } from "react";
import { Network, FileText, MessageSquare, Search, Filter, Zap, TrendingUp } from "lucide-react";

// Placeholder data for visualization
const mockDocuments = [
  { id: "doc1", name: "Project Requirements.pdf", chunks: 24, connections: 18, color: "blue" },
  { id: "doc2", name: "API Documentation.md", chunks: 45, connections: 32, color: "green" },
  { id: "doc3", name: "Meeting Notes.txt", chunks: 12, connections: 8, color: "purple" },
  { id: "doc4", name: "Research Paper.pdf", chunks: 67, connections: 41, color: "orange" },
  { id: "doc5", name: "Code Guidelines.md", chunks: 28, connections: 15, color: "pink" },
];

const mockConnections = [
  { from: "doc1", to: "doc2", strength: 0.8 },
  { from: "doc1", to: "doc3", strength: 0.6 },
  { from: "doc2", to: "doc4", strength: 0.9 },
  { from: "doc3", to: "doc5", strength: 0.5 },
  { from: "doc4", to: "doc5", strength: 0.7 },
];

const mockChats = [
  { id: "chat1", name: "API Integration Help", docs: ["doc1", "doc2"], chunks: 8 },
  { id: "chat2", name: "Code Review Discussion", docs: ["doc2", "doc5"], chunks: 12 },
  { id: "chat3", name: "Research Analysis", docs: ["doc4"], chunks: 15 },
];

export default function RAGVisualizerPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"network" | "heatmap">("network");

  const selectedDocData = mockDocuments.find(d => d.id === selectedDoc);

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">RAG Visualizer</h1>
          <p className="mt-2 text-zinc-400">
            Explore document relationships and RAG performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-950/30 p-2">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{mockDocuments.length}</p>
                <p className="text-xs text-zinc-500">Documents</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-950/30 p-2">
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">176</p>
                <p className="text-xs text-zinc-500">Total Chunks</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-950/30 p-2">
                <Network className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">114</p>
                <p className="text-xs text-zinc-500">Connections</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-950/30 p-2">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">87%</p>
                <p className="text-xs text-zinc-500">Avg Relevance</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            <button
              onClick={() => setViewMode("network")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "network"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Network View
            </button>
            <button
              onClick={() => setViewMode("heatmap")}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "heatmap"
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Usage Heatmap
            </button>
          </div>

          <div className="flex-1" />

          <button className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Visualization Area */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              {viewMode === "network" ? (
                <div className="relative aspect-video">
                  {/* Network Graph Placeholder */}
                  <div className="flex h-full items-center justify-center">
                    <div className="relative h-full w-full">
                      {/* Nodes */}
                      {mockDocuments.map((doc, i) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc.id)}
                          className={`absolute flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${
                            selectedDoc === doc.id
                              ? "border-blue-500 bg-blue-950 shadow-lg shadow-blue-500/50"
                              : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                          }`}
                          style={{
                            left: `${20 + (i * 15)}%`,
                            top: `${30 + (i % 3) * 20}%`,
                          }}
                        >
                          <FileText className={`h-6 w-6 text-${doc.color}-400`} />
                        </button>
                      ))}

                      {/* Connection Lines */}
                      <svg className="absolute inset-0 h-full w-full">
                        {mockConnections.map((conn, i) => {
                          const fromIndex = mockDocuments.findIndex(d => d.id === conn.from);
                          const toIndex = mockDocuments.findIndex(d => d.id === conn.to);
                          return (
                            <line
                              key={i}
                              x1={`${20 + (fromIndex * 15) + 5}%`}
                              y1={`${30 + (fromIndex % 3) * 20 + 5}%`}
                              x2={`${20 + (toIndex * 15) + 5}%`}
                              y2={`${30 + (toIndex % 3) * 20 + 5}%`}
                              stroke="rgb(63 63 70)"
                              strokeWidth={conn.strength * 3}
                              opacity={0.3}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm text-zinc-500">
                    Click on nodes to see details • Line thickness = connection strength
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-100">Document Usage in Chats</h3>
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3">
                      <span className="w-32 truncate text-xs text-zinc-400">{doc.name}</span>
                      <div className="flex-1 rounded-full bg-zinc-800">
                        <div
                          className={`h-2 rounded-full bg-${doc.color}-500`}
                          style={{ width: `${(doc.connections / 50) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{doc.connections} uses</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            {/* Selected Document Info */}
            {selectedDocData ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <FileText className="h-4 w-4" />
                  {selectedDocData.name}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Chunks</span>
                    <span className="font-medium text-zinc-300">{selectedDocData.chunks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Connections</span>
                    <span className="font-medium text-zinc-300">{selectedDocData.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg Similarity</span>
                    <span className="font-medium text-green-400">0.84</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Last Used</span>
                    <span className="font-medium text-zinc-300">2 hours ago</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-center text-sm text-zinc-500">
                Select a document to view details
              </div>
            )}

            {/* Related Chats */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">Recent RAG Usage</h3>
              <div className="space-y-2">
                {mockChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-800 p-3 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-200">{chat.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {chat.docs.length} docs • {chat.chunks} chunks used
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Chunks */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">Top Performing Chunks</h3>
              <div className="space-y-2">
                {[
                  { doc: "API Documentation.md", score: 0.94 },
                  { doc: "Research Paper.pdf", score: 0.91 },
                  { doc: "Project Requirements.pdf", score: 0.88 },
                ].map((chunk, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate text-zinc-400">{chunk.doc}</span>
                    <span className="font-mono font-medium text-green-400">{chunk.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
