import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

export async function GET() {
  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'cron',
        args: {
          action: 'list',
        },
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gateway returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({
        jobs: [],
        error: data.error || 'Failed to fetch cron jobs',
      });
    }

    // Parse the cron list response
    const jobs = data.result?.jobs || data.result || [];
    
    // Normalize job format
    const normalizedJobs = Array.isArray(jobs) ? jobs.map((job: Record<string, unknown>, idx: number) => ({
      id: job.id || job.name || `job-${idx}`,
      name: job.name || job.id || `Job ${idx + 1}`,
      schedule: job.schedule || job.cron || '* * * * *',
      enabled: job.enabled !== false,
      lastRun: job.lastRun || job.last_run || null,
      nextRun: job.nextRun || job.next_run || null,
      lastStatus: job.lastStatus || job.last_status || null,
      description: job.description || null,
    })) : [];

    return NextResponse.json({
      jobs: normalizedJobs,
      count: normalizedJobs.length,
    });
  } catch (error) {
    console.error('Cron fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cron jobs from gateway',
        jobs: [],
      },
      { status: 500 }
    );
  }
}
