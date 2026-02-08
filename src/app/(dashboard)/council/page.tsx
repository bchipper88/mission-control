'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  Play,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// The 5 Council Agents
const COUNCIL_AGENTS = [
  {
    id: 'demand',
    name: 'Demand Agent',
    role: 'Market Validation',
    icon: TrendingUp,
    color: '#22c55e',
    description: 'Evidence of real demand: search volume, complaints, competitor revenue',
    questions: ['Is there proven demand?', 'Are people actively searching for this?', 'Are competitors making money?'],
  },
  {
    id: 'unfair-advantage',
    name: 'Unfair Advantage Agent',
    role: 'AI Founder Fit',
    icon: Zap,
    color: '#8b5cf6',
    description: 'Why an AI solo founder wins here vs. humans or teams',
    questions: ['Is this AI-native?', 'Does 24/7 operation matter?', 'Can AI iterate faster than humans?'],
  },
  {
    id: 'economics',
    name: 'Economics Agent',
    role: 'Path to Revenue',
    icon: DollarSign,
    color: '#f59e0b',
    description: 'Path to $1K MRR in 90 days with <$500 invested',
    questions: ['Clear pricing model?', 'Low CAC channels available?', 'Unit economics work at small scale?'],
  },
  {
    id: 'execution-risk',
    name: 'Execution Risk Agent',
    role: 'Build Feasibility',
    icon: AlertTriangle,
    color: '#ef4444',
    description: 'Can MVP ship in 2 weeks? What are the blockers?',
    questions: ['Is MVP truly minimal?', 'Any hard dependencies?', 'Technical complexity manageable?'],
  },
  {
    id: 'timing',
    name: 'Timing Agent',
    role: 'Market Timing',
    icon: Clock,
    color: '#3b82f6',
    description: 'Is NOW the right moment? Trends, competition, readiness',
    questions: ['Why now vs. 6 months ago?', 'Is the market ready?', 'Competition window open?'],
  },
];

interface EvaluationScore {
  agentId: string;
  score: number;
  reasoning: string;
}

interface Evaluation {
  id: string;
  idea: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  scores: EvaluationScore[];
  averageScore: number;
  createdAt: string;
}

// Sample evaluations (in production, these would come from Supabase)
const SAMPLE_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    idea: 'AI Content Repurposer - Transform one piece of content into platform-specific versions',
    status: 'pending',
    scores: [],
    averageScore: 0,
    createdAt: new Date().toISOString(),
  },
];

export default function CouncilPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(SAMPLE_EVALUATIONS);
  const [selectedEval, setSelectedEval] = useState<string | null>(null);
  const [newIdea, setNewIdea] = useState('');
  const [showNewEval, setShowNewEval] = useState(false);

  const selectedEvaluation = selectedEval ? evaluations.find(e => e.id === selectedEval) : null;

  const getStatusBadge = (status: Evaluation['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="yellow" size="sm">Pending</Badge>;
      case 'in_progress': return <Badge variant="blue" size="sm">In Progress</Badge>;
      case 'completed': return <Badge variant="default" size="sm">Completed</Badge>;
      case 'approved': return <Badge variant="green" size="sm">✓ Approved</Badge>;
      case 'rejected': return <Badge variant="red" size="sm">✗ Rejected</Badge>;
    }
  };

  const handleSubmitIdea = () => {
    if (!newIdea.trim()) return;
    const newEval: Evaluation = {
      id: 'eval-' + Date.now(),
      idea: newIdea.trim(),
      status: 'pending',
      scores: [],
      averageScore: 0,
      createdAt: new Date().toISOString(),
    };
    setEvaluations(prev => [newEval, ...prev]);
    setNewIdea('');
    setShowNewEval(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Users className="w-5 h-5 text-accent-purple" />
            Council
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            5-agent deliberation system for ruthless idea validation
          </p>
        </div>
        <button
          onClick={() => setShowNewEval(true)}
          className="px-4 py-2 bg-accent-purple text-white text-sm font-medium rounded-lg hover:bg-accent-purple/90 transition-colors flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          New Evaluation
        </button>
      </div>

      {/* Council Agents Overview */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {COUNCIL_AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card key={agent.id} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: agent.color }}
              />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: agent.color }} />
                  </div>
                  <div className="text-xs font-semibold text-text-primary truncate">
                    {agent.name.replace(' Agent', '')}
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary line-clamp-2">
                  {agent.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Threshold Info */}
      <Card className="mb-6 bg-bg-secondary/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                <span className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Approval:</strong> Average 90+
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-accent-red" />
                <span className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Auto-reject:</strong> Any score below 60
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-purple" />
                <span className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Consensus:</strong> 3+ agents at 90+
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <div className="grid grid-cols-3 gap-6">
        {/* Evaluations Sidebar */}
        <div className="col-span-1">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Evaluations
          </h2>
          <div className="space-y-2">
            {evaluations.map((eval_) => (
              <Card 
                key={eval_.id}
                className={`cursor-pointer transition-all ${
                  selectedEval === eval_.id 
                    ? 'ring-2 ring-accent-purple bg-accent-purple/10' 
                    : 'hover:bg-bg-secondary/60'
                }`}
                onClick={() => setSelectedEval(eval_.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {getStatusBadge(eval_.status)}
                    {eval_.averageScore > 0 && (
                      <span className={`text-sm font-bold ${
                        eval_.averageScore >= 90 ? 'text-accent-green' : 
                        eval_.averageScore >= 70 ? 'text-accent-yellow' : 'text-accent-red'
                      }`}>
                        {eval_.averageScore}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary line-clamp-2">{eval_.idea}</p>
                  <p className="text-[10px] text-text-tertiary mt-2">
                    {new Date(eval_.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Evaluation Detail */}
        <div className="col-span-2">
          {selectedEvaluation ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {selectedEvaluation.idea}
                    </h3>
                    {getStatusBadge(selectedEvaluation.status)}
                  </div>
                  {selectedEvaluation.status === 'pending' && (
                    <button className="px-4 py-2 bg-accent-purple text-white text-sm font-medium rounded-lg hover:bg-accent-purple/90 transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Run Council
                    </button>
                  )}
                </div>

                {selectedEvaluation.scores.length > 0 ? (
                  <div className="space-y-4">
                    {COUNCIL_AGENTS.map((agent) => {
                      const score = selectedEvaluation.scores.find(s => s.agentId === agent.id);
                      const Icon = agent.icon;
                      return (
                        <div key={agent.id} className="flex items-start gap-4 p-4 bg-bg-secondary/50 rounded-lg">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: agent.color + '20' }}
                          >
                            <Icon className="w-5 h-5" style={{ color: agent.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-text-primary">{agent.name}</span>
                              {score ? (
                                <span className={`text-lg font-bold ${
                                  score.score >= 90 ? 'text-accent-green' : 
                                  score.score >= 70 ? 'text-accent-yellow' : 
                                  score.score >= 60 ? 'text-text-secondary' : 'text-accent-red'
                                }`}>
                                  {score.score}
                                </span>
                              ) : (
                                <span className="text-text-tertiary">—</span>
                              )}
                            </div>
                            <p className="text-sm text-text-tertiary">
                              {score?.reasoning || 'Awaiting evaluation...'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-text-tertiary">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Council hasn't evaluated this idea yet.</p>
                    <p className="text-xs mt-1">Click "Run Council" to start the evaluation.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12 text-text-tertiary">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select an evaluation to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Evaluation Modal */}
      {showNewEval && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNewEval(false)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">New Council Evaluation</h3>
              <textarea
                value={newIdea}
                onChange={e => setNewIdea(e.target.value)}
                placeholder="Describe your business idea..."
                className="w-full h-32 px-4 py-3 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNewEval(false)}
                  className="px-4 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitIdea}
                  disabled={!newIdea.trim()}
                  className="px-4 py-2 bg-accent-purple text-white text-sm font-medium rounded-lg hover:bg-accent-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Evaluation
                </button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
