'use client';

import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { Badge } from '@/components/ui/Badge';
import { UserCircle, Mail, Activity, ListTodo } from 'lucide-react';

export default function PeoplePage() {
  const { agents, tasks } = useStore();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-accent-pink" />
          People
        </h1>
        <p className="text-xs text-text-muted mt-1">Team directory and agent profiles</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const agentTasks = tasks.filter((t) => t.assigned_agent_id === agent.id);
          const activeTasks = agentTasks.filter((t) => t.status === 'in_progress');
          const completedTasks = agentTasks.filter((t) => t.status === 'done');

          return (
            <Card key={agent.id} hover>
              <CardContent className="flex items-start gap-4">
                <AgentAvatar agent={agent} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{agent.name}</h3>
                    <StatusDot status={agent.status} showLabel />
                    <Badge variant={agent.type === 'human' ? 'blue' : agent.type === 'api' ? 'purple' : 'green'}>
                      {agent.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{agent.role}</p>

                  {agent.model && (
                    <p className="text-[10px] text-text-muted mb-2">
                      {agent.model} · {agent.provider}
                      {agent.cost_info && ` · $${agent.cost_info.input}/$${agent.cost_info.output} ${agent.cost_info.unit}`}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.skills.map((skill) => (
                      <Badge key={skill} variant="default">{skill}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3 h-3" />
                      {agentTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {activeTasks.length} active
                    </span>
                    <span className="flex items-center gap-1 text-accent-green">
                      {completedTasks.length} completed
                    </span>
                  </div>

                  {agent.soul_md && (
                    <p className="text-[10px] text-text-muted mt-2 italic">&quot;{agent.soul_md}&quot;</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
