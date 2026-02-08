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

// Fallback data when gateway tools aren't available
const FALLBACK_MEMORIES: MemoryEntry[] = [
  {
    id: 'research-pain-points',
    path: '/home/john_honochick/.openclaw/workspace/knowledge/research/pain-points-database.md',
    filename: 'pain-points-database.md',
    content: `# Pain Points Database

A growing catalog of validated pain points discovered through research.

## 📦 E-commerce / Shopify
- **App Sprawl:** "I have 14 installed but only use 3" - Average $100-400/mo
- **Ghost Code:** Agencies charge $395 for cleanup, Cleanify Code exited
- **Chargebacks:** Banks side with customers 80%, Shopify Fraud Filter deprecated
- **Store Speed:** Apps + themes cause bloat

## 📋 Compliance & Legal  
- **AI Disclosure Laws:** CA CCPA ADMT (Jan 2026), CO AI Act (June 2026)
- Penalties: $2,500-7,500 per violation PER CONSUMER
- Enterprise tools cost $50K+/yr

## 💰 SaaS Costs
- Salesforce 6-9%, Slack 20%, Adobe 17% price increases
- "AI bundling" justifies 10-20% increases
- Avg SaaS spend: $7,900/employee (27% increase)

## 🤖 AI / Automation
- Content repurposing (crowded)
- Meeting notes → actions (established players)
- Proposal generation (crowded)

## 🏢 Agency / Freelancer
- Project handoffs cause scope creep
- Client document collection (Content Snare validates)
- SOP documentation gets outdated

[Full database in workspace: knowledge/research/pain-points-database.md]`,
    type: 'research',
    created_at: '2026-02-08T22:44:00Z',
    modified_at: '2026-02-08T22:44:00Z',
    tags: ['pain-points', 'research', 'shopify', 'compliance', 'saas'],
    agent_id: 'agent-neva',
  },
  {
    id: 'learning-council-001',
    path: '/home/john_honochick/.openclaw/workspace/knowledge/learnings/2026-02-08-council-001-learnings.md',
    filename: '2026-02-08-council-001-learnings.md',
    content: `# Council #001 Learnings: Chargeback Shield

**Result:** 84.4 avg (CONDITIONAL)

## Key Insight: Cold-Start Problem
Council caught that AI fraud scoring needs training data we don't have.

## Pivot Recommendation
"Fraud Advisor" (second opinion) instead of "Fraud Blocker" (auto-block)
- Lower stakes = easier trust building
- Earn merchant trust before auto-blocking

## Timing Window
Shopify Fraud Filter deprecated Jan 31, 2025
- 30-60 day window before market consolidates
- Score drops to 70 if we wait

## Pattern for Future Ideas
Avoid ideas requiring proprietary ML training data.
Prefer rule-based or API-powered solutions.`,
    type: 'learning',
    created_at: '2026-02-08T20:00:00Z',
    modified_at: '2026-02-08T20:00:00Z',
    tags: ['council', 'chargeback-shield', 'cold-start', 'learnings'],
    agent_id: 'agent-neva',
  },
  {
    id: 'idea-004',
    path: '/home/john_honochick/.openclaw/workspace/knowledge/ideas/004-chargeback-shield.md',
    filename: '004-chargeback-shield.md',
    content: `# Idea #004: Chargeback Shield

**Status:** Council Complete (CONDITIONAL)
**Score:** 84.4 avg

AI fraud prevention for Shopify merchants.

## Scores
- Demand: 88
- Unfair Advantage: 72 (cold-start issue)
- Economics: 88
- Execution: 80
- Timing: 94 (Shopify Fraud Filter deprecated)

## Recommendation
Pivot to "Fraud Advisor" model.`,
    type: 'idea',
    created_at: '2026-02-08T18:00:00Z',
    modified_at: '2026-02-08T19:10:00Z',
    tags: ['idea', 'shopify', 'fraud', 'council-evaluated'],
    agent_id: 'agent-neva',
  },
  {
    id: 'idea-007',
    path: '/home/john_honochick/.openclaw/workspace/knowledge/ideas/007-ai-compliance-checker.md',
    filename: '007-ai-compliance-checker.md',
    content: `# Idea #007: AI Compliance Checker

**Status:** Council Complete (CONDITIONAL)
**Score:** ~78 avg

Tool for new state AI disclosure laws.

## Timing Trigger
- CA CCPA ADMT: Jan 1, 2026 (ACTIVE)
- CO AI Act: June 30, 2026

## Scores
- Advantage: 95
- Economics: 88
- Execution: 52 (legal liability concerns)
- Timing: 78

## Key Risk
Legal liability if disclosures are wrong.
Pivot to "assessment tool + lawyer referral" recommended.`,
    type: 'idea',
    created_at: '2026-02-08T22:20:00Z',
    modified_at: '2026-02-08T22:37:00Z',
    tags: ['idea', 'compliance', 'california', 'colorado', 'council-evaluated'],
    agent_id: 'agent-neva',
  },
  {
    id: 'research-ecommerce-gaps',
    path: '/home/john_honochick/.openclaw/workspace/knowledge/research/ecommerce-automation-gaps.md',
    filename: 'ecommerce-automation-gaps.md',
    content: `# E-commerce Automation Gaps Research

## High-Opportunity Areas
1. Chargeback/Fraud Prevention (SMB gap)
2. Returns Fraud Detection
3. Subscription Box Optimization
4. Multi-channel Inventory Sync

## Validated Pain Points
- Fraud Filter deprecated → merchants scrambling
- FraudLabs Pro has 3.5★ rating (opportunity)
- Returns fraud costing 5-10% of revenue`,
    type: 'research',
    created_at: '2026-02-08T17:00:00Z',
    modified_at: '2026-02-08T18:10:00Z',
    tags: ['research', 'ecommerce', 'shopify', 'fraud'],
    agent_id: 'agent-neva',
  },
];

export async function GET() {
  try {
    let memories: MemoryEntry[] = [];

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

    // If no memories loaded from gateway, use fallback
    if (memories.length === 0) {
      memories = FALLBACK_MEMORIES;
    }

    return NextResponse.json({
      memories,
      workspace: WORKSPACE_PATH,
      count: memories.length,
    });
  } catch (error) {
    console.error('Memory fetch error:', error);
    // Return fallback data on error
    return NextResponse.json({
      memories: FALLBACK_MEMORIES,
      workspace: WORKSPACE_PATH,
      count: FALLBACK_MEMORIES.length,
      fallback: true,
    });
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
