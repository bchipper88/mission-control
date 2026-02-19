-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/heetkfaggxclbwfrmhln/sql

CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
  assigned_to text NOT NULL DEFAULT 'John',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (internal tool)
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx ON tasks(assigned_to);
