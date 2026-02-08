'use client';

import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { FolderOpen, Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, tasks, agents } = useStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent-indigo" />
            Projects
          </h1>
          <p className="text-xs text-text-muted mt-1">Manage your projects and track progress</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue text-white text-xs font-medium rounded-md hover:bg-accent-blue/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const doneTasks = projectTasks.filter((t) => t.status === 'done');
          const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress');
          const assignedAgentIds = [...new Set(projectTasks.map((t) => t.assigned_agent_id).filter(Boolean))];
          const assignedAgents = agents.filter((a) => assignedAgentIds.includes(a.id));
          const progress = projectTasks.length > 0 ? (doneTasks.length / projectTasks.length) * 100 : 0;

          return (
            <Card key={project.id} hover>
              <CardContent className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="text-sm font-semibold">{project.name}</h3>
                  </div>
                  <Badge variant={project.status === 'active' ? 'green' : 'default'}>
                    {project.status}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-text-secondary">{project.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>{projectTasks.length} tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-accent-green">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{doneTasks.length} done</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-accent-yellow">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{inProgressTasks.length} active</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: project.color,
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Assigned Agents */}
                {assignedAgents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">Team:</span>
                    <div className="flex -space-x-1.5">
                      {assignedAgents.map((agent) => (
                        <AgentAvatar key={agent.id} agent={agent} size="sm" showStatus={false} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Task List */}
                <div className="space-y-1 pt-2 border-t border-border">
                  {projectTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.status === 'done' ? 'bg-accent-green' : task.status === 'in_progress' ? 'bg-accent-yellow' : 'bg-text-muted'
                        }`}
                      />
                      <span className={task.status === 'done' ? 'text-text-muted line-through' : 'text-text-secondary'}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {projectTasks.length > 3 && (
                    <p className="text-[10px] text-text-muted">+{projectTasks.length - 3} more tasks</p>
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
