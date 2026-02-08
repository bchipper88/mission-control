import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

interface LiveSession {
  id: string;
  key: string;
  name: string;
  type: 'main' | 'subagent' | 'isolated';
  model: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  tokenUsage: { input: number; output: number; total: number };
  cost: number;
  messageCount: number;
}

export async function GET() {
  try {
    // Use /tools/invoke endpoint to call sessions_list
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'sessions_list',
        args: {
          activeMinutes: 60,
          messageLimit: 5,
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok || !data.result?.details?.sessions) {
      return NextResponse.json({
        sessions: [],
        count: 0,
        stats: { active: 0, idle: 0, subagents: 0, totalCost: 0 },
        error: 'No session data returned',
      });
    }

    const rawSessions = data.result.details.sessions;
    const sessions: LiveSession[] = [];

    for (const session of rawSessions) {
      const keyParts = session.key.split(':');
      let sessionType: LiveSession['type'] = 'main';
      let sessionName = 'NEVA';

      if (keyParts[0] === 'agent' && keyParts[2] === 'main') {
        sessionType = 'main';
        sessionName = 'NEVA';
      } else if (keyParts[0] === 'agent' && keyParts[2] !== 'main') {
        sessionType = 'subagent';
        sessionName = formatSubagentName(keyParts[2]);
      } else if (keyParts[0] === 'isolated') {
        sessionType = 'isolated';
        sessionName = session.displayName || 'Isolated Session';
      }

      const lastUpdate = session.updatedAt || Date.now();
      const minutesAgo = (Date.now() - lastUpdate) / (1000 * 60);
      let status: LiveSession['status'] = 'offline';
      if (minutesAgo < 2) status = 'active';
      else if (minutesAgo < 30) status = 'idle';

      const currentTask = extractCurrentTask(session.messages || []);
      let totalCost = 0;
      for (const msg of session.messages || []) {
        if (msg.usage?.cost?.total) {
          totalCost += msg.usage.cost.total;
        }
      }

      sessions.push({
        id: session.sessionId || session.key,
        key: session.key,
        name: sessionName,
        type: sessionType,
        model: session.model || 'unknown',
        status,
        lastActivity: new Date(lastUpdate).toISOString(),
        currentTask,
        tokenUsage: {
          input: session.inputTokens || 0,
          output: session.outputTokens || 0,
          total: session.totalTokens || 0,
        },
        cost: totalCost,
        messageCount: session.messages?.length || 0,
      });
    }

    sessions.sort((a, b) => {
      const statusOrder = { active: 0, idle: 1, offline: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return NextResponse.json({
      sessions,
      count: sessions.length,
      stats: {
        active: sessions.filter(s => s.status === 'active').length,
        idle: sessions.filter(s => s.status === 'idle').length,
        subagents: sessions.filter(s => s.type === 'subagent').length,
        totalCost: sessions.reduce((sum, s) => sum + s.cost, 0),
      },
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch sessions',
        sessions: [],
        stats: { active: 0, idle: 0, subagents: 0, totalCost: 0 },
      },
      { status: 500 }
    );
  }
}

function formatSubagentName(keyPart: string): string {
  return keyPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractCurrentTask(messages: Array<{ role: string; content?: Array<{ type: string; text?: string; name?: string }> }>): string | null {
  for (const msg of messages.slice().reverse()) {
    if (msg.role === 'assistant' && msg.content) {
      for (const block of msg.content) {
        if (block.type === 'toolCall' && block.name) {
          return `Running: ${block.name}`;
        }
        if (block.type === 'text' && block.text) {
          const taskMatch = block.text.match(/(?:Working on|Starting|Executing|Running):\s*(.+?)(?:\.|$)/i);
          if (taskMatch) {
            return taskMatch[1].slice(0, 50);
          }
        }
      }
    }
  }
  return null;
}
