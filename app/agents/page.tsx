"use client";

import { useState } from "react";
import { Bot, Plus, Star, Play, Settings, Copy, Trash2, Edit2 } from "lucide-react";

// Mock agent templates
const mockAgents = [
  {
    id: "agent-1",
    name: "Code Reviewer",
    description: "Reviews code for best practices, security issues, and performance",
    icon: "💻",
    category: "development",
    systemPrompt: "You are an expert code reviewer...",
    temperature: 0.3,
    favorite: true,
    useCount: 24,
  },
  {
    id: "agent-2",
    name: "Creative Writer",
    description: "Generates creative content, stories, and marketing copy",
    icon: "✍️",
    category: "creative",
    systemPrompt: "You are a creative writer...",
    temperature: 0.9,
    favorite: false,
    useCount: 12,
  },
  {
    id: "agent-3",
    name: "Data Analyst",
    description: "Analyzes data, creates visualizations, and provides insights",
    icon: "📊",
    category: "analysis",
    systemPrompt: "You are a data analyst...",
    temperature: 0.5,
    favorite: true,
    useCount: 18,
  },
  {
    id: "agent-4",
    name: "Research Assistant",
    description: "Helps with research, summarization, and fact-checking",
    icon: "🔬",
    category: "research",
    systemPrompt: "You are a research assistant...",
    temperature: 0.4,
    favorite: false,
    useCount: 31,
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAgents = selectedCategory === "all"
    ? agents
    : agents.filter(a => a.category === selectedCategory);

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Custom Agents</h1>
            <p className="mt-2 text-zinc-400">
              Pre-configured AI assistants for specific tasks
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Create Agent
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2">
          {["all", "development", "creative", "analysis", "research"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Agents Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{agent.icon}</div>
                  <div>
                    <h3 className="font-semibold text-zinc-100">{agent.name}</h3>
                    <span className="text-xs text-zinc-500">{agent.category}</span>
                  </div>
                </div>
                {agent.favorite && (
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                )}
              </div>

              <p className="mb-4 text-sm text-zinc-400">{agent.description}</p>

              <div className="mb-4 flex items-center gap-3 text-xs text-zinc-500">
                <span>Used {agent.useCount} times</span>
                <span>•</span>
                <span>Temp: {agent.temperature}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Play className="h-4 w-4" />
                  Start Chat
                </button>
                <button className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Templates Section */}
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-zinc-100">Popular Templates</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { name: "Bug Finder", desc: "Identify and fix code bugs", icon: "🐛" },
              { name: "Email Writer", desc: "Draft professional emails", icon: "✉️" },
              { name: "Meeting Summarizer", desc: "Summarize meeting notes", icon: "📝" },
              { name: "Translation Assistant", desc: "Translate between languages", icon: "🌍" },
            ].map((template, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700"
              >
                <div className="text-2xl">{template.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-zinc-100">{template.name}</h4>
                  <p className="text-xs text-zinc-500">{template.desc}</p>
                </div>
                <button className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700">
                  Use
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
