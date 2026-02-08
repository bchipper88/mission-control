'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Settings,
  Clock, 
  Wrench,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  Code,
  FileText,
  Terminal,
  Globe,
  MessageSquare,
  Folder,
  Smartphone,
  Image,
  Volume2,
  Database
} from 'lucide-react';

// Types
interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  lastStatus: 'success' | 'failed' | 'running' | null;
  description?: string;
}

interface Tool {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

// Constants
const TOOL_ICONS: Record<string, typeof Wrench> = {
  file: Folder, web: Globe, browser: Globe, exec: Terminal,
  message: MessageSquare, nodes: Smartphone, media: Image,
  tts: Volume2, search: Search, automation: Clock, database: Database,
  default: Wrench,
};

const DEFAULT_TOOLS: Tool[] = [
  { name: 'Read', description: 'Read file contents', category: 'file', enabled: true },
  { name: 'Write', description: 'Write to files', category: 'file', enabled: true },
  { name: 'Edit', description: 'Edit files', category: 'file', enabled: true },
  { name: 'exec', description: 'Execute shell commands', category: 'exec', enabled: true },
  { name: 'web_search', description: 'Search the web', category: 'search', enabled: true },
  { name: 'web_fetch', description: 'Fetch URLs', category: 'web', enabled: true },
  { name: 'browser', description: 'Control browser', category: 'browser', enabled: true },
  { name: 'message', description: 'Send messages', category: 'message', enabled: true },
  { name: 'nodes', description: 'Control devices', category: 'nodes', enabled: true },
  { name: 'cron', description: 'Schedule tasks', category: 'automation', enabled: true },
  { name: 'tts', description: 'Text to speech', category: 'tts', enabled: true },
  { name: 'image', description: 'Analyze images', category: 'media', enabled: true },
  { name: 'sessions_spawn', description: 'Spawn subagents', category: 'automation', enabled: true },
  { name: 'memory_search', description: 'Search memory', category: 'database', enabled: true },
];

export default function SystemPage() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('cron');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cronRes, toolsRes, skillsRes] = await Promise.all([
        fetch('/api/cron').catch(() => ({ json: () => ({ jobs: [] }) })),
        fetch('/api/tools').catch(() => ({ json: () => ({ tools: [] }) })),
        fetch('/api/skills').catch(() => ({ json: () => ({ skills: [] }) })),
      ]);

      const [cronData, toolsData, skillsData] = await Promise.all([
        (cronRes as Response).json?.() || { jobs: [] },
        (toolsRes as Response).json?.() || { tools: [] },
        (skillsRes as Response).json?.() || { skills: [] },
      ]);

      setCronJobs(cronData.jobs || []);
      setTools(toolsData.tools?.length > 0 ? toolsData.tools : DEFAULT_TOOLS);
      setSkills(skillsData.skills || []);
    } catch (err) {
      console.error('Failed to fetch system data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeJobs = cronJobs.filter(j => j.enabled).length;
  const enabledTools = tools.filter(t => t.enabled).length;
  const enabledSkills = skills.filter(s => s.enabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Settings className="w-5 h-5 text-accent-purple" />
            System
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Cron jobs, tools, and skills
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-bg-secondary/60" onClick={() => toggleSection('cron')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Cron Jobs</span>
              <Clock className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{activeJobs}<span className="text-sm text-text-muted">/{cronJobs.length}</span></p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-bg-secondary/60" onClick={() => toggleSection('tools')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Tools</span>
              <Wrench className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{enabledTools}<span className="text-sm text-text-muted">/{tools.length}</span></p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-bg-secondary/60" onClick={() => toggleSection('skills')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Skills</span>
              <Sparkles className="w-4 h-4 text-accent-yellow" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{enabledSkills}<span className="text-sm text-text-muted">/{skills.length}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search tools and skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-purple text-text-primary placeholder:text-text-muted"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading system data...</div>
      ) : (
        <div className="space-y-4">
          {/* Cron Jobs Section */}
          <Card>
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover/50 transition-colors"
                onClick={() => toggleSection('cron')}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-blue" />
                  <span className="font-medium text-text-primary">Cron Jobs</span>
                  <Badge variant={activeJobs > 0 ? 'green' : 'default'} size="sm">
                    {activeJobs} active
                  </Badge>
                </div>
                {expandedSection === 'cron' ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
              </button>
              
              {expandedSection === 'cron' && (
                <div className="border-t border-border">
                  {cronJobs.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-sm">No cron jobs configured</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {cronJobs.map((job) => (
                        <div key={job.id} className="p-3 flex items-center justify-between hover:bg-bg-hover/30">
                          <div className="flex items-center gap-3">
                            {job.enabled ? (
                              <Play className="w-4 h-4 text-accent-green" />
                            ) : (
                              <Pause className="w-4 h-4 text-text-muted" />
                            )}
                            <div>
                              <span className="text-sm font-medium text-text-primary">{job.name}</span>
                              <code className="ml-2 text-xs bg-bg-tertiary px-1.5 py-0.5 rounded text-accent-blue">
                                {job.schedule}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-text-muted">
                            <span>Last: {formatTime(job.lastRun)}</span>
                            <span>Next: {formatTime(job.nextRun)}</span>
                            {job.lastStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-accent-green" />}
                            {job.lastStatus === 'failed' && <XCircle className="w-4 h-4 text-accent-red" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tools Section */}
          <Card>
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover/50 transition-colors"
                onClick={() => toggleSection('tools')}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-accent-green" />
                  <span className="font-medium text-text-primary">Tools</span>
                  <Badge variant="green" size="sm">{enabledTools} enabled</Badge>
                </div>
                {expandedSection === 'tools' ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
              </button>
              
              {expandedSection === 'tools' && (
                <div className="border-t border-border p-4">
                  <div className="flex flex-wrap gap-2">
                    {filteredTools.map((tool) => {
                      const Icon = TOOL_ICONS[tool.category] || TOOL_ICONS.default;
                      return (
                        <div
                          key={tool.name}
                          className="flex items-center gap-2 bg-bg-secondary rounded-lg px-3 py-2 hover:bg-bg-hover transition-colors"
                          title={tool.description}
                        >
                          <Icon className="w-3.5 h-3.5 text-text-muted" />
                          <code className="text-xs font-medium text-text-primary">{tool.name}</code>
                          {tool.enabled ? (
                            <Zap className="w-3 h-3 text-accent-green" />
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-text-muted/30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardContent className="p-0">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-bg-hover/50 transition-colors"
                onClick={() => toggleSection('skills')}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-accent-yellow" />
                  <span className="font-medium text-text-primary">Skills</span>
                  <Badge variant="yellow" size="sm">{skills.length} loaded</Badge>
                </div>
                {expandedSection === 'skills' ? (
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                )}
              </button>
              
              {expandedSection === 'skills' && (
                <div className="border-t border-border p-4">
                  {filteredSkills.length === 0 ? (
                    <div className="text-center text-text-muted text-sm py-4">
                      {skills.length === 0 ? 'No skills loaded' : 'No skills match search'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredSkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="bg-bg-secondary rounded-lg p-3 hover:bg-bg-hover transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                            {skill.enabled ? (
                              <Badge variant="green" size="sm">On</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Off</Badge>
                            )}
                          </div>
                          <p className="text-xs text-text-muted line-clamp-2">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
