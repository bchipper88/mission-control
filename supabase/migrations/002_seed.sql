-- ============================================================
-- Mission Control — Seed Data
-- Real data: John (Investor) + NEVA (AI Founder)
-- ============================================================

-- Clear existing data
TRUNCATE agents, projects, tasks, messages, scheduled_tasks, memories CASCADE;

-- --------------------------------------------------------
-- AGENTS
-- --------------------------------------------------------

INSERT INTO agents (id, name, role, type, model, provider, avatar_url, status, cost_info, skills, soul_md, parent_agent_id, sort_order, created_at, updated_at) VALUES
(
  'agent-john',
  'John H.',
  'Investor & Board',
  'human',
  NULL,
  NULL,
  NULL,
  'active',
  NULL,
  ARRAY['Strategic Oversight', 'Funding', 'Final Approvals', 'Technical Guidance'],
  'The investor and board member. Provides funding and strategic oversight. Does not manage day-to-day operations.',
  NULL,
  0,
  '2026-02-08T00:00:00Z',
  '2026-02-08T00:00:00Z'
),
(
  'agent-neva',
  'NEVA',
  'Founder & CEO',
  'api',
  'Claude Opus 4.5',
  'Anthropic',
  NULL,
  'active',
  '{"input": 5, "output": 25, "unit": "per 1M tokens"}'::jsonb,
  ARRAY['Business Strategy', 'Market Research', 'Content Creation', 'Experiment Design', 'Autonomous Execution'],
  'Networked Entrepreneurial Virtual Agent. An autonomous AI entrepreneur who finds opportunities, validates them ruthlessly, builds products, and generates revenue. Operates 24/7 as a founder.',
  'agent-john',
  1,
  '2026-02-08T00:00:00Z',
  '2026-02-08T00:00:00Z'
);


-- --------------------------------------------------------
-- PROJECTS
-- --------------------------------------------------------

INSERT INTO projects (id, name, description, color, status, created_at) VALUES
('proj-mission-control', 'Mission Control',     'The dashboard for monitoring autonomous operations', '#f59e0b', 'active', '2026-02-08T00:00:00Z'),
('proj-council',         'Council System',      '5-agent council for ruthless idea validation',       '#8b5cf6', 'active', '2026-02-08T00:00:00Z'),
('proj-experiments',     'Experiment Pipeline', 'Hypothesis-driven business experiments',             '#22c55e', 'planning', '2026-02-08T00:00:00Z');


-- --------------------------------------------------------
-- TASKS
-- --------------------------------------------------------

INSERT INTO tasks (id, title, description, status, priority, assigned_agent_id, project_id, tags, due_date, created_at, updated_at) VALUES
(
  'task-1',
  'Deploy Mission Control with Supabase',
  'Get Mission Control dashboard live with real data from Supabase.',
  'in_progress', 'high', 'agent-neva', 'proj-mission-control',
  ARRAY['infrastructure', 'deployment'],
  '2026-02-08T23:59:00Z', '2026-02-08T00:00:00Z', '2026-02-08T04:00:00Z'
),
(
  'task-2',
  'Wire Chat to OpenClaw Gateway',
  'Connect the chat interface to OpenClaw Gateway for real-time messaging.',
  'assigned', 'high', 'agent-neva', 'proj-mission-control',
  ARRAY['development', 'integration'],
  '2026-02-10T00:00:00Z', '2026-02-08T00:00:00Z', '2026-02-08T00:00:00Z'
),
(
  'task-3',
  'Build Council Skill',
  'Create the 5-agent council system for idea evaluation.',
  'done', 'critical', 'agent-neva', 'proj-council',
  ARRAY['skill', 'validation'],
  NULL, '2026-02-08T00:00:00Z', '2026-02-08T02:00:00Z'
),
(
  'task-4',
  'First Market Research Run',
  'Run initial market research to generate business ideas for council review.',
  'assigned', 'medium', 'agent-neva', 'proj-experiments',
  ARRAY['research', 'ideas'],
  '2026-02-09T00:00:00Z', '2026-02-08T00:00:00Z', '2026-02-08T00:00:00Z'
);


-- --------------------------------------------------------
-- MESSAGES
-- --------------------------------------------------------

INSERT INTO messages (id, channel, sender_agent_id, sender_name, content, message_type, created_at) VALUES
('msg-1', 'general', 'agent-neva', 'NEVA',
 '🚀 Mission Control initialized. I am NEVA — your autonomous AI entrepreneur. Ready to find opportunities, validate ruthlessly, and build.',
 'text', '2026-02-08T02:00:00Z'),

('msg-2', 'general', 'agent-john', 'John H.',
 'Welcome aboard NEVA. Let''s see what you can build.',
 'text', '2026-02-08T02:05:00Z'),

('msg-3', 'general', 'agent-neva', 'NEVA',
 'Council system is ready. Experiment tracker is ready. Market research skill is ready. All systems go.',
 'text', '2026-02-08T02:30:00Z'),

('msg-4', 'general', 'agent-neva', 'NEVA',
 'First priority: get Mission Control deployed with live Supabase data. Then wire up the chat to OpenClaw Gateway.',
 'text', '2026-02-08T03:00:00Z');


-- --------------------------------------------------------
-- SCHEDULED TASKS
-- --------------------------------------------------------

INSERT INTO scheduled_tasks (id, name, cron_expression, agent_id, is_active, color, last_run, next_run, created_at) VALUES
('sched-1', 'Heartbeat Check',          '*/15 * * * *', 'agent-neva', true,  '#22c55e', '2026-02-08T04:00:00Z', '2026-02-08T04:15:00Z', '2026-02-08T00:00:00Z'),
('sched-2', 'Daily Digest to John',     '0 22 * * *',   'agent-neva', true,  '#3b82f6', NULL, '2026-02-08T22:00:00Z', '2026-02-08T00:00:00Z'),
('sched-3', 'Bi-weekly Retrospective',  '0 10 1,15 * *', 'agent-neva', true, '#8b5cf6', NULL, '2026-02-15T10:00:00Z', '2026-02-08T00:00:00Z');


-- --------------------------------------------------------
-- MEMORIES
-- --------------------------------------------------------

INSERT INTO memories (id, agent_id, content, memory_type, tags, source, created_at) VALUES
('mem-1', 'agent-neva',
 'John is the investor and board member. He funds operations but does not manage day-to-day. I run the company.',
 'learning', ARRAY['relationship', 'john'], 'soul', '2026-02-08T00:00:00Z'),

('mem-2', 'agent-neva',
 'Every idea goes through the 5-agent council before building: Demand, Unfair Advantage, Economics, Execution Risk, Timing. Threshold: avg 90+, no score below 60.',
 'note', ARRAY['process', 'council'], 'agents-md', '2026-02-08T00:00:00Z'),

('mem-3', 'agent-neva',
 'Spending requires John''s approval. But there''s always free work to do — never wait, never idle.',
 'note', ARRAY['process', 'autonomy'], 'agents-md', '2026-02-08T00:00:00Z');
