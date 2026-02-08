import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeMinutes = parseInt(searchParams.get('minutes') || '10080', 10);
    const messageLimit = parseInt(searchParams.get('messageLimit') || '50', 10);
    const maxActivities = parseInt(searchParams.get('limit') || '200', 10);

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
          activeMinutes,
          messageLimit,
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
        activities: [],
        activitiesByDay: {},
        totalCount: 0,
        sessions: [],
        error: 'No session data returned',
      });
    }

    const sessions = data.result.details.sessions;
    const activities: ActivityEntry[] = [];

    for (const session of sessions) {
      for (const msg of session.messages || []) {
        if (msg.role === 'assistant' && msg.content) {
          for (const block of msg.content) {
            if (block.type === 'text' && block.text) {
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}-text`,
                type: 'agent_action',
                agent: extractAgentName(session.key),
                action: truncate(block.text, 300),
                timestamp: msg.timestamp,
                sessionKey: session.key,
                model: session.model,
                cost: msg.usage?.cost?.total,
              });
            }
            if (block.type === 'toolCall') {
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}-${block.id || 'tool'}`,
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
              const text = block.text;
              if (text.includes('heartbeat') || text.startsWith('On each heartbeat')) {
                continue;
              }
              activities.push({
                id: `${session.sessionId}-${msg.timestamp}-user`,
                type: 'user_message',
                agent: session.displayName || 'User',
                action: truncate(text, 300),
                timestamp: msg.timestamp,
                sessionKey: session.key,
              });
            }
          }
        }
      }
    }

    activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const activitiesByDay = groupByDay(activities.slice(0, maxActivities));

    return NextResponse.json({
      activities: activities.slice(0, maxActivities),
      activitiesByDay,
      totalCount: activities.length,
      sessions: sessions.map((s: Session) => ({
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
      { error: 'Failed to fetch activity', activities: [], activitiesByDay: {}, sessions: [] },
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
  usage?: { cost?: { total?: number } };
}

interface ContentBlock {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  arguments?: Record<string, unknown>;
}

function extractAgentName(sessionKey: string): string {
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
    return truncate(args[keys[0]] as string, 50);
  }
  return keys.slice(0, 3).join(', ');
}

function groupByDay(activities: ActivityEntry[]): Record<string, ActivityEntry[]> {
  const groups: Record<string, ActivityEntry[]> = {};
  for (const activity of activities) {
    if (!activity.timestamp) continue;
    const dayKey = new Date(activity.timestamp).toISOString().split('T')[0];
    if (!groups[dayKey]) groups[dayKey] = [];
    groups[dayKey].push(activity);
  }
  return groups;
}
