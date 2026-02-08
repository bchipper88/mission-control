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
        // Load each table separately to handle missing tables gracefully
        const [agentsRes, tasksRes, projectsRes, messagesRes, scheduledRes, memoriesRes, docsRes] = 
          await Promise.allSettled([
            supabase.from('agents').select('*').order('sort_order'),
            supabase.from('tasks').select('*').order('created_at', { ascending: false }),
            supabase.from('projects').select('*').order('created_at'),
            supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('scheduled_tasks').select('*').order('next_run'),
            supabase.from('memories').select('*').order('created_at', { ascending: false }),
            supabase.from('documents').select('*').order('updated_at', { ascending: false }),
          ]);

        // Set data from successful queries
        if (agentsRes.status === 'fulfilled' && agentsRes.value.data) {
          setAgents(agentsRes.value.data);
        }
        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
          setTasks(tasksRes.value.data);
        }
        if (projectsRes.status === 'fulfilled' && projectsRes.value.data) {
          setProjects(projectsRes.value.data);
        }
        if (messagesRes.status === 'fulfilled' && messagesRes.value.data) {
          setMessages(messagesRes.value.data);
        }
        if (scheduledRes.status === 'fulfilled' && scheduledRes.value.data) {
          setScheduledTasks(scheduledRes.value.data);
        }
        if (memoriesRes.status === 'fulfilled' && memoriesRes.value.data) {
          setMemories(memoriesRes.value.data);
        }
        if (docsRes.status === 'fulfilled' && docsRes.value.data) {
          setDocuments(docsRes.value.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [setAgents, setTasks, setProjects, setMessages, setScheduledTasks, setMemories, setDocuments, setLoading]);
}
