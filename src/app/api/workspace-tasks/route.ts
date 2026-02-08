import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKSPACE_PATH = process.env.OPENCLAW_WORKSPACE_PATH || '/home/john_honochick/.openclaw/workspace';

interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source_file: string;
  category: string;
  assigned_to: 'neva' | 'john' | null;
  created_at: string;
  modified_at: string;
}

export async function GET() {
  try {
    const tasks: WorkspaceTask[] = [];

    // Read tasks/*.md files
    const tasksDir = path.join(WORKSPACE_PATH, 'tasks');
    try {
      const files = await fs.readdir(tasksDir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(tasksDir, file);
        const stat = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Parse markdown task files
        const parsedTasks = parseTasksFromMarkdown(content, file, stat);
        tasks.push(...parsedTasks);
      }
    } catch (e) {
      // tasks directory doesn't exist
    }

    // Read experiments/*.md for experiment-related tasks
    const experimentsDir = path.join(WORKSPACE_PATH, 'experiments');
    try {
      const files = await fs.readdir(experimentsDir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(experimentsDir, file);
        const stat = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        const parsedTasks = parseExperimentTasks(content, file, stat);
        tasks.push(...parsedTasks);
      }
    } catch (e) {
      // experiments directory doesn't exist
    }

    // Sort: in_progress first, then todo, then done
    const statusOrder = { in_progress: 0, todo: 1, blocked: 2, done: 3 };
    tasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return NextResponse.json({
      tasks,
      count: tasks.length,
      stats: {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      },
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', tasks: [], stats: {} },
      { status: 500 }
    );
  }
}

function parseTasksFromMarkdown(content: string, filename: string, stat: { birthtime: Date; mtime: Date }): WorkspaceTask[] {
  const tasks: WorkspaceTask[] = [];
  const lines = content.split('\n');
  const category = extractCategory(filename, content);
  
  let currentTask: Partial<WorkspaceTask> | null = null;
  
  for (const line of lines) {
    // Match checkbox lines: - [ ] or - [x]
    const checkboxMatch = line.match(/^[-*]\s*\[([ xX])\]\s*\*?\*?([^*]+)\*?\*?\s*(?:—|-)?\s*(.*)?$/);
    if (checkboxMatch) {
      const isDone = checkboxMatch[1].toLowerCase() === 'x';
      const title = checkboxMatch[2].trim();
      const description = checkboxMatch[3]?.trim() || '';
      
      // Parse task ID from title (e.g., "MC-001: Task Name")
      const idMatch = title.match(/^([A-Z]+-\d+):\s*(.+)$/);
      const taskId = idMatch ? idMatch[1] : `task-${filename}-${tasks.length}`;
      const taskTitle = idMatch ? idMatch[2] : title;
      
      // Infer priority from title or markers
      const priority = inferPriority(line, taskTitle);
      
      // Infer assignment
      const assignedTo = title.toLowerCase().includes('john') ? 'john' as const : 'neva' as const;
      
      tasks.push({
        id: taskId,
        title: taskTitle,
        description,
        status: isDone ? 'done' : 'todo',
        priority,
        source_file: filename,
        category,
        assigned_to: assignedTo,
        created_at: stat.birthtime.toISOString(),
        modified_at: stat.mtime.toISOString(),
      });
    }
  }
  
  return tasks;
}

function parseExperimentTasks(content: string, filename: string, stat: { birthtime: Date; mtime: Date }): WorkspaceTask[] {
  const tasks: WorkspaceTask[] = [];
  
  // Extract experiment name
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const experimentName = titleMatch ? titleMatch[1] : filename.replace('.md', '');
  
  // Check experiment status
  const statusMatch = content.match(/Status:\s*(\w+)/i);
  const expStatus = statusMatch ? statusMatch[1].toLowerCase() : 'active';
  
  // Create a task for the experiment itself
  tasks.push({
    id: `exp-${filename.replace('.md', '')}`,
    title: `Experiment: ${experimentName}`,
    description: 'Active experiment tracking',
    status: expStatus === 'complete' ? 'done' : expStatus === 'blocked' ? 'blocked' : 'in_progress',
    priority: 'high',
    source_file: `experiments/${filename}`,
    category: 'experiments',
    assigned_to: 'neva',
    created_at: stat.birthtime.toISOString(),
    modified_at: stat.mtime.toISOString(),
  });
  
  return tasks;
}

function extractCategory(filename: string, content: string): string {
  // Try to get category from filename
  const parts = filename.replace('.md', '').split('-');
  if (parts.length > 1) {
    return parts[0];
  }
  
  // Try to get from content
  const categoryMatch = content.match(/Category:\s*(.+)/i);
  if (categoryMatch) {
    return categoryMatch[1].trim();
  }
  
  return 'general';
}

function inferPriority(line: string, title: string): WorkspaceTask['priority'] {
  const combined = (line + ' ' + title).toLowerCase();
  
  if (combined.includes('critical') || combined.includes('urgent') || combined.includes('priority 1')) {
    return 'critical';
  }
  if (combined.includes('high') || combined.includes('important') || combined.includes('priority 2')) {
    return 'high';
  }
  if (combined.includes('low') || combined.includes('minor') || combined.includes('priority 4')) {
    return 'low';
  }
  return 'medium';
}
