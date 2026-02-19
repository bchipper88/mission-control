"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Agent data (static for now, can move to DB later)
const agents = [
  { name: "Bellatrix", emoji: "🖤", role: "Chief of Staff", status: "working" },
  { name: "Severus", emoji: "🧪", role: "SEO Reviewer", status: "idle" },
  { name: "Jovie", emoji: "🎄", role: "Christmas CEO", status: "working" },
  { name: "Regulus", emoji: "🦖", role: "Jurassic CEO", status: "idle" },
  { name: "Skeeter", emoji: "📰", role: "Content Writer", status: "idle" },
  { name: "Molly", emoji: "🏔️", role: "LV Directory CEO", status: "idle" },
  { name: "Lucius", emoji: "🏔️", role: "Denver CEO", status: "idle" },
  { name: "Hermione", emoji: "📚", role: "Savannah CEO", status: "idle" },
];

interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  blocked: number;
  done: number;
}

export default function Dashboard() {
  const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, todo: 0, in_progress: 0, blocked: 0, done: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from("tasks").select("status");
      if (data) {
        setTaskStats({
          total: data.length,
          todo: data.filter(t => t.status === "todo").length,
          in_progress: data.filter(t => t.status === "in_progress").length,
          blocked: data.filter(t => t.status === "blocked").length,
          done: data.filter(t => t.status === "done").length,
        });
      }
    }
    fetchStats();
  }, []);

  const workingAgents = agents.filter((a) => a.status === "working");

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Overview of your digital empire</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Agents" value={agents.length} icon="👥" color="purple" />
        <StatCard label="Tasks" value={taskStats.total} icon="📋" color="blue" />
        <StatCard label="In Progress" value={taskStats.in_progress} icon="⚡" color="green" />
        <StatCard label="Completed" value={taskStats.done} icon="✅" color="gray" />
      </div>

      {/* Active Work */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently Working</h2>
        {workingAgents.length === 0 ? (
          <p className="text-gray-500">No agents currently working</p>
        ) : (
          <div className="space-y-3">
            {workingAgents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-400">{agent.role}</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Working</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Overview */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Team Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div key={agent.name} className="bg-gray-800/50 rounded-lg p-4 text-center">
              <span className="text-3xl block mb-2">{agent.emoji}</span>
              <p className="font-medium text-sm">{agent.name}</p>
              <p className="text-xs text-gray-500 mb-1">{agent.role}</p>
              <p className={`text-xs ${agent.status === "working" ? "text-green-400" : "text-gray-500"}`}>
                {agent.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: "purple" | "green" | "gray" | "blue" }) {
  const colorClasses = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
    gray: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  };
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-6`}>
      <div className="flex items-center justify-between mb-2"><span className="text-2xl">{icon}</span></div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
