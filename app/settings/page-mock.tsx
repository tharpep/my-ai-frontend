"use client";

import { useState } from "react";
import { Save, RotateCcw, CheckCircle, Key, Database, Bell } from "lucide-react";

export default function SettingsPageMock() {
  const [config, setConfig] = useState({
    provider: "ollama",
    model: "llama3.2:latest",
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    ragEnabled: true,
    libraryEnabled: true,
    journalEnabled: true,
    topK: 5,
  });

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
          <p className="mt-2 text-zinc-400">
            Configure your AI assistant (Mock UI - Backend connection needed)
          </p>
        </div>

        {/* Save/Reset Buttons */}
        <div className="mb-6 flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </button>
          <div className="ml-auto flex items-center gap-2 rounded-lg bg-green-950/30 px-4 py-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" />
            All changes saved
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Provider */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">AI Provider</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Provider
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="purdue">Purdue API</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Model
                </label>
                <select
                  value={config.model}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="llama3.2:latest">llama3.2:latest</option>
                  <option value="mistral:latest">mistral:latest</option>
                  <option value="claude-3-sonnet">claude-3-sonnet</option>
                </select>
              </div>
            </div>
          </div>

          {/* Model Parameters */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">Model Parameters</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-medium text-zinc-300">Temperature</label>
                  <span className="text-sm text-zinc-500">{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-zinc-500">Higher = more creative, Lower = more focused</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Max Tokens</label>
                <input
                  type="number"
                  value={config.maxTokens}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-medium text-zinc-300">Top P</label>
                  <span className="text-sm text-zinc-500">{config.topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.topP}
                  onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* RAG Configuration */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">RAG Configuration</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.libraryEnabled}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-zinc-300">Enable Library Context</span>
                  <p className="text-xs text-zinc-500">Use uploaded documents in responses</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.journalEnabled}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-zinc-300">Enable Journal Context</span>
                  <p className="text-xs text-zinc-500">Use previous chat history</p>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Top K Results</label>
                <input
                  type="number"
                  value={config.topK}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="mt-1 text-xs text-zinc-500">Number of document chunks to retrieve</p>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">API Keys</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Data & Privacy</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                Export All Data (JSON)
              </button>
              <button className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                Clear Chat History
              </button>
              <button className="w-full rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30">
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
