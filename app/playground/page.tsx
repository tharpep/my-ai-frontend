"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Play, Copy, RotateCcw, Plus, Trash2, Settings2 } from "lucide-react";

interface ComparisonResult {
  model: string;
  provider: string;
  response: string;
  time: number;
  tokens: number;
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);

  // Mock configs
  const [configs, setConfigs] = useState([
    { id: 1, provider: "Ollama", model: "llama3.2:latest", temp: 0.7, topP: 0.9 },
    { id: 2, provider: "Anthropic", model: "claude-3-sonnet", temp: 0.7, topP: 0.9 },
  ]);

  const handleRun = async () => {
    setIsRunning(true);
    
    // Simulate API calls with delays
    const mockResults: ComparisonResult[] = configs.map((config) => ({
      model: config.model,
      provider: config.provider,
      response: `This is a mock response from ${config.provider} ${config.model}. In a real implementation, this would be the actual AI response.\n\nThe response would be based on your prompt and the configuration settings you've chosen. Each model might interpret the prompt differently and produce varied outputs.\n\nYou can compare responses side-by-side to see which model performs best for your use case.`,
      time: Math.random() * 2000 + 500,
      tokens: Math.floor(Math.random() * 200) + 100,
    }));

    setTimeout(() => {
      setResults(mockResults);
      setIsRunning(false);
    }, 2000);
  };

  const addConfig = () => {
    setConfigs([
      ...configs,
      { 
        id: Date.now(), 
        provider: "Ollama", 
        model: "llama3.2:latest", 
        temp: 0.7, 
        topP: 0.9 
      },
    ]);
  };

  const removeConfig = (id: number) => {
    setConfigs(configs.filter(c => c.id !== id));
  };

  return (
    <AppShell maxWidth="7xl">
      
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Playground</h1>
          <p className="mt-2 text-zinc-400">
            Compare models and test prompts side-by-side
          </p>
        </div>

        {/* Prompt Input */}
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                <Copy className="h-4 w-4" />
                Load from Template
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>
            </div>
            <button
              onClick={handleRun}
              disabled={!prompt.trim() || isRunning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {isRunning ? "Running..." : "Run Comparison"}
            </button>
          </div>
        </div>

        {/* Model Configurations */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-100">Model Configurations</h2>
            <button
              onClick={addConfig}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Add Model
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100">Configuration {config.id}</h3>
                  <button
                    onClick={() => removeConfig(config.id)}
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">Provider</label>
                    <select
                      value={config.provider}
                      onChange={(e) => {
                        const newConfigs = configs.map(c =>
                          c.id === config.id ? { ...c, provider: e.target.value } : c
                        );
                        setConfigs(newConfigs);
                      }}
                      className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                    >
                      <option value="Ollama">Ollama</option>
                      <option value="Anthropic">Anthropic</option>
                      <option value="Purdue">Purdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">Model</label>
                    <select
                      value={config.model}
                      className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                    >
                      <option value="llama3.2:latest">llama3.2:latest</option>
                      <option value="claude-3-sonnet">claude-3-sonnet</option>
                      <option value="gpt-4">gpt-4</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Temp</label>
                      <input
                        type="number"
                        value={config.temp}
                        min="0"
                        max="2"
                        step="0.1"
                        className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Top P</label>
                      <input
                        type="number"
                        value={config.topP}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results Comparison */}
        {results.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">Results</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {result.provider} - {result.model}
                      </h3>
                      <div className="mt-1 flex gap-3 text-xs text-zinc-500">
                        <span>{result.time.toFixed(0)}ms</span>
                        <span>•</span>
                        <span>{result.tokens} tokens</span>
                      </div>
                    </div>
                    <button className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-blue-400">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded border border-zinc-800 bg-zinc-950 p-3">
                    <p className="whitespace-pre-wrap text-sm text-zinc-300">
                      {result.response}
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded bg-zinc-800 py-1 text-xs text-zinc-400 hover:bg-zinc-700">
                      👍 Better
                    </button>
                    <button className="flex-1 rounded bg-zinc-800 py-1 text-xs text-zinc-400 hover:bg-zinc-700">
                      👎 Worse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-12 text-center">
            <Play className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-zinc-400">Enter a prompt and run comparison</p>
            <p className="mt-1 text-sm text-zinc-500">
              Compare responses from different models side-by-side
            </p>
          </div>
        )}
    </AppShell>
  );
}
