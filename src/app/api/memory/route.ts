import { NextResponse } from 'next/server';

// OpenClaw Gateway connection
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const WORKSPACE_PATH = '/home/john_honochick/.openclaw/workspace';

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

async function invokeGatewayTool(tool: string, args: Record<string, unknown>) {
  const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({ tool, args }),
  });
  
  if (!response.ok) {
    throw new Error(`Gateway error: ${response.status}`);
  }
  
  return response.json();
}

async function listDirectory(dirPath: string): Promise<string[]> {
  try {
    const result = await invokeGatewayTool('exec', {
      command: `ls -1 "${dirPath}" 2>/dev/null || echo ""`,
    });
    const output = result.stdout || result.output || '';
    return output.split('\n').filter((f: string) => f.endsWith('.md'));
  } catch {
    return [];
  }
}

async function readFile(filePath: string): Promise<{ content: string; mtime: string } | null> {
  try {
    const result = await invokeGatewayTool('Read', {
      path: filePath,
    });
    // Read tool returns content directly or in a content field
    const content = typeof result === 'string' ? result : (result.content || result.text || '');
    
    // Get file stat for modified time
    const statResult = await invokeGatewayTool('exec', {
      command: `stat -c '%Y' "${filePath}" 2>/dev/null || echo ""`,
    });
    const timestamp = statResult.stdout || statResult.output || '';
    const mtime = timestamp.trim() ? new Date(parseInt(timestamp.trim()) * 1000).toISOString() : new Date().toISOString();
    
    return { content: content.slice(0, 2000), mtime };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const memories: MemoryEntry[] = [];

    // Read MEMORY.md if it exists
    const memoryMdPath = `${WORKSPACE_PATH}/MEMORY.md`;
    const memoryMd = await readFile(memoryMdPath);
    if (memoryMd) {
      memories.push({
        id: 'memory-core',
        path: memoryMdPath,
        filename: 'MEMORY.md',
        content: memoryMd.content,
        type: 'core',
        created_at: memoryMd.mtime,
        modified_at: memoryMd.mtime,
        tags: extractTags(memoryMd.content),
        agent_id: 'agent-neva',
      });
    }

    // Read memory/*.md files
    const memoryDir = `${WORKSPACE_PATH}/memory`;
    const memoryFiles = await listDirectory(memoryDir);
    for (const file of memoryFiles) {
      const filePath = `${memoryDir}/${file}`;
      const fileData = await readFile(filePath);
      if (fileData) {
        memories.push({
          id: `memory-${file.replace('.md', '')}`,
          path: filePath,
          filename: file,
          content: fileData.content,
          type: inferMemoryType(file, fileData.content),
          created_at: fileData.mtime,
          modified_at: fileData.mtime,
          tags: extractTags(fileData.content),
          agent_id: 'agent-neva',
        });
      }
    }

    // Read knowledge/ subdirectories
    const subdirs = ['learnings', 'ideas', 'research', 'decisions'];
    for (const subdir of subdirs) {
      const subPath = `${WORKSPACE_PATH}/knowledge/${subdir}`;
      const files = await listDirectory(subPath);
      for (const file of files) {
        const filePath = `${subPath}/${file}`;
        const fileData = await readFile(filePath);
        if (fileData) {
          memories.push({
            id: `knowledge-${subdir}-${file.replace('.md', '')}`,
            path: filePath,
            filename: file,
            content: fileData.content,
            type: subdir.slice(0, -1) as MemoryEntry['type'],
            created_at: fileData.mtime,
            modified_at: fileData.mtime,
            tags: extractTags(fileData.content),
            agent_id: 'agent-neva',
          });
        }
      }
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
