import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Default tools list when API is unavailable
const DEFAULT_TOOLS = [
  {
    name: 'Read',
    description: 'Read file contents. Supports text files and images.',
    category: 'file',
    enabled: true,
  },
  {
    name: 'Write',
    description: 'Write content to a file. Creates parent directories automatically.',
    category: 'file',
    enabled: true,
  },
  {
    name: 'Edit',
    description: 'Edit a file by replacing exact text.',
    category: 'file',
    enabled: true,
  },
  {
    name: 'exec',
    description: 'Execute shell commands with background continuation.',
    category: 'exec',
    enabled: true,
  },
  {
    name: 'process',
    description: 'Manage running exec sessions.',
    category: 'exec',
    enabled: true,
  },
  {
    name: 'web_search',
    description: 'Search the web using Brave Search API.',
    category: 'search',
    enabled: true,
  },
  {
    name: 'web_fetch',
    description: 'Fetch and extract readable content from a URL.',
    category: 'web',
    enabled: true,
  },
  {
    name: 'browser',
    description: 'Control web browser via OpenClaw browser control server.',
    category: 'browser',
    enabled: true,
  },
  {
    name: 'message',
    description: 'Send, delete, and manage messages via channel plugins.',
    category: 'message',
    enabled: true,
  },
  {
    name: 'nodes',
    description: 'Discover and control paired nodes (devices).',
    category: 'nodes',
    enabled: true,
  },
  {
    name: 'tts',
    description: 'Convert text to speech.',
    category: 'tts',
    enabled: true,
  },
  {
    name: 'image',
    description: 'Analyze an image with a vision model.',
    category: 'media',
    enabled: true,
  },
  {
    name: 'canvas',
    description: 'Control node canvases.',
    category: 'browser',
    enabled: true,
  },
  {
    name: 'cron',
    description: 'Schedule and manage recurring tasks.',
    category: 'automation',
    enabled: true,
  },
];

export async function GET() {
  try {
    // Try to get tools list from gateway
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'session_status',
        args: {},
      }),
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      // Extract tools info if available in session status
      if (data.ok && data.result?.details?.tools) {
        const tools = data.result.details.tools.map((t: Record<string, unknown>) => ({
          name: t.name,
          description: t.description || 'No description',
          category: categorizeToolName(t.name as string),
          enabled: t.enabled !== false,
          parameters: t.parameters,
        }));
        return NextResponse.json({ tools, count: tools.length });
      }
    }

    // Return default tools
    return NextResponse.json({
      tools: DEFAULT_TOOLS,
      count: DEFAULT_TOOLS.length,
    });
  } catch (error) {
    console.error('Tools fetch error:', error);
    return NextResponse.json({
      tools: DEFAULT_TOOLS,
      count: DEFAULT_TOOLS.length,
    });
  }
}

function categorizeToolName(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('read') || nameLower.includes('write') || nameLower.includes('edit') || nameLower.includes('file')) {
    return 'file';
  }
  if (nameLower.includes('exec') || nameLower.includes('process') || nameLower.includes('shell')) {
    return 'exec';
  }
  if (nameLower.includes('search')) {
    return 'search';
  }
  if (nameLower.includes('web') || nameLower.includes('fetch')) {
    return 'web';
  }
  if (nameLower.includes('browser') || nameLower.includes('canvas')) {
    return 'browser';
  }
  if (nameLower.includes('message') || nameLower.includes('chat')) {
    return 'message';
  }
  if (nameLower.includes('node') || nameLower.includes('device')) {
    return 'nodes';
  }
  if (nameLower.includes('tts') || nameLower.includes('speech')) {
    return 'tts';
  }
  if (nameLower.includes('image') || nameLower.includes('media')) {
    return 'media';
  }
  if (nameLower.includes('cron') || nameLower.includes('schedule')) {
    return 'automation';
  }
  return 'default';
}
