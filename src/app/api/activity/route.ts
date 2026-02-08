import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

export async function GET() {
  try {
    // Fetch sessions from OpenClaw Gateway
    const response = await fetch(`${GATEWAY_URL}/api/sessions?activeMinutes=1440&messageLimit=10`, {
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform sessions into activity log entries
    const activities: ActivityEntry[] = [];
    
    for (const session of data.sessions || []) {
      // Extract activity from messages
      for (const msg of session.messages || []) {
        if (msg.role === 'assistant' && msg.content) {
          for (const block of msg.content) {
            if (block.type === 'text' && block.text) {
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}`,
                type: 'agent_action',
                agent: extractAgentName(session.key),
                action: truncate(block.text, 200),
                timestamp: msg.timestamp,
                sessionKey: session.key,
                model: session.model,
                cost: msg.usage?.cost?.total,
              });
            }
            if (block.type === 'toolCall') {
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}-${block.id}`,
                type: 'tool_call',
                agent: extractAgentName(session.key),
                action: `${block.name}(${summarizeArgs(block.arguments)})`,
                timestamp: msg.timestamp,
                sessionKey: session.key,
                model: session.model,
              });
            }
          }
        }
        if (msg.role === 'user' && msg.content) {
          for (const block of msg.content) {
            if (block.type === 'text' && block.text) {
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}-user`,
                type: 'user_message',
                agent: session.displayName || 'User',
                action: truncate(block.text, 200),
                timestamp: msg.timestamp,
                sessionKey: session.key,
              });
            }
          }
        }
      }
    }

    // Sort by timestamp descending
    activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return NextResponse.json({
      activities: activities.slice(0, 50),
      sessions: data.sessions?.map((s: Session) => ({
        key: s.key,
        displayName: s.displayName,
        model: s.model,
        totalTokens: s.totalTokens,
        updatedAt: s.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity', activities: [], sessions: [] },
      { status: 500 }
    );
  }
}

interface ActivityEntry {
  id: string;
  type: 'agent_action' | 'tool_call' | 'user_message' | 'subagent_spawn';
  agent: string;
  action: string;
  timestamp?: number;
  sessionKey?: string;
  model?: string;
  cost?: number;
}

interface Session {
  key: string;
  displayName?: string;
  model?: string;
  totalTokens?: number;
  updatedAt?: number;
  sessionId?: string;
  messages?: Message[];
}

interface Message {
  role: string;
  content?: ContentBlock[];
  timestamp?: number;
  usage?: {
    cost?: {
      total?: number;
    };
  };
}

interface ContentBlock {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  arguments?: Record<string, unknown>;
}

function extractAgentName(sessionKey: string): string {
  // Extract meaningful name from session key like "agent:main:main"
  const parts = sessionKey.split(':');
  if (parts.length >= 3) {
    if (parts[2] === 'main') return 'NEVA';
    return parts[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  return 'NEVA';
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

function summarizeArgs(args: Record<string, unknown> | undefined): string {
  if (!args) return '';
  const keys = Object.keys(args);
  if (keys.length === 0) return '';
  if (keys.length === 1 && typeof args[keys[0]] === 'string') {
    const val = args[keys[0]] as string;
    return truncate(val, 40);
  }
  return keys.slice(0, 2).join(', ');
}
