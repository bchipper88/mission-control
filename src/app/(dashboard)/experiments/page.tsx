'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  FlaskConical,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  BarChart3,
  Target,
  Calendar
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: 'planned' | 'running' | 'completed' | 'failed';
  startDate: string | null;
  endDate: string | null;
  metrics: {
    name: string;
    target: number;
    current: number;
    unit: string;
  }[];
  notes: string;
  outcome?: 'success' | 'failure' | 'inconclusive';
}

// Fallback experiments
const FALLBACK_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Reddit Keyword Monitoring',
    hypothesis: 'Monitoring "Shopify fraud" and "chargeback" keywords will reveal 50+ complaints/week indicating market demand',
    status: 'running',
    startDate: '2026-02-08',
    endDate: null,
    metrics: [
      { name: 'Complaints Found', target: 50, current: 23, unit: 'per week' },
      { name: 'Direct Pain Points', target: 10, current: 7, unit: 'unique' },
    ],
    notes: 'Initial results promising. Most complaints about Shopify removing Fraud Filter.',
  },
  {
    id: 'exp-002',
    name: 'Landing Page MVP Test',
    hypothesis: 'A simple landing page for "Chargeback Shield" will generate 100 email signups in 2 weeks',
    status: 'planned',
    startDate: null,
    endDate: null,
    metrics: [
      { name: 'Email Signups', target: 100, current: 0, unit: 'total' },
      { name: 'Conversion Rate', target: 5, current: 0, unit: '%' },
    ],
    notes: 'Waiting for council approval before deployment.',
  },
  {
    id: 'exp-003',
    name: 'Competitor Pricing Research',
    hypothesis: 'SMB gap exists between $6.99 (Reputon) and $500+ (enterprise) for fraud prevention',
    status: 'completed',
    startDate: '2026-02-06',
    endDate: '2026-02-07',
    metrics: [
      { name: 'Competitors Analyzed', target: 10, current: 12, unit: 'total' },
      { name: 'Price Gap Confirmed', target: 1, current: 1, unit: 'yes/no' },
    ],
    notes: 'Confirmed: $29-99/mo sweet spot is unoccupied for Shopify-focused fraud prevention.',
    outcome: 'success',
  },
];

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/experiments');
      const data = await res.json();
      setExperiments(data.experiments?.length > 0 ? data.experiments : FALLBACK_EXPERIMENTS);
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
      setExperiments(FALLBACK_EXPERIMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const statuses = ['all', 'planned', 'running', 'completed', 'failed'];
  const filteredExperiments = filter === 'all' 
    ? experiments 
    : experiments.filter(e => e.status === filter);

  const runningCount = experiments.filter(e => e.status === 'running').length;
  const completedCount = experiments.filter(e => e.status === 'completed').length;
  const successRate = completedCount > 0 
    ? (experiments.filter(e => e.outcome === 'success').length / completedCount * 100).toFixed(0)
    : '—';

  const getStatusIcon = (status: Experiment['status']) => {
    switch (status) {
      case 'running': return <Play className="w-3 h-3 text-accent-blue" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-accent-green" />;
      case 'failed': return <XCircle className="w-3 h-3 text-accent-red" />;
      default: return <Pause className="w-3 h-3 text-text-muted" />;
    }
  };

  const getStatusBadge = (status: Experiment['status']) => {
    switch (status) {
      case 'running': return <Badge variant="blue" size="sm">Running</Badge>;
      case 'completed': return <Badge variant="green" size="sm">Completed</Badge>;
      case 'failed': return <Badge variant="red" size="sm">Failed</Badge>;
      default: return <Badge variant="default" size="sm">Planned</Badge>;
    }
  };

  const getOutcomeBadge = (outcome?: Experiment['outcome']) => {
    switch (outcome) {
      case 'success': return <Badge variant="green" size="sm">✓ Success</Badge>;
      case 'failure': return <Badge variant="red" size="sm">✗ Failure</Badge>;
      case 'inconclusive': return <Badge variant="yellow" size="sm">? Inconclusive</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <FlaskConical className="w-5 h-5 text-accent-purple" />
            Experiments
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Track hypotheses, tests, and validation experiments
          </p>
        </div>
        <button
          onClick={fetchExperiments}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Total</span>
              <FlaskConical className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{experiments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Running</span>
              <Play className="w-4 h-4 text-accent-blue" />
            </div>
            <p className="text-2xl font-bold text-accent-blue">{runningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-accent-green">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Success Rate</span>
              <BarChart3 className="w-4 h-4 text-accent-yellow" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              filter === status
                ? 'bg-accent-purple text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Experiments List */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Loading experiments...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {filteredExperiments.map(exp => (
              <Card
                key={exp.id}
                className={`cursor-pointer transition-all ${
                  selectedExperiment?.id === exp.id
                    ? 'ring-2 ring-accent-purple bg-accent-purple/10'
                    : 'hover:bg-bg-secondary/60'
                }`}
                onClick={() => setSelectedExperiment(exp)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getStatusBadge(exp.status)}
                    {getStatusIcon(exp.status)}
                  </div>
                  <p className="text-sm font-medium text-text-primary line-clamp-2">{exp.name}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-1">{exp.hypothesis}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selectedExperiment ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {selectedExperiment.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedExperiment.status)}
                        {getOutcomeBadge(selectedExperiment.outcome)}
                      </div>
                    </div>
                    <div className="text-right text-xs text-text-muted">
                      {selectedExperiment.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started {selectedExperiment.startDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-purple" />
                      Hypothesis
                    </h4>
                    <p className="text-sm text-text-secondary bg-bg-secondary p-3 rounded-lg">
                      {selectedExperiment.hypothesis}
                    </p>
                  </div>

                  {selectedExperiment.metrics.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-text-primary mb-3">Metrics</h4>
                      <div className="space-y-3">
                        {selectedExperiment.metrics.map((metric, i) => {
                          const progress = metric.target > 0 ? (metric.current / metric.target) * 100 : 0;
                          const isAhead = metric.current >= metric.target;
                          return (
                            <div key={i} className="bg-bg-secondary rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-text-primary">
                                  {metric.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${isAhead ? 'text-accent-green' : 'text-text-primary'}`}>
                                    {metric.current}
                                  </span>
                                  <span className="text-xs text-text-muted">
                                    / {metric.target} {metric.unit}
                                  </span>
                                  {isAhead ? (
                                    <TrendingUp className="w-4 h-4 text-accent-green" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-accent-yellow" />
                                  )}
                                </div>
                              </div>
                              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    progress >= 100 ? 'bg-accent-green' : 
                                    progress >= 50 ? 'bg-accent-yellow' : 'bg-accent-blue'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedExperiment.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary mb-2">Notes</h4>
                      <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
                        <ReactMarkdown>{selectedExperiment.notes}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-text-tertiary">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select an experiment to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
