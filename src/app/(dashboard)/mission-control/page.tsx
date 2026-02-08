'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Cloud,
  HardDrive,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
  Wrench,
  MessageSquare,
  RefreshCw,
  Rocket,
} from 'lucide-react';

interface ActivityEntry {
  id: string;
  type: 'agent_action' | 'tool_call' | 'user_message' | 'subagent_spawn';
  agent: string;
  action: string;
  timestamp?: number;
  sessionKey?: string;
  model?: string;
  cost?: number;
}

export default function MissionControlPage() {
  const { agents, tasks, projects } = useStore();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch real activity from OpenClaw Gateway
  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivities(data.activities || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const humans = agents.filter((a) => a.type === 'human');
  const apiAgents = agents.filter((a) => a.type === 'api');
  const localAgents = agents.filter((a) => a.type === 'local');

  const totalCost = agents.reduce((sum, a) => {
    if (a.cost_info) return sum + (a.cost_info.input + a.cost_info.output) * 1000;
    return sum;
  }, 0);

  const activeTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const activeAgents = agents.filter((a) => a.status === 'active');

  // John's tasks - filter by human agent
  const johnAgent = agents.find((a) => a.type === 'human');
  const johnTasks = johnAgent 
    ? tasks.filter((t) => t.assigned_agent_id === johnAgent.id)
    : [];

  // NEVA's priority tasks
  const nevaAgent = agents.find((a) => a.type === 'api' && a.name.toLowerCase().includes('neva'));
  const nevaTasks = tasks
    .filter((t) => t.status !== 'done' && (!nevaAgent || t.assigned_agent_id === nevaAgent.id || !t.assigned_agent_id))
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tool_call':
        return <Wrench className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />;
      case 'user_message':
        return <MessageSquare className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />;
      case 'subagent_spawn':
        return <Rocket className="w-3.5 h-3.5 text-accent-yellow flex-shrink-0" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />;
    }
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Mission Control</h1>
          <p className="text-xs text-text-muted mt-1">AI Agent Orchestration Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {lastRefresh && (
            <span>Updated {formatTimestamp(lastRefresh.getTime())}</span>
          )}
          <button 
            onClick={fetchActivity}
            className="p-1.5 rounded-lg hover:bg-bg-hover transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-blue/15 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <p className="text-2xl font-bold">{humans.length}</p>
              <p className="text-[10px] text-text-muted">Human</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/15 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold">{apiAgents.length}</p>
              <p className="text-[10px] text-text-muted">API Agents</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-green/15 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{localAgents.length}</p>
              <p className="text-[10px] text-text-muted">Local Models</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-yellow/15 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-yellow" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(totalCost / 1000).toFixed(0)}K</p>
              <p className="text-[10px] text-text-muted">Est. Infrastructure</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* John's Tasks */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-blue" />
              <h2 className="text-sm font-semibold">John's Tasks</h2>
            </div>
            <Badge variant="blue">{johnTasks.length} total</Badge>
          </div>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {johnTasks.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No tasks assigned</p>
            ) : (
              johnTasks.map((task) => {
                const priorityColors = {
                  critical: 'red',
                  high: 'yellow',
                  medium: 'blue',
                  low: 'default',
                } as const;
                const statusColors: Record<string, 'default' | 'blue' | 'green' | 'purple' | 'red' | 'cyan' | 'yellow'> = {
                  planning: 'default',
                  inbox: 'default',
                  todo: 'default',
                  assigned: 'blue',
                  in_progress: 'green',
                  testing: 'yellow',
                  review: 'purple',
                  blocked: 'red',
                  done: 'cyan',
                };

                return (
                  <div key={task.id} className="flex items-center gap-3 py-1">
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                    ) : task.status === 'in_progress' ? (
                      <Activity className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{task.title}</div>
                    </div>
                    <Badge variant={statusColors[task.status]} size="sm">{task.status.replace('_', ' ')}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Agent Status</h2>
            <Badge variant="green">{activeAgents.length} active</Badge>
          </div>
          <CardContent className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <AgentAvatar agent={agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{agent.name}</div>
                  <div className="text-[10px] text-text-muted">{agent.role}</div>
                </div>
                <StatusDot status={agent.status} showLabel />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* NEVA's Priority Tasks */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-accent-purple" />
              <h2 className="text-sm font-semibold">NEVA's Tasks</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="yellow">{activeTasks.length} active</Badge>
              <Badge variant="green">{doneTasks.length} done</Badge>
            </div>
          </div>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {nevaTasks.map((task) => {
              const agent = agents.find((a) => a.id === task.assigned_agent_id);
              const priorityColors = {
                critical: 'red',
                high: 'yellow',
                medium: 'blue',
                low: 'default',
              } as const;

              return (
                <div key={task.id} className="flex items-center gap-3 py-1">
                  {task.status === 'in_progress' ? (
                    <Activity className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                  ) : task.status === 'review' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-accent-yellow flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{task.title}</div>
                  </div>
                  <Badge variant={priorityColors[task.priority]} size="sm">{task.priority}</Badge>
                  {agent && <AgentAvatar agent={agent} size="sm" showStatus={false} />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-green" />
            <h2 className="text-sm font-semibold">Live Activity Feed</h2>
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
            </span>
          </div>
          <Badge variant="purple">{activities.length} events</Badge>
        </div>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-text-muted" />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No recent activity</p>
          ) : (
            activities.slice(0, 20).map((activity) => (
              <div key={activity.id} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-accent-cyan">{activity.agent}</span>
                    {activity.model && (
                      <Badge variant="default" size="sm">{activity.model}</Badge>
                    )}
                    <span className="text-[10px] text-text-muted ml-auto">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 font-mono">
                    {activity.action}
                  </p>
                  {activity.cost && (
                    <span className="text-[10px] text-accent-yellow">
                      ${activity.cost.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Projects Overview */}
      <div className="grid grid-cols-4 gap-4">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const doneCount = projectTasks.filter((t) => t.status === 'done').length;

          return (
            <Card key={project.id} hover>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="text-xs font-semibold">{project.name}</span>
                </div>
                <p className="text-[10px] text-text-muted line-clamp-2 mb-2">{project.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: project.color,
                        width: projectTasks.length > 0 ? `${(doneCount / projectTasks.length) * 100}%` : '0%',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">
                    {doneCount}/{projectTasks.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
