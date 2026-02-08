'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { Badge } from '@/components/ui/Badge';
import { Search as SearchIcon, ListTodo, UserCircle, FolderOpen, FileText, Brain, ArrowRight } from 'lucide-react';

type ResultType = 'task' | 'agent' | 'project' | 'memory';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: ResultType;
  data: unknown;
}

const typeIcons: Record<ResultType, typeof ListTodo> = {
  task: ListTodo,
  agent: UserCircle,
  project: FolderOpen,
  memory: Brain,
};

const typeColors: Record<ResultType, string> = {
  task: 'blue',
  agent: 'purple',
  project: 'green',
  memory: 'cyan',
};

export default function SearchPage() {
  const { tasks, agents, projects, memories } = useStore();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<ResultType | 'all'>('all');

  const getResults = (): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    if (filterType === 'all' || filterType === 'task') {
      tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
          results.push({ id: t.id, title: t.title, subtitle: `${t.status} · ${t.priority}`, type: 'task', data: t });
        }
      });
    }

    if (filterType === 'all' || filterType === 'agent') {
      agents.forEach((a) => {
        if (a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)) {
          results.push({ id: a.id, title: a.name, subtitle: a.role, type: 'agent', data: a });
        }
      });
    }

    if (filterType === 'all' || filterType === 'project') {
      projects.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
          results.push({ id: p.id, title: p.name, subtitle: p.description || '', type: 'project', data: p });
        }
      });
    }

    if (filterType === 'all' || filterType === 'memory') {
      memories.forEach((m) => {
        if (m.content.toLowerCase().includes(q)) {
          results.push({ id: m.id, title: m.content.slice(0, 80) + '...', subtitle: m.memory_type, type: 'memory', data: m });
        }
      });
    }

    return results;
  };

  const results = getResults();
  const groupedResults = results.reduce<Record<ResultType, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<ResultType, SearchResult[]>);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-accent-yellow" />
          Search
        </h1>
        <p className="text-xs text-text-muted mt-1">Search across all tasks, agents, projects, and memories</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search..."
          autoFocus
          className="w-full pl-11 pr-4 py-3 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-yellow"
        />
      </div>

      {/* Type Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'task', 'agent', 'project', 'memory'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterType === type
                ? 'bg-accent-yellow/15 text-accent-yellow'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
          </button>
        ))}
        {query && (
          <span className="text-xs text-text-muted ml-auto">{results.length} results</span>
        )}
      </div>

      {/* Results */}
      {!query ? (
        <div className="text-center py-16 text-text-muted">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Start typing to search</p>
          <p className="text-xs mt-1">Or press <kbd className="bg-bg-tertiary px-1.5 py-0.5 rounded text-[10px]">Cmd+K</kbd> for quick search</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(Object.entries(groupedResults) as [ResultType, SearchResult[]][]).map(([type, items]) => {
            const Icon = typeIcons[type];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5 text-text-muted" />
                  <h3 className="text-xs font-semibold text-text-muted uppercase">{type}s</h3>
                  <Badge variant={typeColors[type] as 'blue' | 'purple' | 'green' | 'cyan'}>{items.length}</Badge>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Card key={item.id} hover>
                      <CardContent className="flex items-center gap-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.title}</p>
                          <p className="text-[10px] text-text-muted truncate">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
