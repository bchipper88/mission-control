"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const memories = useQuery(api.memories.list, { limit: 100 });
  const categories = useQuery(api.memories.categories);
  const searchResults = useQuery(
    api.memories.search,
    searchQuery.length > 2 ? { query: searchQuery, category: selectedCategory || undefined } : "skip"
  );

  const displayMemories = searchQuery.length > 2 ? searchResults : memories;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Memory</h1>
          <p className="text-gray-400">Your digital brain - searchable knowledge base</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === null
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Memory List */}
      {!displayMemories || displayMemories.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <p className="text-6xl mb-4">🧠</p>
          <p className="text-gray-400 mb-4">
            {searchQuery ? "No memories match your search" : "No memories yet"}
          </p>
          <p className="text-sm text-gray-500">
            Memories are synced from your markdown files and agent activity
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayMemories.map((memory) => (
            <MemoryCard key={memory._id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryCard({ memory }: { memory: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">{memory.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
              {memory.category}
            </span>
            {memory.source && (
              <span className="text-xs text-gray-500">{memory.source}</span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(memory.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {expanded ? "▼" : "▶"}
        </button>
      </div>

      <div className={`prose prose-invert prose-sm max-w-none ${expanded ? "" : "line-clamp-3"}`}>
        <p className="text-gray-300 whitespace-pre-wrap">{memory.content}</p>
      </div>

      {memory.tags?.length > 0 && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {memory.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
