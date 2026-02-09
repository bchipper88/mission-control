import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hobabywxwlpclvytsfvy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Gateway for sending approvals
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'https://entrepreneurbot.tailf3b898.ts.net';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

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

function parseIdea(doc: { id: string; title: string; content: string; created_at: string }): Idea {
  const content = doc.content || '';
  
  // Extract status from content
  const statusMatch = content.match(/\*\*Status\*\*:\s*(\w+)/i);
  const status = statusMatch ? statusMatch[1] : 'unknown';
  
  // Extract score from content
  const scoreMatch = content.match(/(?:Preliminary\s+)?Score[:\s]*(\d+(?:\.\d+)?)/i);
  const councilScoreMatch = content.match(/Council Score[:\s]*(\d+(?:\.\d+)?)/i);
  const avgMatch = content.match(/Average[:\s]*(\d+(?:\.\d+)?)/i);
  const score = councilScoreMatch ? parseFloat(councilScoreMatch[1]) 
    : avgMatch ? parseFloat(avgMatch[1])
    : scoreMatch ? parseFloat(scoreMatch[1]) : undefined;
  
  // Determine council status from content
  let councilStatus: Idea['councilStatus'] = 'pending';
  const contentLower = content.toLowerCase();
  if (contentLower.includes('council result') || contentLower.includes('council evaluation')) {
    if (contentLower.includes('approved')) councilStatus = 'approved';
    else if (contentLower.includes('rejected') || contentLower.includes('fail')) councilStatus = 'rejected';
    else councilStatus = 'completed';
  }
  
  // Check John's verdict section
  const verdictMatch = content.match(/John's Verdict[\s\S]*?\*\*Decision\*\*:\s*(\w+)/i);
  if (verdictMatch) {
    const verdict = verdictMatch[1].toLowerCase();
    if (verdict === 'approved') councilStatus = 'approved';
    else if (verdict === 'rejected') councilStatus = 'rejected';
  }
  
  const filename = doc.id.replace('idea-', '') + '.md';
  
  return {
    id: doc.id.replace('idea-', ''),
    filename,
    title: doc.title,
    status,
    content: content.slice(0, 5000),
    score,
    councilStatus,
    createdAt: doc.created_at,
  };
}

function parseCouncilTranscript(doc: { id: string; title: string; content: string; created_at: string }): CouncilTranscript {
  const content = doc.content || '';
  
  // Extract idea name from title or heading
  const nameMatch = content.match(/^#\s+Council Evaluation:\s*(.+)$/m);
  const ideaName = nameMatch ? nameMatch[1].trim() : doc.title.replace('Council Evaluation: ', '');
  
  // Extract average score
  const avgMatch = content.match(/\*\*Average(?:\s+Score)?[:\s]*(\d+(?:\.\d+)?)/i);
  const averageScore = avgMatch ? parseFloat(avgMatch[1]) : 0;
  
  // Extract verdict
  const verdictMatch = content.match(/\*\*(?:Final\s+)?Verdict[:\s]*(\w+)/i);
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
  
  const filename = doc.id.replace('transcript-', '') + '.md';
  
  return {
    id: doc.id.replace('transcript-', ''),
    filename,
    ideaName,
    averageScore,
    verdict,
    content: content.slice(0, 8000),
    createdAt: doc.created_at,
    scores,
  };
}

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Fetch ideas from Supabase
    const { data: ideaDocs, error: ideasError } = await supabase
      .from('documents')
      .select('*')
      .eq('doc_type', 'idea')
      .order('id');
    
    if (ideasError) {
      console.error('Supabase ideas error:', ideasError);
    }
    
    // Fetch transcripts from Supabase
    const { data: transcriptDocs, error: transcriptsError } = await supabase
      .from('documents')
      .select('*')
      .eq('doc_type', 'council_transcript')
      .order('id');
    
    if (transcriptsError) {
      console.error('Supabase transcripts error:', transcriptsError);
    }
    
    const ideas: Idea[] = (ideaDocs || []).map(parseIdea);
    const transcripts: CouncilTranscript[] = (transcriptDocs || []).map(parseCouncilTranscript);
    
    // Link ideas to their council results
    for (const idea of ideas) {
      const transcript = transcripts.find(t => 
        t.ideaName.toLowerCase().includes(idea.title.split('—')[0].trim().toLowerCase()) ||
        t.filename.includes(idea.id.replace(/^\d+-/, ''))
      );
      if (transcript) {
        idea.score = transcript.averageScore;
        if (idea.councilStatus === 'pending') {
          idea.councilStatus = transcript.verdict.toLowerCase() === 'approved' ? 'approved' 
            : transcript.verdict.toLowerCase() === 'rejected' ? 'rejected'
            : 'completed';
        }
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

// Handle approval/rejection/submit_to_council
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, action, comment } = body;
    
    if (!ideaId || !action) {
      return NextResponse.json({ error: 'Missing ideaId or action' }, { status: 400 });
    }
    
    // Handle submit to council
    if (action === 'submit_to_council') {
      if (GATEWAY_TOKEN) {
        const message = `[COUNCIL REQUEST] John has requested a council evaluation for idea "${ideaId}". Please run the 5-agent council on this idea and report results.`;
        
        // Fire and forget - don't wait for agent response
        fetch(`${GATEWAY_URL}/v1/responses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GATEWAY_TOKEN}`,
            'Content-Type': 'application/json',
            'x-openclaw-agent-id': 'main',
          },
          body: JSON.stringify({
            model: 'openclaw:main',
            input: message,
            user: 'mission-control-john',
          }),
        }).catch(e => console.error('Failed to notify NEVA:', e));
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Submitted to council' 
      });
    }
    
    // Update Supabase document with John's decision
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('content')
      .eq('id', `idea-${ideaId}`)
      .single();
    
    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    // Update the John's Verdict section in the content
    let content = doc.content || '';
    const verdictSection = `
## John's Verdict
**Decision:** ${action === 'approve' ? 'APPROVED' : 'REJECTED'}
**Date:** ${new Date().toISOString().split('T')[0]}
**Comments:**
> ${comment || '(No comment provided)'}
`;
    
    // Replace existing verdict section or append
    if (content.includes("## John's Verdict")) {
      content = content.replace(/## John's Verdict[\s\S]*?(?=##|$)/, verdictSection);
    } else {
      content += '\n---\n' + verdictSection;
    }
    
    // Update in Supabase
    await supabase
      .from('documents')
      .update({ content })
      .eq('id', `idea-${ideaId}`);
    
    // Notify NEVA via gateway (fire and forget)
    if (GATEWAY_TOKEN) {
      const message = action === 'approve'
        ? `[COUNCIL APPROVAL] John has APPROVED idea "${ideaId}" for building.${comment ? ` Comment: "${comment}"` : ''} Proceed to Build Phase.`
        : `[COUNCIL REJECTION] John has REJECTED idea "${ideaId}".${comment ? ` Comment: "${comment}"` : ''} Continue research.`;
      
      fetch(`${GATEWAY_URL}/v1/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json',
          'x-openclaw-agent-id': 'main',
        },
        body: JSON.stringify({
          model: 'openclaw:main',
          input: message,
          user: 'mission-control-john',
        }),
      }).catch(e => console.error('Failed to notify NEVA:', e));
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Idea ${action === 'approve' ? 'approved' : 'rejected'}` 
    });
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}
