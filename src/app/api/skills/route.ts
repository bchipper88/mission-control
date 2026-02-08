import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Default skills list (fallback if directory read fails)
const DEFAULT_SKILLS = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web using Brave Search API',
    category: 'research',
    enabled: true,
    triggers: ['search', 'look up', 'find'],
  },
  {
    id: 'web-fetch',
    name: 'Web Fetch',
    description: 'Fetch and extract content from URLs',
    category: 'research',
    enabled: true,
    triggers: ['fetch', 'get page', 'read url'],
  },
  {
    id: 'browser-control',
    name: 'Browser Control',
    description: 'Automate web browser interactions',
    category: 'automation',
    enabled: true,
    triggers: ['browse', 'click', 'navigate'],
  },
  {
    id: 'file-operations',
    name: 'File Operations',
    description: 'Read, write, and edit files',
    category: 'code',
    enabled: true,
    triggers: ['read file', 'write file', 'edit'],
  },
  {
    id: 'exec',
    name: 'Shell Execution',
    description: 'Execute shell commands',
    category: 'code',
    enabled: true,
    triggers: ['run', 'execute', 'shell'],
  },
  {
    id: 'message',
    name: 'Messaging',
    description: 'Send messages via Telegram and other channels',
    category: 'integration',
    enabled: true,
    triggers: ['send', 'message', 'notify'],
  },
  {
    id: 'tts',
    name: 'Text to Speech',
    description: 'Convert text to audio',
    category: 'automation',
    enabled: true,
    triggers: ['speak', 'say', 'voice'],
  },
  {
    id: 'nodes',
    name: 'Node Control',
    description: 'Control paired devices and nodes',
    category: 'integration',
    enabled: true,
    triggers: ['device', 'phone', 'node'],
  },
  {
    id: 'cron',
    name: 'Cron Scheduling',
    description: 'Schedule and manage recurring tasks',
    category: 'automation',
    enabled: true,
    triggers: ['schedule', 'cron', 'timer'],
  },
  {
    id: 'council',
    name: 'Council System',
    description: '5-agent deliberation for idea validation',
    category: 'automation',
    enabled: true,
    triggers: ['council', 'evaluate', 'validate'],
  },
];

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  triggers?: string[];
  version?: string;
}

async function loadSkillsFromDirectory(): Promise<Skill[]> {
  try {
    // Try to read from the skills directory
    const skillsDir = join(process.cwd(), '..', 'skills');
    const files = await readdir(skillsDir);
    const skills: Skill[] = [];

    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const content = await readFile(join(skillsDir, file), 'utf-8');
          // Extract skill info from frontmatter or content
          const nameMatch = content.match(/^#\s+(.+)$/m) || content.match(/name:\s*(.+)$/m);
          const descMatch = content.match(/description:\s*(.+)$/m) || content.match(/^>\s*(.+)$/m);
          const categoryMatch = content.match(/category:\s*(.+)$/m);
          
          skills.push({
            id: file.replace(/\.(md|yaml|yml)$/, ''),
            name: nameMatch?.[1]?.trim() || file.replace(/\.(md|yaml|yml)$/, ''),
            description: descMatch?.[1]?.trim() || 'Custom skill',
            category: categoryMatch?.[1]?.trim() || 'custom',
            enabled: true,
            version: '1.0.0',
          });
        } catch {
          // Skip files that can't be read
        }
      }
    }

    return skills.length > 0 ? skills : DEFAULT_SKILLS;
  } catch {
    return DEFAULT_SKILLS;
  }
}

export async function GET() {
  try {
    const skills = await loadSkillsFromDirectory();
    
    return NextResponse.json({
      skills,
      count: skills.length,
      categories: [...new Set(skills.map(s => s.category))],
    });
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json({
      skills: DEFAULT_SKILLS,
      count: DEFAULT_SKILLS.length,
      categories: [...new Set(DEFAULT_SKILLS.map(s => s.category))],
    });
  }
}
