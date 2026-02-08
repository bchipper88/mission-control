import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

export async function GET() {
  try {
    // Fetch session status for config info
    const sessionResponse = await fetch(`${GATEWAY_URL}/tools/invoke`, {
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

    let config = null;
    let gateway = null;

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      if (sessionData.ok && sessionData.result) {
        const result = sessionData.result;
        const details = result.details || {};
        
        config = {
          model: details.model || result.model || 'unknown',
          thinkingMode: details.thinkingMode || details.thinking || 'off',
          channel: details.channel || 'unknown',
          workspaceDir: details.workspace || details.workspaceDir || 'unknown',
          capabilities: details.capabilities || [],
        };

        gateway = {
          online: true,
          version: details.version || 'unknown',
          uptime: details.uptime || 0,
          hostname: details.host || details.hostname || 'openclaw-gateway',
          model: config.model,
          thinkingMode: config.thinkingMode,
          channel: config.channel,
          lastPing: new Date().toISOString(),
        };
      }
    }

    // Fetch nodes status
    let nodes: Array<{
      id: string;
      name: string;
      type: 'phone' | 'desktop' | 'server';
      online: boolean;
      lastSeen: string;
      os?: string;
      capabilities?: string[];
    }> = [];
    
    try {
      const nodesResponse = await fetch(`${GATEWAY_URL}/tools/invoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: 'nodes',
          args: {
            action: 'status',
          },
        }),
        cache: 'no-store',
      });

      if (nodesResponse.ok) {
        const nodesData = await nodesResponse.json();
        if (nodesData.ok && nodesData.result) {
          const rawNodes = nodesData.result.nodes || nodesData.result || [];
          nodes = Array.isArray(rawNodes) ? rawNodes.map((n: Record<string, unknown>) => ({
            id: (n.id || n.nodeId || '') as string,
            name: (n.name || n.displayName || 'Unknown Device') as string,
            type: ((n.type || n.deviceType || 'server') as string).toLowerCase() as 'phone' | 'desktop' | 'server',
            online: n.online !== false && n.status !== 'offline',
            lastSeen: (n.lastSeen || n.lastActivity || new Date().toISOString()) as string,
            os: (n.os || n.platform) as string | undefined,
            capabilities: (n.capabilities || []) as string[],
          })) : [];
        }
      }
    } catch (e) {
      console.error('Failed to fetch nodes:', e);
    }

    // If we couldn't get gateway info, mark as offline
    if (!gateway) {
      gateway = {
        online: false,
        version: 'unknown',
        uptime: 0,
        hostname: 'unknown',
        model: 'unknown',
        thinkingMode: 'unknown',
        channel: 'unknown',
        lastPing: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      gateway,
      config,
      nodes,
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch status from gateway',
        gateway: {
          online: false,
          version: 'unknown',
          uptime: 0,
          hostname: 'unknown',
          model: 'unknown',
          thinkingMode: 'unknown',
          channel: 'unknown',
          lastPing: new Date().toISOString(),
        },
        config: null,
        nodes: [],
      },
      { status: 500 }
    );
  }
}
