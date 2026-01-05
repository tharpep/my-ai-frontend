"use client";

import { MessageSquare, Clock, Zap, TrendingUp, Calendar, FileText } from "lucide-react";

export default function AnalyticsPage() {
  // Mock data
  const dailyUsage = [12, 25, 18, 42, 35, 28, 15];
  const maxUsage = Math.max(...dailyUsage);

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100">Analytics</h1>
          <p className="mt-2 text-zinc-400">Track your AI assistant usage and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">1,247</p>
            <p className="text-sm text-zinc-500">Total Messages</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <Clock className="h-5 w-5 text-green-400" />
              <span className="text-xs text-green-400">-8%</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">2.4s</p>
            <p className="text-sm text-zinc-500">Avg Response Time</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="text-xs text-green-400">+24%</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">142K</p>
            <p className="text-sm text-zinc-500">Tokens Used</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-2 flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <span className="text-xs text-green-400">+18%</span>
            </div>
            <p className="text-3xl font-bold text-zinc-100">87%</p>
            <p className="text-sm text-zinc-500">Satisfaction</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Usage Chart */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-6 text-lg font-semibold text-zinc-100">Daily Usage (Last 7 Days)</h3>
              <div className="flex h-64 items-end justify-between gap-4">
                {dailyUsage.map((count, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t-lg bg-blue-600 transition-all hover:bg-blue-500"
                        style={{ height: `${(count / maxUsage) * 200}px` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Models */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Models Used</h3>
            <div className="space-y-3">
              {[
                { model: "llama3.2:latest", percentage: 45, count: 562 },
                { model: "claude-3-sonnet", percentage: 32, count: 399 },
                { model: "gpt-4", percentage: 23, count: 286 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-300">{item.model}</span>
                    <span className="text-zinc-500">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Top Prompts */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">Most Used Prompts</h3>
            <div className="space-y-2">
              {[
                { name: "Code Helper", uses: 87 },
                { name: "General Assistant", uses: 64 },
                { name: "Creative Writer", uses: 42 },
                { name: "Research Assistant", uses: 28 },
              ].map((prompt, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{prompt.name}</span>
                  <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                    {prompt.uses} uses
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RAG Performance */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">RAG Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Avg Relevance Score</span>
                  <span className="font-medium text-green-400">0.87</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 w-[87%] rounded-full bg-green-600" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Documents Used</span>
                  <span className="font-medium text-blue-400">24</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Avg Chunks per Query</span>
                  <span className="font-medium text-purple-400">5.2</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-zinc-400">Context Hit Rate</span>
                  <span className="font-medium text-orange-400">92%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 w-[92%] rounded-full bg-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
