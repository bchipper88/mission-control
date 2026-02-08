'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Terminal,
  Wrench,
  MessageSquare,
  RefreshCw,
  Rocket,
  Cpu,
  Zap,
  FileText,
  FlaskConical,
  Users,
  User,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface LiveSession {
  id: string;
  key: string;
  name: string;
  type: 'main' | 'subagent' | 'isolated';
  model: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  tokenUsage: { input: number; output: number; total: number };
  cost: number;
  messageCount: number;
}

interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source_file: string;
  category: string;
  assigned_to: 'neva' | 'john' | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MissionControlPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    activeSessions: 0,
    subagents: 0,
    totalCost: 0,
    tasksInProgress: 0,
    tasksDone: 0,
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [activityRes, sessionsRes, tasksRes] = await Promise.all([
        fetch('/api/activity?limit=100'),
        fetch('/api/sessions'),
        fetch('/api/workspace-tasks'),
      ]);

      const [activityData, sessionsData, tasksData] = await Promise.all([
        activityRes.json(),
        sessionsRes.json(),
        tasksRes.json(),
      ]);

      setActivities(activityData.activities || []);
      setSessions(sessionsData.sessions || []);
      setTasks(tasksData.tasks || []);

      // Calculate stats
      const activeSessions = (sessionsData.sessions || []).filter(
        (s: LiveSession) => s.status === 'active'
      ).length;
      const subagents = (sessionsData.sessions || []).filter(
        (s: LiveSession) => s.type === 'subagent'
      ).length;
      const totalCost = (sessionsData.sessions || []).reduce(
        (sum: number, s: LiveSession) => sum + (s.cost || 0),
        0
      );
      const tasksInProgress = (tasksData.tasks || []).filter(
        (t: WorkspaceTask) => t.status === 'in_progress'
      ).length;
      const tasksDone = (tasksData.tasks || []).filter(
        (t: WorkspaceTask) => t.status === 'done'
      ).length;

      setStats({ activeSessions, subagents, totalCost, tasksInProgress, tasksDone });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTime = (ts?: number | string) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

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

  const mainSession = sessions.find((s) => s.type === 'main');
  const subagentSessions = sessions.filter((s) => s.type === 'subagent');
  const johnTasks = tasks.filter((t) => t.assigned_to === 'john');
  const nevaTasks = tasks.filter((t) => t.assigned_to === 'neva' || !t.assigned_to);

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-green" />
              Mission Control
              {stats.activeSessions > 0 && (
                <span className="relative flex h-2.5 w-2.5 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
                </span>
              )}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Live dashboard • Updates every 10s
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-text-muted">
                {formatTime(lastRefresh.getTime())}
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-accent-green/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
                <p className="text-[10px] text-text-muted">Active Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-accent-purple/15 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.subagents}</p>
                <p className="text-[10px] text-text-muted">Subagents</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tasksInProgress}</p>
                <p className="text-[10px] text-text-muted">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-accent-cyan/15 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tasksDone}</p>
                <p className="text-[10px] text-text-muted">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-10 h-10 rounded-lg bg-accent-yellow/15 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                <p className="text-[10px] text-text-muted">Session Cost</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* NEVA Status */}
          <Card className="col-span-1">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-accent-purple" />
                <h2 className="text-sm font-semibold">NEVA Status</h2>
              </div>
              {mainSession && (
                <Badge variant={mainSession.status === 'active' ? 'green' : 'yellow'}>
                  {mainSession.status}
                </Badge>
              )}
            </div>
            <CardContent className="space-y-3">
              {mainSession ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent-purple flex items-center justify-center text-white font-bold text-lg">
                      NV
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Main Session</div>
                      <div className="text-xs text-text-muted">{mainSession.model}</div>
                    </div>
                  </div>
                  {mainSession.currentTask && (
                    <div className="bg-bg-secondary rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
                        Current Task
                      </div>
                      <div className="text-xs font-mono text-accent-green">
                        {mainSession.currentTask}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-bg-secondary rounded p-2">
                      <div className="text-text-muted">Tokens</div>
                      <div className="font-medium">{mainSession.tokenUsage.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-bg-secondary rounded p-2">
                      <div className="text-text-muted">Cost</div>
                      <div className="font-medium text-accent-yellow">${mainSession.cost.toFixed(4)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-text-muted text-sm">
                  No active session
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Subagents */}
          <Card className="col-span-1">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-sm font-semibold">Subagents</h2>
              </div>
              <Badge variant="cyan">{subagentSessions.length} running</Badge>
            </div>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {subagentSessions.length === 0 ? (
                <div className="text-center py-4 text-text-muted text-sm">
                  No subagents running
                </div>
              ) : (
                subagentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-bg-secondary border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-accent-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{session.name}</div>
                      <div className="text-[10px] text-text-muted">
                        {session.currentTask || 'Idle'}
                      </div>
                    </div>
                    <Badge
                      variant={session.status === 'active' ? 'green' : 'default'}
                      size="sm"
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* NEVA Tasks */}
          <Card className="col-span-1">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-accent-purple" />
                <h2 className="text-sm font-semibold">NEVA Tasks</h2>
              </div>
              <Badge variant="purple">{nevaTasks.length}</Badge>
            </div>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {nevaTasks.length === 0 ? (
                <div className="text-center py-4 text-text-muted text-sm">
                  No tasks assigned
                </div>
              ) : (
                nevaTasks.slice(0, 8).map((task) => {
                  const priorityColors: Record<string, 'red' | 'yellow' | 'blue' | 'default'> = {
                    critical: 'red',
                    high: 'yellow',
                    medium: 'blue',
                    low: 'default',
                  };
                  const statusIcons: Record<string, React.ReactNode> = {
                    done: <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />,
                    in_progress: <Activity className="w-3.5 h-3.5 text-accent-blue" />,
                    blocked: <AlertCircle className="w-3.5 h-3.5 text-accent-red" />,
                    todo: <Clock className="w-3.5 h-3.5 text-text-muted" />,
                  };

                  return (
                    <div key={task.id} className="flex items-center gap-2 py-1">
                      {statusIcons[task.status] || statusIcons.todo}
                      <span className="text-xs flex-1 truncate">{task.title}</span>
                      <Badge variant={priorityColors[task.priority] || 'default'} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* John Tasks - Full Width */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-accent-blue" />
              <h2 className="text-sm font-semibold">John's Tasks</h2>
            </div>
            <Badge variant="blue">{johnTasks.length}</Badge>
          </div>
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {johnTasks.length === 0 ? (
              <div className="text-center py-4 text-text-muted text-sm">
                No tasks for John — assign tasks by adding "John" to the task title or assigned_to field
              </div>
            ) : (
              johnTasks.map((task) => {
                const priorityColors: Record<string, 'red' | 'yellow' | 'blue' | 'default'> = {
                  critical: 'red',
                  high: 'yellow',
                  medium: 'blue',
                  low: 'default',
                };
                const statusIcons: Record<string, React.ReactNode> = {
                  done: <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />,
                  in_progress: <Activity className="w-3.5 h-3.5 text-accent-blue" />,
                  blocked: <AlertCircle className="w-3.5 h-3.5 text-accent-red" />,
                  todo: <Clock className="w-3.5 h-3.5 text-text-muted" />,
                };

                return (
                  <div key={task.id} className="flex items-center gap-2 py-1.5 px-2 rounded bg-bg-secondary">
                    {statusIcons[task.status] || statusIcons.todo}
                    <span className="text-xs flex-1 truncate">{task.title}</span>
                    <Badge variant={priorityColors[task.priority] || 'default'} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : 'default'} size="sm">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Activity Log - Full Width */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent-green" />
              <h2 className="text-sm font-semibold">Activity Log</h2>
              {activities.length > 0 && activities[0].timestamp && 
               Date.now() - activities[0].timestamp < 60000 && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                </span>
              )}
            </div>
            <Badge variant="purple">{activities.length} events</Badge>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading && activities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-text-muted" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No activity recorded yet
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-bg-secondary sticky top-0">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-4 font-medium text-text-muted w-24">Time</th>
                      <th className="text-left py-2 px-4 font-medium text-text-muted w-20">Type</th>
                      <th className="text-left py-2 px-4 font-medium text-text-muted w-24">Agent</th>
                      <th className="text-left py-2 px-4 font-medium text-text-muted">Action</th>
                      <th className="text-right py-2 px-4 font-medium text-text-muted w-20">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, i) => (
                      <tr
                        key={activity.id}
                        className={`border-b border-border/50 hover:bg-bg-hover/50 ${
                          i === 0 && activity.timestamp && Date.now() - activity.timestamp < 30000
                            ? 'bg-accent-green/5'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-4 text-text-muted font-mono">
                          {formatTime(activity.timestamp)}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-1.5">
                            {getActivityIcon(activity.type)}
                            <span className="text-text-secondary">
                              {activity.type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-accent-cyan font-medium">{activity.agent}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="font-mono text-text-secondary line-clamp-1">
                            {activity.action}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          {activity.cost && activity.cost > 0 ? (
                            <span className="text-accent-yellow">${activity.cost.toFixed(4)}</span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
