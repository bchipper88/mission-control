'use client';

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
} from 'lucide-react';

export default function MissionControlPage() {
  const { agents, tasks, projects, messages } = useStore();

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

  const recentMessages = [...messages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  const priorityTasks = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Mission Control</h1>
        <p className="text-xs text-text-muted mt-1">AI Agent Orchestration Dashboard</p>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
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

        {/* Priority Tasks */}
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Priority Tasks</h2>
            <div className="flex items-center gap-2">
              <Badge variant="yellow">{activeTasks.length} active</Badge>
              <Badge variant="green">{doneTasks.length} done</Badge>
            </div>
          </div>
          <CardContent className="space-y-2">
            {priorityTasks.map((task) => {
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
                  <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                  {agent && <AgentAvatar agent={agent} size="sm" showStatus={false} />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
        </div>
        <CardContent className="space-y-3">
          {recentMessages.map((msg) => {
            const agent = agents.find((a) => a.id === msg.sender_agent_id);
            return (
              <div key={msg.id} className="flex gap-3 animate-slide-in">
                {agent ? (
                  <AgentAvatar agent={agent} size="sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{msg.sender_name || 'System'}</span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{msg.content}</p>
                </div>
              </div>
            );
          })}
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
