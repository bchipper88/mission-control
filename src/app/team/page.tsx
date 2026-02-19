"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function TeamPage() {
  const agents = useQuery(api.agents.list);
  const seedAgents = useMutation(api.agents.seedAgents);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    await seedAgents();
    setSeeding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team</h1>
          <p className="text-gray-400">Your digital workforce</p>
        </div>
        {agents?.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Initialize Team"}
          </button>
        )}
      </div>

      {agents?.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-gray-400 mb-4">No agents yet. Click "Initialize Team" to set up your workforce.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents?.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const statusColors = {
    idle: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    working: "bg-green-500/20 text-green-400 border-green-500/30",
    blocked: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    complete: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  const statusColor = statusColors[agent.status as keyof typeof statusColors] || statusColors.idle;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center text-3xl">
          {agent.emoji}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{agent.name}</h3>
          <p className="text-sm text-gray-400">{agent.role}</p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs border ${statusColor}`}>
            {agent.status}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Domain</p>
        <p className="text-sm text-gray-300">{agent.domain}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Responsibilities</p>
        <ul className="space-y-1">
          {agent.responsibilities?.map((r: string, i: number) => (
            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
              <span className="text-purple-400">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {agent.currentTask && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-xs text-green-400 uppercase tracking-wide mb-1">Current Task</p>
          <p className="text-sm text-gray-300">{agent.currentTask}</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Last active: {new Date(agent.lastActive).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
