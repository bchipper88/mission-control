import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!OPENCLAW_GATEWAY_TOKEN) {
      return NextResponse.json({ error: 'Gateway not configured' }, { status: 500 });
    }

    // Call OpenClaw Gateway OpenResponses API
    const response = await fetch(`${OPENCLAW_GATEWAY_URL}/v1/responses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
        'x-openclaw-agent-id': 'main',
      },
      body: JSON.stringify({
        model: 'openclaw:main',
        input: message,
        user: 'mission-control-john',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gateway error:', errorText);
      return NextResponse.json({ error: 'Gateway request failed' }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract the response text from OpenResponses format
    let responseText = '';
    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && item.content) {
          for (const part of item.content) {
            if (part.type === 'output_text' || part.type === 'text') {
              responseText += part.text || '';
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      response: responseText || data.output?.[0]?.content?.[0]?.text || 'No response',
      raw: data 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
