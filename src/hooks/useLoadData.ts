'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';

export function useLoadData() {
  const {
    setAgents,
    setTasks,
    setProjects,
    setMessages,
    setScheduledTasks,
    setMemories,
    setDocuments,
    setLoading,
  } = useStore();

  useEffect(() => {
    async function loadAll() {
      try {
        const [
          { data: agents },
          { data: tasks },
          { data: projects },
          { data: messages },
          { data: scheduledTasks },
          { data: memories },
          { data: documents },
        ] = await Promise.all([
          supabase.from('agents').select('*').order('sort_order'),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at'),
          supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('scheduled_tasks').select('*').order('next_run'),
          supabase.from('memories').select('*').order('created_at', { ascending: false }),
          supabase.from('documents').select('*').order('updated_at', { ascending: false }),
        ]);

        if (agents) setAgents(agents);
        if (tasks) setTasks(tasks);
        if (projects) setProjects(projects);
        if (messages) setMessages(messages);
        if (scheduledTasks) setScheduledTasks(scheduledTasks);
        if (memories) setMemories(memories);
        if (documents) setDocuments(documents);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [setAgents, setTasks, setProjects, setMessages, setScheduledTasks, setMemories, setDocuments, setLoading]);
}
