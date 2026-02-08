'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'task' | 'agent' | 'project' | 'page';
  href: string;
}

const pages: SearchResult[] = [
  { id: 'p-mc', title: 'Mission Control', subtitle: 'Dashboard overview', type: 'page', href: '/mission-control' },
  { id: 'p-tasks', title: 'Tasks', subtitle: 'Kanban board', type: 'page', href: '/tasks' },
  { id: 'p-chat', title: 'Chat', subtitle: 'Real-time messaging', type: 'page', href: '/chat' },
  { id: 'p-council', title: 'Council', subtitle: 'Multi-agent discussions', type: 'page', href: '/council' },
  { id: 'p-calendar', title: 'Calendar', subtitle: 'Scheduled tasks', type: 'page', href: '/calendar' },
  { id: 'p-projects', title: 'Projects', subtitle: 'Project management', type: 'page', href: '/projects' },
  { id: 'p-memory', title: 'Memory', subtitle: 'Agent memory', type: 'page', href: '/memory' },
  { id: 'p-captures', title: 'Captures', subtitle: 'Screenshots & media', type: 'page', href: '/captures' },
  { id: 'p-docs', title: 'Docs', subtitle: 'Documents', type: 'page', href: '/docs' },
  { id: 'p-people', title: 'People', subtitle: 'Directory', type: 'page', href: '/people' },
  { id: 'p-org', title: 'Org', subtitle: 'Organization chart', type: 'page', href: '/org' },
  { id: 'p-office', title: 'Office', subtitle: 'Virtual office', type: 'page', href: '/office' },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, tasks, agents, projects } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const getResults = useCallback((): SearchResult[] => {
    if (!query.trim()) return pages;

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search pages
    pages.forEach((page) => {
      if (page.title.toLowerCase().includes(q) || page.subtitle.toLowerCase().includes(q)) {
        results.push(page);
      }
    });

    // Search tasks
    tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q)) {
        results.push({
          id: task.id,
          title: task.title,
          subtitle: `Task - ${task.status}`,
          type: 'task',
          href: '/tasks',
        });
      }
    });

    // Search agents
    agents.forEach((agent) => {
      if (agent.name.toLowerCase().includes(q) || agent.role.toLowerCase().includes(q)) {
        results.push({
          id: agent.id,
          title: agent.name,
          subtitle: agent.role,
          type: 'agent',
          href: '/org',
        });
      }
    });

    // Search projects
    projects.forEach((project) => {
      if (project.name.toLowerCase().includes(q) || project.description?.toLowerCase().includes(q)) {
        results.push({
          id: project.id,
          title: project.name,
          subtitle: project.description || 'Project',
          type: 'project',
          href: '/projects',
        });
      }
    });

    return results;
  }, [query, tasks, agents, projects]);

  const results = getResults();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      inputRef.current?.focus();
      setQuery('');
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommandPaletteOpen(false)} />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-bg-secondary border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, agents, projects..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <kbd className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-text-muted text-sm">No results found</div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  index === selectedIndex ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-secondary hover:bg-bg-hover'
                }`}
                onClick={() => {
                  router.push(result.href);
                  setCommandPaletteOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{result.title}</div>
                  <div className="text-[10px] text-text-muted truncate">{result.subtitle}</div>
                </div>
                <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-50" />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[10px] text-text-muted">
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 rounded">↵</kbd> select</span>
          <span><kbd className="bg-bg-tertiary px-1 py-0.5 rounded">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
