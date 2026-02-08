import { create } from 'zustand';
import { Agent, Task, Project, Message, ScheduledTask, Memory, Document } from '@/types';
import { seedAgents, seedTasks, seedProjects, seedMessages, seedScheduledTasks, seedMemories } from '@/data/seed';

interface AppState {
  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // Scheduled Tasks
  scheduledTasks: ScheduledTask[];
  setScheduledTasks: (tasks: ScheduledTask[]) => void;

  // Memories
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;

  // Documents
  documents: Document[];
  setDocuments: (docs: Document[]) => void;

  // UI State
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
}

export const useStore = create<AppState>((set) => ({
  // Agents - initialized with seed data
  agents: seedAgents,
  setAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  // Tasks
  tasks: seedTasks,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  // Projects
  projects: seedProjects,
  setProjects: (projects) => set({ projects }),

  // Messages
  messages: seedMessages,
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  // Scheduled Tasks
  scheduledTasks: seedScheduledTasks,
  setScheduledTasks: (scheduledTasks) => set({ scheduledTasks }),

  // Memories
  memories: seedMemories,
  setMemories: (memories) => set({ memories }),
  addMemory: (memory) => set((state) => ({ memories: [...state.memories, memory] })),

  // Documents
  documents: [],
  setDocuments: (documents) => set({ documents }),

  // UI State
  selectedAgentId: null,
  setSelectedAgentId: (selectedAgentId) => set({ selectedAgentId }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  activeChannel: 'general',
  setActiveChannel: (activeChannel) => set({ activeChannel }),
}));
