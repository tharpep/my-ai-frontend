"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { usePromptsStore } from "@/stores/promptsStore";
import { Plus, Star, Trash2, Edit2, Copy, Search, Filter } from "lucide-react";

export default function PromptsPage() {
  const {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    setActivePrompt,
    activePromptId,
  } = usePromptsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "custom" as const,
    isFavorite: false,
  });

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || prompt.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePrompt(editingId, formData);
      setEditingId(null);
    } else {
      addPrompt(formData);
    }
    setFormData({ name: "", content: "", category: "custom", isFavorite: false });
    setIsCreating(false);
  };

  const handleEdit = (prompt: any) => {
    setFormData({
      name: prompt.name,
      content: prompt.content,
      category: prompt.category,
      isFavorite: prompt.isFavorite,
    });
    setEditingId(prompt.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this prompt?")) {
      deletePrompt(id);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  return (
    <AppShell maxWidth="7xl">
      
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Prompts Library</h1>
            <p className="mt-2 text-zinc-400">
              Save and manage your favorite AI system prompts
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Prompt
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="coding">Coding</option>
              <option value="creative">Creative</option>
              <option value="analysis">Analysis</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">
              {editingId ? "Edit Prompt" : "Create New Prompt"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Technical Writer"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as any })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="general">General</option>
                  <option value="coding">Coding</option>
                  <option value="creative">Creative</option>
                  <option value="analysis">Analysis</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  System Prompt
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="You are a helpful assistant..."
                  rows={6}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFavorite}
                    onChange={(e) =>
                      setFormData({ ...formData, isFavorite: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-sm text-zinc-300">Mark as favorite</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingId(null);
                      setFormData({
                        name: "",
                        content: "",
                        category: "custom",
                        isFavorite: false,
                      });
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {editingId ? "Save Changes" : "Create Prompt"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Prompts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className={`
                group rounded-lg border p-4 transition-colors
                ${
                  prompt.id === activePromptId
                    ? "border-blue-500 bg-blue-950/20"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }
              `}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-zinc-100">
                      {prompt.name}
                    </h3>
                    {prompt.isFavorite && (
                      <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <span className="mt-1 inline-block rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {prompt.category}
                  </span>
                </div>

                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => toggleFavorite(prompt.id)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-yellow-500"
                    aria-label="Toggle favorite"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(prompt.content)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-blue-400"
                    aria-label="Copy prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-green-400"
                    aria-label="Edit prompt"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                    aria-label="Delete prompt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mb-3 line-clamp-3 text-sm text-zinc-400">{prompt.content}</p>

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Used {prompt.useCount} times</span>
                <button
                  onClick={() => setActivePrompt(prompt.id === activePromptId ? null : prompt.id)}
                  className={`
                    rounded px-3 py-1 font-medium transition-colors
                    ${
                      prompt.id === activePromptId
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }
                  `}
                >
                  {prompt.id === activePromptId ? "Active" : "Set Active"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
            <p className="text-zinc-400">No prompts found</p>
            <p className="mt-1 text-sm text-zinc-500">
              {searchQuery ? "Try a different search" : "Create your first prompt to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
