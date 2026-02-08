'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { Badge } from '@/components/ui/Badge';
import { Brain, Plus, Filter, Search, BookOpen, Lightbulb, Star, FileText } from 'lucide-react';

const memoryTypeIcons: Record<string, typeof BookOpen> = {
  note: FileText,
  capture: Star,
  decision: Lightbulb,
  learning: BookOpen,
};

const memoryTypeColors: Record<string, string> = {
  note: 'blue',
  capture: 'cyan',
  decision: 'purple',
  learning: 'green',
};

export default function MemoryPage() {
  const { memories, agents } = useStore();
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMemories = memories.filter((m) => {
    if (filterAgent !== 'all' && m.agent_id !== filterAgent) return false;
    if (filterType !== 'all' && m.memory_type !== filterType) return false;
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-purple" />
            Memory
          </h1>
          <p className="text-xs text-text-muted mt-1">Agent knowledge and learnings</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-accent-purple text-white text-xs font-medium rounded-md hover:bg-accent-purple/90">
          <Plus className="w-3.5 h-3.5" />
          Add Memory
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border rounded-md text-xs text-text-primary placeholder-text-muted outline-none focus:border-accent-purple"
          />
        </div>
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-border rounded-md text-xs text-text-primary outline-none"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-border rounded-md text-xs text-text-primary outline-none"
        >
          <option value="all">All Types</option>
          <option value="note">Notes</option>
          <option value="decision">Decisions</option>
          <option value="learning">Learnings</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['note', 'decision', 'learning'] as const).map((type) => {
          const Icon = memoryTypeIcons[type];
          const count = memories.filter((m) => m.memory_type === type).length;
          return (
            <Card key={type}>
              <CardContent className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] text-text-muted capitalize">{type}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Memory Cards */}
      <div className="space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">No memories found</div>
        ) : (
          filteredMemories.map((memory) => {
            const agent = agents.find((a) => a.id === memory.agent_id);
            const Icon = memoryTypeIcons[memory.memory_type] || FileText;

            return (
              <Card key={memory.id} hover>
                <CardContent className="flex gap-4">
                  {agent && <AgentAvatar agent={agent} size="md" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-text-muted" />
                      <Badge variant={memoryTypeColors[memory.memory_type] as 'blue' | 'cyan' | 'purple' | 'green'}>
                        {memory.memory_type}
                      </Badge>
                      {agent && (
                        <span className="text-[10px] text-text-muted">{agent.name}</span>
                      )}
                      <span className="text-[10px] text-text-muted ml-auto">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">{memory.content}</p>
                    {memory.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {memory.tags.map((tag) => (
                          <Badge key={tag} variant="default">{tag}</Badge>
                        ))}
                      </div>
                    )}
                    {memory.source && (
                      <p className="text-[10px] text-text-muted mt-1">Source: {memory.source}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
