'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Wrench,
  RefreshCw,
  Search,
  Terminal,
  Globe,
  MessageSquare,
  Camera,
  Folder,
  Clock,
  Zap,
  ChevronRight,
  Code,
  Smartphone,
  Image,
  Volume2,
  Database
} from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }[];
}

const CATEGORY_ICONS: Record<string, typeof Wrench> = {
  file: Folder,
  web: Globe,
  browser: Globe,
  exec: Terminal,
  message: MessageSquare,
  nodes: Smartphone,
  media: Image,
  tts: Volume2,
  search: Search,
  automation: Clock,
  database: Database,
  default: Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  file: '#22c55e',
  web: '#3b82f6',
  browser: '#8b5cf6',
  exec: '#f59e0b',
  message: '#06b6d4',
  nodes: '#ec4899',
  media: '#f43f5e',
  tts: '#84cc16',
  search: '#6366f1',
  automation: '#eab308',
  database: '#14b8a6',
  default: '#6b7280',
};

// Default tools list (from system prompt)
const DEFAULT_TOOLS: Tool[] = [
  {
    name: 'Read',
    description: 'Read file contents. Supports text files and images.',
    category: 'file',
    enabled: true,
    parameters: [
      { name: 'file_path', type: 'string', required: true, description: 'Path to the file to read' },
      { name: 'offset', type: 'number', required: false, description: 'Line number to start reading from' },
      { name: 'limit', type: 'number', required: false, description: 'Maximum lines to read' },
    ],
  },
  {
    name: 'Write',
    description: 'Write content to a file. Creates parent directories automatically.',
    category: 'file',
    enabled: true,
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Path to the file' },
      { name: 'content', type: 'string', required: true, description: 'Content to write' },
    ],
  },
  {
    name: 'Edit',
    description: 'Edit a file by replacing exact text.',
    category: 'file',
    enabled: true,
    parameters: [
      { name: 'path', type: 'string', required: true },
      { name: 'old_string', type: 'string', required: true },
      { name: 'new_string', type: 'string', required: true },
    ],
  },
  {
    name: 'exec',
    description: 'Execute shell commands with background continuation.',
    category: 'exec',
    enabled: true,
    parameters: [
      { name: 'command', type: 'string', required: true },
      { name: 'workdir', type: 'string', required: false },
      { name: 'timeout', type: 'number', required: false },
      { name: 'background', type: 'boolean', required: false },
    ],
  },
  {
    name: 'process',
    description: 'Manage running exec sessions: list, poll, log, write, kill.',
    category: 'exec',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'list, poll, log, write, kill' },
      { name: 'sessionId', type: 'string', required: false },
    ],
  },
  {
    name: 'web_search',
    description: 'Search the web using Brave Search API.',
    category: 'search',
    enabled: true,
    parameters: [
      { name: 'query', type: 'string', required: true },
      { name: 'count', type: 'number', required: false },
      { name: 'country', type: 'string', required: false },
    ],
  },
  {
    name: 'web_fetch',
    description: 'Fetch and extract readable content from a URL.',
    category: 'web',
    enabled: true,
    parameters: [
      { name: 'url', type: 'string', required: true },
      { name: 'extractMode', type: 'string', required: false, description: 'markdown or text' },
      { name: 'maxChars', type: 'number', required: false },
    ],
  },
  {
    name: 'browser',
    description: 'Control web browser via OpenClaw browser control server.',
    category: 'browser',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'status, start, snapshot, act, etc.' },
      { name: 'profile', type: 'string', required: false },
      { name: 'targetId', type: 'string', required: false },
    ],
  },
  {
    name: 'message',
    description: 'Send, delete, and manage messages via channel plugins.',
    category: 'message',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'send, broadcast, react, delete, edit' },
      { name: 'message', type: 'string', required: false },
      { name: 'target', type: 'string', required: false },
    ],
  },
  {
    name: 'nodes',
    description: 'Discover and control paired nodes (devices).',
    category: 'nodes',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'status, camera_snap, screen_record, etc.' },
      { name: 'node', type: 'string', required: false },
    ],
  },
  {
    name: 'tts',
    description: 'Convert text to speech and return a MEDIA path.',
    category: 'tts',
    enabled: true,
    parameters: [
      { name: 'text', type: 'string', required: true },
      { name: 'channel', type: 'string', required: false },
    ],
  },
  {
    name: 'image',
    description: 'Analyze an image with a vision model.',
    category: 'media',
    enabled: true,
    parameters: [
      { name: 'image', type: 'string', required: true },
      { name: 'prompt', type: 'string', required: false },
    ],
  },
  {
    name: 'canvas',
    description: 'Control node canvases (present/hide/navigate/eval/snapshot).',
    category: 'browser',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true },
      { name: 'url', type: 'string', required: false },
    ],
  },
  {
    name: 'cron',
    description: 'Schedule and manage recurring tasks.',
    category: 'automation',
    enabled: true,
    parameters: [
      { name: 'action', type: 'string', required: true, description: 'list, add, remove, enable, disable' },
    ],
  },
];

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchTools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      setTools(data.tools?.length > 0 ? data.tools : DEFAULT_TOOLS);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
      setTools(DEFAULT_TOOLS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const categories = ['all', ...new Set(tools.map(t => t.category))];
  
  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = tools.filter(t => t.enabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Wrench className="w-5 h-5 text-accent-blue" />
            Tools
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Available tools and their parameters
          </p>
        </div>
        <button
          onClick={fetchTools}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Total Tools</span>
              <Wrench className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{tools.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Enabled</span>
              <Zap className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-accent-green">{enabledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Categories</span>
              <Code className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{categories.length - 1}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-purple text-text-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-accent-purple text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Loading tools...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tools List */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {filteredTools.map(tool => {
              const Icon = CATEGORY_ICONS[tool.category] || CATEGORY_ICONS.default;
              const color = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.default;
              
              return (
                <Card
                  key={tool.name}
                  className={`cursor-pointer transition-all ${
                    selectedTool?.name === tool.name
                      ? 'ring-2 ring-accent-purple bg-accent-purple/10'
                      : 'hover:bg-bg-secondary/60'
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-sm font-medium text-text-primary">
                            {tool.name}
                          </code>
                          {tool.enabled ? (
                            <Badge variant="green" size="sm">On</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Off</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredTools.length === 0 && (
              <div className="text-center py-8 text-text-muted text-sm">
                No tools match your search
              </div>
            )}
          </div>

          {/* Tool Detail */}
          <div className="lg:col-span-2">
            {selectedTool ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: (CATEGORY_COLORS[selectedTool.category] || CATEGORY_COLORS.default) + '20' 
                      }}
                    >
                      {(() => {
                        const Icon = CATEGORY_ICONS[selectedTool.category] || CATEGORY_ICONS.default;
                        const color = CATEGORY_COLORS[selectedTool.category] || CATEGORY_COLORS.default;
                        return <Icon className="w-6 h-6" style={{ color }} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <code className="text-lg font-semibold text-text-primary">
                        {selectedTool.name}
                      </code>
                      <p className="text-sm text-text-secondary mt-1">
                        {selectedTool.description}
                      </p>
                    </div>
                    {selectedTool.enabled ? (
                      <Badge variant="green">Enabled</Badge>
                    ) : (
                      <Badge variant="default">Disabled</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <span className="text-xs text-text-tertiary">Category</span>
                      <p className="text-sm font-medium text-text-primary capitalize mt-1">
                        {selectedTool.category}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <span className="text-xs text-text-tertiary">Parameters</span>
                      <p className="text-sm font-medium text-text-primary mt-1">
                        {selectedTool.parameters?.length || 0}
                      </p>
                    </div>
                  </div>

                  {selectedTool.parameters && selectedTool.parameters.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Parameters</h3>
                      <div className="space-y-2">
                        {selectedTool.parameters.map((param, i) => (
                          <div 
                            key={i}
                            className="bg-bg-secondary rounded-lg p-3 flex items-start justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-medium text-accent-blue">
                                  {param.name}
                                </code>
                                <span className="text-xs text-text-muted">
                                  : {param.type}
                                </span>
                                {param.required && (
                                  <Badge variant="red" size="sm">required</Badge>
                                )}
                              </div>
                              {param.description && (
                                <p className="text-xs text-text-muted mt-1">
                                  {param.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-text-tertiary">
                    <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a tool to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
