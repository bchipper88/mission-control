-- ============================================================
-- Mission Control — Schema Migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- --------------------------------------------------------
-- 1. TABLES
-- --------------------------------------------------------

-- Agents: each AI agent or human in the organization
CREATE TABLE agents (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('human', 'api', 'local')),
  model       TEXT,
  provider    TEXT,
  avatar_url  TEXT,
  status      TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('active', 'idle', 'offline')),
  cost_info   JSONB,                          -- { "input": 5, "output": 25, "unit": "per 1M tokens" }
  skills      TEXT[] DEFAULT '{}',
  soul_md     TEXT,                            -- personality / system prompt
  parent_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366f1',
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('planning','inbox','assigned','in_progress','testing','review','done')),
  priority          TEXT NOT NULL DEFAULT 'medium'
                      CHECK (priority IN ('low','medium','high','critical')),
  assigned_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  project_id        TEXT REFERENCES projects(id) ON DELETE SET NULL,
  tags              TEXT[] DEFAULT '{}',
  due_date          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE messages (
  id              TEXT PRIMARY KEY,
  channel         TEXT NOT NULL,                -- 'general', 'council', or agent id for DMs
  sender_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  sender_name     TEXT,
  content         TEXT NOT NULL,
  message_type    TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'tool_result')),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Scheduled tasks (cron-style recurring jobs)
CREATE TABLE scheduled_tasks (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  agent_id        TEXT REFERENCES agents(id) ON DELETE SET NULL,
  task_template   JSONB,
  is_active       BOOLEAN DEFAULT true,
  color           TEXT,
  last_run        TIMESTAMPTZ,
  next_run        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Agent memory / knowledge entries
CREATE TABLE memories (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT REFERENCES agents(id) ON DELETE SET NULL,
  content     TEXT NOT NULL,
  memory_type TEXT DEFAULT 'note' CHECK (memory_type IN ('note', 'capture', 'decision', 'learning')),
  tags        TEXT[] DEFAULT '{}',
  source      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id          TEXT PRIMARY KEY DEFAULT 'doc-' || gen_random_uuid()::text,
  title       TEXT NOT NULL,
  content     TEXT,
  doc_type    TEXT DEFAULT 'note',
  project_id  TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_by  TEXT REFERENCES agents(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);


-- --------------------------------------------------------
-- 2. INDEXES
-- --------------------------------------------------------

CREATE INDEX idx_tasks_status           ON tasks(status);
CREATE INDEX idx_tasks_assigned_agent   ON tasks(assigned_agent_id);
CREATE INDEX idx_tasks_project          ON tasks(project_id);
CREATE INDEX idx_tasks_priority         ON tasks(priority);
CREATE INDEX idx_messages_channel       ON messages(channel);
CREATE INDEX idx_messages_created_at    ON messages(created_at);
CREATE INDEX idx_memories_agent         ON memories(agent_id);
CREATE INDEX idx_memories_type          ON memories(memory_type);
CREATE INDEX idx_scheduled_tasks_agent  ON scheduled_tasks(agent_id);
CREATE INDEX idx_documents_project      ON documents(project_id);
CREATE INDEX idx_agents_parent          ON agents(parent_agent_id);
CREATE INDEX idx_agents_status          ON agents(status);


-- --------------------------------------------------------
-- 3. UPDATED_AT TRIGGER
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- --------------------------------------------------------
-- 4. REALTIME — Enable for live subscriptions
-- --------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE memories;


-- --------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- --------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE agents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;

-- For now: allow full read/write for authenticated users
-- Tighten these as needed for production

CREATE POLICY "Allow authenticated read"  ON agents          FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON agents          FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON projects        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON projects        FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON tasks           FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON tasks           FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON messages        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON messages        FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON scheduled_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON scheduled_tasks FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON memories        FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON memories        FOR ALL    TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read"  ON documents       FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated write" ON documents       FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Also allow anon key access (for dev / dashboard without login)
CREATE POLICY "Allow anon read"  ON agents          FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON agents          FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON projects        FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON projects        FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON tasks           FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON tasks           FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON messages        FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON messages        FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON scheduled_tasks FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON scheduled_tasks FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON memories        FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON memories        FOR ALL    TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read"  ON documents       FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write" ON documents       FOR ALL    TO anon USING (true) WITH CHECK (true);
