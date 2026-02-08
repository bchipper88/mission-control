'use client';

import { useState, DragEvent } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { Plus, GripVertical, Filter } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'planning', label: 'Planning', color: 'bg-accent-purple' },
  { status: 'inbox', label: 'Inbox', color: 'bg-accent-blue' },
  { status: 'assigned', label: 'Assigned', color: 'bg-accent-cyan' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-accent-green' },
  { status: 'testing', label: 'Testing', color: 'bg-accent-yellow' },
  { status: 'review', label: 'Review', color: 'bg-accent-pink' },
  { status: 'done', label: 'Done', color: 'bg-accent-green' },
];

const PRIORITY_VARIANT: Record<TaskPriority, 'red' | 'yellow' | 'blue' | 'default'> = {
  critical: 'red',
  high: 'yellow',
  medium: 'blue',
  low: 'default',
};

export default function TasksPage() {
  const { tasks, agents, projects, addTask, updateTask } = useStore();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');

  // Add-task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAgentId, setNewAgentId] = useState('');

  // ---------- Drag & Drop ----------
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, { status: targetStatus, updated_at: new Date().toISOString() });
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // ---------- Add Task ----------
  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      status: 'inbox' as TaskStatus,
      priority: newPriority,
      assigned_agent_id: newAgentId || null,
      project_id: newProjectId || null,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addTask(task);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('medium');
    setNewProjectId('');
    setNewAgentId('');
    setShowAddModal(false);
  };

  // ---------- Helpers ----------
  const filteredTasks = filterPriority === 'all'
    ? tasks
    : tasks.filter((t) => t.priority === filterPriority);

  const tasksForColumn = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const getProject = (projectId?: string | null) =>
    projectId ? projects.find((p) => p.id === projectId) : undefined;

  const getAgent = (agentId?: string | null) =>
    agentId ? agents.find((a) => a.id === agentId) : undefined;

  // ---------- Render ----------
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* -------- Header -------- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-xl font-semibold text-text-primary">Tasks</h1>

        <div className="flex items-center gap-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary bg-bg-secondary rounded-lg border border-border hover:border-border-light transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter{filterPriority !== 'all' ? `: ${filterPriority}` : ''}</span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-border bg-bg-card shadow-xl py-1">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setFilterPriority(p);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-bg-hover transition-colors ${
                      filterPriority === p ? 'text-accent-blue' : 'text-text-secondary'
                    }`}
                  >
                    {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Task button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-accent-blue rounded-lg hover:bg-accent-blue/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* -------- Kanban Board -------- */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {COLUMNS.map((col) => {
            const columnTasks = tasksForColumn(col.status);
            const isOver = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                className={`flex flex-col w-72 shrink-0 rounded-xl bg-bg-primary border transition-colors ${
                  isOver ? 'border-accent-blue' : 'border-border'
                }`}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="text-sm font-medium text-text-primary">{col.label}</span>
                  <Badge variant="default" size="sm">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                  {columnTasks.map((task) => {
                    const project = getProject(task.project_id);
                    const agent = getAgent(task.assigned_agent_id);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`transition-opacity ${
                          draggedTaskId === task.id ? 'opacity-40' : 'opacity-100'
                        }`}
                      >
                        <Card hover className="p-3 cursor-grab active:cursor-grabbing">
                          {/* Grip + Title */}
                          <div className="flex items-start gap-1.5">
                            <GripVertical className="w-4 h-4 mt-0.5 shrink-0 text-text-tertiary" />
                            <span className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
                              {task.title}
                            </span>
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 ml-5">
                            {/* Priority badge */}
                            <Badge variant={PRIORITY_VARIANT[task.priority]} size="sm">
                              {task.priority}
                            </Badge>

                            {/* Project tag */}
                            {project && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: project.color }}
                                />
                                {project.name}
                              </span>
                            )}

                            {/* Tags */}
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="default" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Agent avatar */}
                          {agent && (
                            <div className="mt-2 ml-5">
                              <AgentAvatar agent={agent} size="sm" showStatus={false} />
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-text-tertiary">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------- Add Task Modal -------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-bg-card shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">Add Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-blue resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Project */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assign Agent */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Assign Agent</label>
                <select
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary focus:outline-none focus:border-accent-blue"
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg border border-border hover:border-border-light transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 text-sm font-medium text-white bg-accent-blue rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
