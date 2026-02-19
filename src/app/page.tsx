"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard() {
  const agents = useQuery(api.agents.list);
  const workingAgents = agents?.filter((a) => a.status === "working") || [];
  const idleAgents = agents?.filter((a) => a.status === "idle") || [];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Overview of your digital empire</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Agents"
          value={agents?.length || 0}
          icon="👥"
          color="purple"
        />
        <StatCard
          label="Working"
          value={workingAgents.length}
          icon="⚡"
          color="green"
        />
        <StatCard
          label="Idle"
          value={idleAgents.length}
          icon="😴"
          color="gray"
        />
        <StatCard
          label="Tasks Today"
          value="-"
          icon="📋"
          color="blue"
        />
      </div>

      {/* Active Work */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently Working</h2>
        {workingAgents.length === 0 ? (
          <p className="text-gray-500">No agents currently working</p>
        ) : (
          <div className="space-y-3">
            {workingAgents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4"
              >
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-400">{agent.currentTask || "Working..."}</p>
                </div>
                <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  Working
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Overview */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Team Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {agents?.map((agent) => (
            <div
              key={agent._id}
              className="bg-gray-800/50 rounded-lg p-4 text-center"
            >
              <span className="text-3xl block mb-2">{agent.emoji}</span>
              <p className="font-medium text-sm">{agent.name}</p>
              <p className={`text-xs mt-1 ${
                agent.status === "working" ? "text-green-400" :
                agent.status === "idle" ? "text-gray-500" :
                "text-yellow-400"
              }`}>
                {agent.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: "purple" | "green" | "gray" | "blue";
}) {
  const colorClasses = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
    gray: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
