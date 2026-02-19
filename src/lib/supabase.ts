import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our tables
export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  assigned_to: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface Agent {
  id: string
  name: string
  role: string
  domain: string
  emoji: string
  status: 'idle' | 'working' | 'blocked' | 'complete'
  current_task: string | null
  last_active: string
  responsibilities: string[]
}
