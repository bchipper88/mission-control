'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Brain, Filter, Search, BookOpen, Lightbulb, Star, FileText, RefreshCw, FolderOpen } from 'lucide-react';

interface MemoryEntry {
  id: string;
  path: string;
  filename: string;
  content: string;
  type: 'core' | 'note' | 'learning' | 'decision' | 'idea' | 'research';
  created_at: string;
  modified_at: string;
  tags: string[];
  agent_id: string;
}

const memoryTypeIcons: Record<string, typeof BookOpen> = {
  core: Brain,
  note: FileText,
  decision: Lightbulb,
  learning: BookOpen,
  idea: Star,
  research: Search,
};

const memoryTypeColors: Record<string, string> = {
  core: 'purple',
  note: 'blue',
  decision: 'yellow',
  learning: 'green',
  idea: 'cyan',
  research: 'default',
};

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [workspace, setWorkspace] = useState<string>('');

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      setMemories(data.memories || []);
      setWorkspace(data.workspace || '');
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const filteredMemories = memories.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !m.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Count by type
  const typeCounts = memories.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-purple" />
            Memory
          </h1>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            {workspace ? `Reading from: ${workspace}` : 'OpenClaw workspace files'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-text-muted">
              Updated {formatTimestamp(lastRefresh.toISOString())}
            </span>
          )}
          <button 
            onClick={fetchMemories}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary border border-border text-text-secondary text-xs font-medium rounded-md hover:bg-bg-hover disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-border rounded-md text-xs text-text-primary outline-none"
        >
          <option value="all">All Types</option>
          <option value="core">Core (MEMORY.md)</option>
          <option value="note">Notes</option>
          <option value="decision">Decisions</option>
          <option value="learning">Learnings</option>
          <option value="idea">Ideas</option>
          <option value="research">Research</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        {(['core', 'note', 'decision', 'learning', 'idea', 'research'] as const).map((type) => {
          const Icon = memoryTypeIcons[type];
          const count = typeCounts[type] || 0;
          return (
            <Card 
              key={type} 
              hover
              className={`cursor-pointer ${filterType === type ? 'ring-1 ring-accent-purple' : ''}`}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
            >
              <CardContent className="flex items-center gap-2 py-2">
                <Icon className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] text-text-muted capitalize">{type}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Memory Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">
            {memories.length === 0 
              ? 'No memory files found in workspace. Create MEMORY.md or files in memory/ directory.'
              : 'No memories match your search'}
          </div>
        ) : (
          filteredMemories.map((memory) => {
            const Icon = memoryTypeIcons[memory.type] || FileText;
            const colorVariant = memoryTypeColors[memory.type] as 'blue' | 'cyan' | 'purple' | 'green' | 'yellow' | 'default';

            return (
              <Card key={memory.id} hover>
                <CardContent className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-text-muted" />
                    <Badge variant={colorVariant}>
                      {memory.type}
                    </Badge>
                    <span className="text-xs font-mono text-accent-cyan">{memory.filename}</span>
                    <span className="text-[10px] text-text-muted ml-auto">
                      Modified {formatTimestamp(memory.modified_at)}
                    </span>
                  </div>

                  {/* Content preview */}
                  <div className="bg-bg-secondary rounded-md p-3 border border-border">
                    <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                      {memory.content}
                    </pre>
                  </div>

                  {/* Tags */}
                  {memory.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {memory.tags.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">#{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Path */}
                  <p className="text-[10px] text-text-muted font-mono truncate">
                    {memory.path}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
