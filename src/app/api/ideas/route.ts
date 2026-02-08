import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const WORKSPACE_PATH = '/home/john_honochick/.openclaw/workspace';

interface Idea {
  id: string;
  filename: string;
  title: string;
  status: string;
  content: string;
  score?: number;
  councilStatus?: 'pending' | 'completed' | 'approved' | 'rejected';
  createdAt: string;
}

interface CouncilTranscript {
  id: string;
  filename: string;
  ideaName: string;
  averageScore: number;
  verdict: string;
  content: string;
  createdAt: string;
  scores: { agent: string; score: number; verdict: string }[];
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

async function readFile(filePath: string): Promise<string | null> {
  try {
    const result = await invokeGatewayTool('Read', {
      path: filePath,
    });
    return typeof result === 'string' ? result : (result.content || result.text || '');
  } catch {
    return null;
  }
}

function parseIdea(filename: string, content: string): Idea {
  // Extract title from first # heading
  const titleMatch = content.match(/^#\s+(?:Idea:\s*)?(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace('.md', '');
  
  // Extract status
  const statusMatch = content.match(/\*\*Status\*\*:\s*(\w+)/i);
  const status = statusMatch ? statusMatch[1] : 'unknown';
  
  // Extract preliminary score
  const scoreMatch = content.match(/(?:Preliminary\s+)?Score:\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : undefined;
  
  // Determine council status
  let councilStatus: Idea['councilStatus'] = 'pending';
  if (status.toLowerCase().includes('council') || status.toLowerCase().includes('ready')) {
    councilStatus = 'pending';
  }
  
  return {
    id: filename.replace('.md', ''),
    filename,
    title,
    status,
    content: content.slice(0, 3000), // Truncate for display
    score,
    councilStatus,
    createdAt: new Date().toISOString(), // Would need file stat for real date
  };
}

function parseCouncilTranscript(filename: string, content: string): CouncilTranscript {
  // Extract idea name from heading
  const nameMatch = content.match(/^#\s+Council Evaluation:\s*(.+)$/m);
  const ideaName = nameMatch ? nameMatch[1].trim() : filename.replace('.md', '');
  
  // Extract average score
  const avgMatch = content.match(/\*\*Average(?:\s+Score)?:\s*(\d+(?:\.\d+)?)/i);
  const averageScore = avgMatch ? parseFloat(avgMatch[1]) : 0;
  
  // Extract verdict
  const verdictMatch = content.match(/\*\*(?:Final\s+)?Verdict:\s*(\w+)/i);
  const verdict = verdictMatch ? verdictMatch[1] : 'unknown';
  
  // Extract individual scores from table
  const scores: CouncilTranscript['scores'] = [];
  const tableMatch = content.match(/\|\s*(\w+(?:\s+\w+)?)\s*\|\s*(\d+)\s*\|\s*(\w+)\s*\|/g);
  if (tableMatch) {
    for (const row of tableMatch) {
      const parts = row.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3 && !parts[0].toLowerCase().includes('agent')) {
        scores.push({
          agent: parts[0],
          score: parseInt(parts[1]) || 0,
          verdict: parts[2],
        });
      }
    }
  }
  
  return {
    id: filename.replace('.md', ''),
    filename,
    ideaName,
    averageScore,
    verdict,
    content: content.slice(0, 5000),
    createdAt: new Date().toISOString(),
    scores,
  };
}

export async function GET() {
  try {
    const ideas: Idea[] = [];
    const transcripts: CouncilTranscript[] = [];

    // Read ideas from knowledge/ideas/
    const ideasDir = `${WORKSPACE_PATH}/knowledge/ideas`;
    const ideaFiles = await listDirectory(ideasDir);
    for (const file of ideaFiles) {
      const content = await readFile(`${ideasDir}/${file}`);
      if (content) {
        ideas.push(parseIdea(file, content));
      }
    }

    // Read council transcripts
    const transcriptsDir = `${WORKSPACE_PATH}/council-transcripts`;
    const transcriptFiles = await listDirectory(transcriptsDir);
    for (const file of transcriptFiles) {
      const content = await readFile(`${transcriptsDir}/${file}`);
      if (content) {
        transcripts.push(parseCouncilTranscript(file, content));
      }
    }

    // Link ideas to their council results
    for (const idea of ideas) {
      const transcript = transcripts.find(t => 
        t.ideaName.toLowerCase().includes(idea.title.split('—')[0].trim().toLowerCase()) ||
        t.filename.includes(idea.id.replace(/^\d+-/, ''))
      );
      if (transcript) {
        idea.score = transcript.averageScore;
        idea.councilStatus = transcript.verdict.toLowerCase() === 'approved' ? 'approved' 
          : transcript.verdict.toLowerCase() === 'rejected' ? 'rejected'
          : 'completed';
      }
    }

    // Sort ideas by ID (number prefix)
    ideas.sort((a, b) => {
      const numA = parseInt(a.id.match(/^\d+/)?.[0] || '999');
      const numB = parseInt(b.id.match(/^\d+/)?.[0] || '999');
      return numA - numB;
    });

    return NextResponse.json({
      ideas,
      transcripts,
      count: { ideas: ideas.length, transcripts: transcripts.length },
    });
  } catch (error) {
    console.error('Ideas fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas', ideas: [], transcripts: [] },
      { status: 500 }
    );
  }
}
