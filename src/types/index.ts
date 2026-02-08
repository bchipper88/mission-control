export type AgentStatus = 'active' | 'idle' | 'offline';
export type AgentType = 'human' | 'api' | 'local';
export type TaskStatus = 'planning' | 'inbox' | 'assigned' | 'in_progress' | 'testing' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type MessageType = 'text' | 'system' | 'tool_result';
export type MemoryType = 'note' | 'capture' | 'decision' | 'learning';

export interface Agent {
  id: string;
  name: string;
  role: string;
  type: AgentType;
  model?: string;
  provider?: string;
  avatar_url?: string;
  status: AgentStatus;
  cost_info?: {
    input: number;
    output: number;
    unit: string;
  };
  skills: string[];
  soul_md?: string;
  parent_agent_id?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_agent_id?: string | null;
  assigned_agent?: Agent;
  project_id?: string | null;
  project?: Project;
  tags: string[];
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel: string;
  sender_agent_id?: string | null;
  sender_name?: string;
  sender_agent?: Agent;
  content: string;
  message_type: MessageType;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cron_expression: string;
  agent_id?: string | null;
  agent?: Agent;
  task_template?: Record<string, unknown>;
  is_active: boolean;
  last_run?: string | null;
  next_run?: string | null;
  color?: string;
  created_at: string;
}

export interface Memory {
  id: string;
  agent_id?: string | null;
  agent?: Agent;
  content: string;
  memory_type: MemoryType;
  tags: string[];
  source?: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  doc_type: string;
  project_id?: string | null;
  project?: Project;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}
