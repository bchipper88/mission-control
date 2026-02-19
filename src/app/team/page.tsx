"use client";

const agents = [
  { name: "Bellatrix", emoji: "🖤", role: "Chief of Staff", domain: "Operations", status: "working", responsibilities: ["Task coordination", "Sub-agent management", "Memory maintenance", "Proactive suggestions"] },
  { name: "Severus", emoji: "🧪", role: "Technical SEO Engineer", domain: "SEO", status: "idle", responsibilities: ["PR review", "SEO audits", "Content quality gate", "Technical optimization"] },
  { name: "Jovie", emoji: "🎄", role: "Christmas Site CEO", domain: "thebestchristmas.co", status: "working", responsibilities: ["Content creation", "Page optimization", "Image generation", "SEO improvements"] },
  { name: "Regulus", emoji: "🦖", role: "Jurassic Apparel CEO", domain: "jurassicapparel.com", status: "idle", responsibilities: ["Product strategy", "Social media", "Brand growth", "Dino news"] },
  { name: "Skeeter", emoji: "📰", role: "Content Writer", domain: "Content", status: "idle", responsibilities: ["Blog writing", "SEO content", "Research", "Copywriting"] },
  { name: "Molly", emoji: "🏔️", role: "LV Directory CEO", domain: "lasvegasdirectory.co", status: "idle", responsibilities: ["Local business curation", "Content expansion", "SEO optimization"] },
  { name: "Lucius", emoji: "🏔️", role: "Denver Directory CEO", domain: "denverdirectory.co", status: "idle", responsibilities: ["Local business curation", "Content expansion", "SEO optimization"] },
  { name: "Hermione", emoji: "📚", role: "Savannah Directory CEO", domain: "savannahdirectory.co", status: "idle", responsibilities: ["Local business curation", "Content expansion", "SEO optimization"] },
];

export default function TeamPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">Team</h1>
      <p className="text-gray-400 mb-8">Your agent roster</p>

      <div className="grid gap-6">
        {agents.map((agent) => (
          <div key={agent.name} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{agent.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-semibold">{agent.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    agent.status === "working" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <p className="text-orange-400 text-sm mb-1">{agent.role}</p>
                <p className="text-gray-500 text-sm mb-3">{agent.domain}</p>
                <div className="flex flex-wrap gap-2">
                  {agent.responsibilities.map((r) => (
                    <span key={r} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
