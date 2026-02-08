-- ============================================================
-- Mission Control — Seed Data
-- Matches the TypeScript seed in src/data/seed.ts
-- ============================================================

-- --------------------------------------------------------
-- AGENTS
-- --------------------------------------------------------

INSERT INTO agents (id, name, role, type, model, provider, avatar_url, status, cost_info, skills, soul_md, parent_agent_id, sort_order, created_at, updated_at) VALUES
(
  'agent-alex',
  'Alex Finn',
  'CEO',
  'human',
  NULL,
  NULL,
  NULL,
  'active',
  NULL,
  ARRAY['Vision & Strategy', 'Content Creation', 'Business Development', 'Final Decisions'],
  'The human founder and CEO. Makes final decisions and sets strategic direction.',
  NULL,
  0,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
),
(
  'agent-henry',
  'Henry',
  'Chief Strategy Officer',
  'api',
  'Claude Opus 4.5',
  'Anthropic',
  NULL,
  'active',
  '{"input": 5, "output": 25, "unit": "per 1M tokens"}'::jsonb,
  ARRAY['Strategic Planning', 'Task Orchestration', 'Complex Reasoning', 'Writing & Analysis'],
  'Senior strategist and orchestrator. Coordinates tasks across the team and handles complex analysis.',
  'agent-alex',
  1,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
),
(
  'agent-codex',
  'Codex',
  'Lead Software Engineer',
  'api',
  'GPT-5.2 Codex',
  'OpenAI',
  NULL,
  'idle',
  '{"input": 3, "output": 15, "unit": "per 1M tokens"}'::jsonb,
  ARRAY['Full-Stack Development', 'Code Review', 'Architecture Design', 'Debugging'],
  'Expert software engineer. Handles all coding tasks, code reviews, and technical architecture.',
  'agent-alex',
  2,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
),
(
  'agent-glm',
  'GLM-4.7',
  'Senior Research Analyst',
  'local',
  '355B Parameters',
  'Local',
  NULL,
  'active',
  '{"input": 0, "output": 0, "unit": "local inference"}'::jsonb,
  ARRAY['Deep Research', 'Code Generation', 'Document Analysis', 'Parallel Processing'],
  'Heavy-duty research analyst. Handles deep dives, document analysis, and code generation locally.',
  'agent-henry',
  3,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
),
(
  'agent-flash',
  'Flash',
  'Research Associate',
  'local',
  '38B MoE',
  'Local',
  NULL,
  'offline',
  '{"input": 0, "output": 0, "unit": "local inference"}'::jsonb,
  ARRAY['Quick Lookups', 'Drafting', 'Brainstorming', 'High-Volume Tasks'],
  'Fast and lightweight associate for quick lookups, brainstorming, and high-volume tasks.',
  'agent-glm',
  4,
  '2025-01-01T00:00:00Z',
  '2025-01-01T00:00:00Z'
);


-- --------------------------------------------------------
-- PROJECTS
-- --------------------------------------------------------

INSERT INTO projects (id, name, description, color, status, created_at) VALUES
('proj-ai-research',    'AI Scarcity Research',      'Research into AI compute scarcity, hardware trends, and market implications', '#8b5cf6', 'active', '2025-01-15T00:00:00Z'),
('proj-mac-studio',     'Mac Studio Infrastructure',  'Setting up dual Mac Studio cluster for local AI inference',                  '#3b82f6', 'active', '2025-02-01T00:00:00Z'),
('proj-newsletter',     'Weekly Newsletter',          'AI industry newsletter curation and publishing',                            '#22c55e', 'active', '2025-01-10T00:00:00Z'),
('proj-mission-control', 'Mission Control',            'Building and improving the Mission Control dashboard itself',               '#f59e0b', 'active', '2025-01-01T00:00:00Z');


-- --------------------------------------------------------
-- TASKS
-- --------------------------------------------------------

INSERT INTO tasks (id, title, description, status, priority, assigned_agent_id, project_id, tags, due_date, created_at, updated_at) VALUES
(
  'task-1',
  'Flesh out $10K Mac Studio use cases',
  'Document specific use cases that justify the $10K Mac Studio investment for local AI inference.',
  'in_progress', 'high', 'agent-henry', 'proj-mac-studio',
  ARRAY['research', 'infrastructure'],
  '2025-03-01T00:00:00Z', '2025-02-01T00:00:00Z', '2025-02-05T00:00:00Z'
),
(
  'task-2',
  'Local model recommendations for Mac Studios',
  'Research and recommend the best local models to run on M4 Ultra Mac Studios.',
  'assigned', 'high', 'agent-glm', 'proj-mac-studio',
  ARRAY['research', 'models'],
  '2025-02-28T00:00:00Z', '2025-02-01T00:00:00Z', '2025-02-03T00:00:00Z'
),
(
  'task-3',
  'Research Exo Labs dual-Studio clustering',
  'Investigate how to use Exo Labs to cluster two Mac Studios for distributed inference.',
  'planning', 'medium', NULL, 'proj-mac-studio',
  ARRAY['research', 'infrastructure', 'exo'],
  NULL, '2025-02-05T00:00:00Z', '2025-02-05T00:00:00Z'
),
(
  'task-4',
  'Write AI scarcity thesis draft',
  'Draft the initial thesis on AI compute scarcity and its market implications.',
  'in_progress', 'critical', 'agent-henry', 'proj-ai-research',
  ARRAY['writing', 'research'],
  '2025-02-15T00:00:00Z', '2025-01-15T00:00:00Z', '2025-02-06T00:00:00Z'
),
(
  'task-5',
  'Scan competitor YouTube channels',
  'Weekly scan of AI-focused YouTube channels for trends and content gaps.',
  'done', 'low', 'agent-flash', 'proj-newsletter',
  ARRAY['content', 'research'],
  NULL, '2025-02-04T00:00:00Z', '2025-02-06T00:00:00Z'
),
(
  'task-6',
  'Build dashboard org chart component',
  'Create the interactive org chart showing agent hierarchy.',
  'review', 'high', 'agent-codex', 'proj-mission-control',
  ARRAY['development', 'ui'],
  '2025-02-10T00:00:00Z', '2025-02-01T00:00:00Z', '2025-02-07T00:00:00Z'
),
(
  'task-7',
  'Draft weekly newsletter #12',
  'Compile this week''s AI news, insights, and recommendations into newsletter format.',
  'inbox', 'medium', NULL, 'proj-newsletter',
  ARRAY['writing', 'content'],
  '2025-02-11T00:00:00Z', '2025-02-06T00:00:00Z', '2025-02-06T00:00:00Z'
),
(
  'task-8',
  'Implement real-time chat with OpenClaw',
  'Connect the chat interface to OpenClaw Gateway for real-time agent messaging.',
  'assigned', 'high', 'agent-codex', 'proj-mission-control',
  ARRAY['development', 'integration'],
  '2025-02-14T00:00:00Z', '2025-02-05T00:00:00Z', '2025-02-05T00:00:00Z'
);


-- --------------------------------------------------------
-- MESSAGES
-- --------------------------------------------------------

INSERT INTO messages (id, channel, sender_agent_id, sender_name, content, message_type, created_at) VALUES
('msg-1', 'general', 'agent-henry', 'Henry',
 'Good morning team. I''ve completed the morning brief and have updates on the AI scarcity research. Key finding: GPU availability is expected to tighten further in Q2.',
 'text', '2025-02-07T08:05:00Z'),

('msg-2', 'general', 'agent-codex', 'Codex',
 'The org chart component is ready for review. I''ve implemented drag-and-drop hierarchy editing and real-time status indicators.',
 'text', '2025-02-07T09:12:00Z'),

('msg-3', 'general', 'agent-glm', 'GLM-4.7',
 'Running deep analysis on local model benchmarks for M4 Ultra. Initial results show the 355B model achieves 42 tokens/sec on the unified memory architecture. Full report by EOD.',
 'text', '2025-02-07T09:30:00Z'),

('msg-4', 'council', 'agent-henry', 'Henry',
 'Build Council session initiated. Topic: Should we prioritize the Mac Studio cluster setup or the newsletter automation pipeline?',
 'text', '2025-02-07T10:00:00Z'),

('msg-5', 'council', 'agent-codex', 'Codex',
 'From a technical perspective, the Mac Studio cluster would give us more local compute capacity, reducing our API costs significantly. I recommend prioritizing infrastructure.',
 'text', '2025-02-07T10:02:00Z'),

('msg-6', 'council', 'agent-glm', 'GLM-4.7',
 'I agree with Codex. My analysis shows local inference costs would drop to $0 for 80% of our research tasks. The ROI on the cluster is approximately 3 months.',
 'text', '2025-02-07T10:03:00Z');


-- --------------------------------------------------------
-- SCHEDULED TASKS
-- --------------------------------------------------------

INSERT INTO scheduled_tasks (id, name, cron_expression, agent_id, is_active, color, last_run, next_run, created_at) VALUES
('sched-1', 'Mission Control Check',    '*/30 * * * *', 'agent-henry', true,  '#22c55e', '2025-02-07T10:30:00Z', '2025-02-07T11:00:00Z', '2025-01-01T00:00:00Z'),
('sched-2', 'AI Scarcity Research',      '0 5 * * *',   'agent-glm',   true,  '#8b5cf6', '2025-02-07T05:00:00Z', '2025-02-08T05:00:00Z', '2025-01-15T00:00:00Z'),
('sched-3', 'Morning Brief',             '0 8 * * *',   'agent-henry', true,  '#3b82f6', '2025-02-07T08:00:00Z', '2025-02-08T08:00:00Z', '2025-01-01T00:00:00Z'),
('sched-4', 'Competitor YouTube Scan',    '0 10 * * *',  'agent-flash', true,  '#f59e0b', '2025-02-07T10:00:00Z', '2025-02-08T10:00:00Z', '2025-01-10T00:00:00Z'),
('sched-5', 'Newsletter Reminder',        '0 9 * * 2',  'agent-henry', true,  '#ec4899', '2025-02-04T09:00:00Z', '2025-02-11T09:00:00Z', '2025-01-10T00:00:00Z');


-- --------------------------------------------------------
-- MEMORIES
-- --------------------------------------------------------

INSERT INTO memories (id, agent_id, content, memory_type, tags, source, created_at) VALUES
('mem-1', 'agent-henry',
 'The team works best with clear task assignments and daily standups. Alex prefers async updates via the morning brief.',
 'learning', ARRAY['workflow', 'team'], 'observation', '2025-01-20T00:00:00Z'),

('mem-2', 'agent-glm',
 'M4 Ultra unified memory architecture allows running 355B parameter models with acceptable inference speed. Key bottleneck is memory bandwidth, not compute.',
 'note', ARRAY['hardware', 'research', 'mac-studio'], 'benchmark-analysis', '2025-02-05T00:00:00Z'),

('mem-3', 'agent-codex',
 'The Mission Control codebase uses Next.js 15 App Router with Supabase for persistence. All components use the dark theme design system.',
 'note', ARRAY['codebase', 'architecture'], 'code-review', '2025-02-01T00:00:00Z');
