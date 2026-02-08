'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Clock, 
  Play, 
  Pause,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  lastStatus: 'success' | 'failed' | 'running' | null;
  description?: string;
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCronJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setJobs([]);
      } else {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch cron jobs:', err);
      setError('Failed to connect to gateway');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCronJobs();
  }, [fetchCronJobs]);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: CronJob['lastStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-accent-red" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-accent-blue animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-text-muted" />;
    }
  };

  const enabledJobs = jobs.filter(j => j.enabled);
  const disabledJobs = jobs.filter(j => !j.enabled);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Clock className="w-5 h-5 text-accent-blue" />
            Cron Jobs
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Scheduled tasks and automation
          </p>
        </div>
        <button
          onClick={fetchCronJobs}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Total Jobs</span>
              <Calendar className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Active</span>
              <Play className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-accent-green">{enabledJobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Paused</span>
              <Pause className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-2xl font-bold text-text-muted">{disabledJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-accent-red/30 bg-accent-red/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-red">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Loading cron jobs...
        </div>
      ) : jobs.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-sm text-text-tertiary">No cron jobs configured</p>
            <p className="text-xs text-text-muted mt-1">
              Add cron jobs in your OpenClaw configuration
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Schedule</th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Last Run</th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Next Run</th>
                  <th className="text-left text-xs font-medium text-text-tertiary px-4 py-3">Last Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border/50 hover:bg-bg-hover/50">
                    <td className="px-4 py-3">
                      {job.enabled ? (
                        <Badge variant="green" size="sm">Active</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Paused</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-text-primary">{job.name}</span>
                        {job.description && (
                          <p className="text-xs text-text-muted mt-0.5">{job.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-bg-tertiary px-2 py-1 rounded text-accent-blue">
                        {job.schedule}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {formatTime(job.lastRun)}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {formatTime(job.nextRun)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.lastStatus)}
                        <span className="text-xs text-text-secondary capitalize">
                          {job.lastStatus || 'Never run'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
