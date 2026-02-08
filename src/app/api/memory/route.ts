import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

// OpenClaw workspace path - this is where MEMORY.md and memory/*.md live
const WORKSPACE_PATH = process.env.OPENCLAW_WORKSPACE_PATH || '/home/john_honochick/.openclaw/workspace';

interface MemoryEntry {
  id: string;
  path: string;
  filename: string;
  content: string;
  type: 'core' | 'note' | 'learning' | 'decision' | 'idea' | 'research';
  created_at: string;
  modified_at: string;
  tags: string[];
  agent_id: string;
}

export async function GET() {
  try {
    const memories: MemoryEntry[] = [];

    // Read MEMORY.md if it exists
    const memoryMdPath = path.join(WORKSPACE_PATH, 'MEMORY.md');
    try {
      const stat = await fs.stat(memoryMdPath);
      const content = await fs.readFile(memoryMdPath, 'utf-8');
      memories.push({
        id: 'memory-core',
        path: memoryMdPath,
        filename: 'MEMORY.md',
        content: content.slice(0, 2000), // Truncate for display
        type: 'core',
        created_at: stat.birthtime.toISOString(),
        modified_at: stat.mtime.toISOString(),
        tags: extractTags(content),
        agent_id: 'agent-neva',
      });
    } catch (e) {
      // MEMORY.md doesn't exist yet
    }

    // Read memory/*.md files
    const memoryDir = path.join(WORKSPACE_PATH, 'memory');
    try {
      const files = await fs.readdir(memoryDir);
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        const filePath = path.join(memoryDir, file);
        const stat = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        memories.push({
          id: `memory-${file.replace('.md', '')}`,
          path: filePath,
          filename: file,
          content: content.slice(0, 2000),
          type: inferMemoryType(file, content),
          created_at: stat.birthtime.toISOString(),
          modified_at: stat.mtime.toISOString(),
          tags: extractTags(content),
          agent_id: 'agent-neva',
        });
      }
    } catch (e) {
      // memory directory doesn't exist
    }

    // Read knowledge/ subdirectories
    const knowledgeDir = path.join(WORKSPACE_PATH, 'knowledge');
    try {
      const subdirs = ['learnings', 'ideas', 'research', 'decisions'];
      for (const subdir of subdirs) {
        const subPath = path.join(knowledgeDir, subdir);
        try {
          const files = await fs.readdir(subPath);
          for (const file of files) {
            if (!file.endsWith('.md')) continue;
            const filePath = path.join(subPath, file);
            const stat = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            
            memories.push({
              id: `knowledge-${subdir}-${file.replace('.md', '')}`,
              path: filePath,
              filename: file,
              content: content.slice(0, 2000),
              type: subdir.slice(0, -1) as MemoryEntry['type'], // Remove 's' from plural
              created_at: stat.birthtime.toISOString(),
              modified_at: stat.mtime.toISOString(),
              tags: extractTags(content),
              agent_id: 'agent-neva',
            });
          }
        } catch (e) {
          // Subdir doesn't exist
        }
      }
    } catch (e) {
      // knowledge directory doesn't exist
    }

    // Sort by modified date, newest first
    memories.sort((a, b) => new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime());

    return NextResponse.json({
      memories,
      workspace: WORKSPACE_PATH,
      count: memories.length,
    });
  } catch (error) {
    console.error('Memory fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories', memories: [] },
      { status: 500 }
    );
  }
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  
  // Look for YAML frontmatter tags
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const tagsMatch = yamlMatch[1].match(/tags:\s*\[(.*?)\]/);
    if (tagsMatch) {
      tags.push(...tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')));
    }
  }
  
  // Look for #hashtags in content
  const hashtags = content.match(/#[a-zA-Z][a-zA-Z0-9_-]*/g);
  if (hashtags) {
    tags.push(...hashtags.map(t => t.slice(1)));
  }
  
  return [...new Set(tags)].slice(0, 10);
}

function inferMemoryType(filename: string, content: string): MemoryEntry['type'] {
  const lowerFile = filename.toLowerCase();
  const lowerContent = content.toLowerCase().slice(0, 500);
  
  if (lowerFile.includes('decision') || lowerContent.includes('decision:')) return 'decision';
  if (lowerFile.includes('learning') || lowerContent.includes('lesson learned')) return 'learning';
  if (lowerFile.includes('idea') || lowerContent.includes('idea:')) return 'idea';
  if (lowerFile.includes('research') || lowerContent.includes('research:')) return 'research';
  return 'note';
}
