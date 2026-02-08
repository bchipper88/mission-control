'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// The 5 Council Agents
const COUNCIL_AGENTS = [
  {
    id: 'demand',
    name: 'Demand',
    role: 'Market Validation',
    icon: TrendingUp,
    color: '#22c55e',
  },
  {
    id: 'unfair-advantage',
    name: 'Advantage',
    role: 'AI Founder Fit',
    icon: Zap,
    color: '#8b5cf6',
  },
  {
    id: 'economics',
    name: 'Economics',
    role: 'Path to Revenue',
    icon: DollarSign,
    color: '#f59e0b',
  },
  {
    id: 'execution',
    name: 'Execution',
    role: 'Build Feasibility',
    icon: AlertTriangle,
    color: '#ef4444',
  },
  {
    id: 'timing',
    name: 'Timing',
    role: 'Market Timing',
    icon: Clock,
    color: '#3b82f6',
  },
];

interface Idea {
  id: string;
  filename: string;
  title: string;
  status: string;
  content: string;
  score?: number;
  councilStatus?: 'pending' | 'completed' | 'approved' | 'rejected';
  createdAt: string;
}

// Fallback data when API can't reach gateway filesystem
const FALLBACK_IDEAS: Idea[] = [
  {
    id: '001-ai-content-repurposer',
    filename: '001-ai-content-repurposer.md',
    title: 'AI Content Repurposer',
    status: 'PENDING_RESEARCH',
    content: '# Idea: AI Content Repurposer\n\nTool that takes one piece of content (blog post, video transcript, podcast) and automatically generates platform-specific versions: Twitter thread, LinkedIn post, Instagram caption, YouTube description, newsletter excerpt.\n\n**Preliminary Score:** 65/100 — Crowded market, needs differentiation.',
    score: 65,
    councilStatus: 'pending',
    createdAt: '2026-02-08T00:00:00Z',
  },
  {
    id: '002-competitor-intel-alerts',
    filename: '002-competitor-intel-alerts.md',
    title: 'Competitor Intel Alerts',
    status: 'PENDING_RESEARCH',
    content: '# Idea: Competitor Intel Alerts\n\nAutomated monitoring of competitor websites, pricing pages, and social media. Daily/weekly digest of changes: new features, pricing changes, new hires, marketing campaigns.\n\n**Target:** SMB founders tracking 3-5 direct competitors at $29-79/mo.',
    councilStatus: 'pending',
    createdAt: '2026-02-08T00:00:00Z',
  },
  {
    id: '003-review-response-bot',
    filename: '003-review-response-bot.md',
    title: 'Review Response Bot for Shopify',
    status: 'RESEARCHED',
    content: '# Idea: Review Response Bot\n\nAI that monitors and drafts responses to customer reviews. Learns brand voice. Human approves before posting.\n\n**Research Finding:** Market crowded, Reputon at $6.99/mo is strong incumbent. Response is secondary to collection.\n\n**Preliminary Score:** 75/100 — CONDITIONAL',
    score: 75,
    councilStatus: 'pending',
    createdAt: '2026-02-08T00:00:00Z',
  },
  {
    id: '004-chargeback-shield',
    filename: '004-chargeback-shield.md',
    title: 'Chargeback Shield — AI Fraud Prevention for Shopify',
    status: 'COUNCIL_COMPLETE',
    content: '# Idea: Chargeback Shield\n\nAI-powered fraud scoring that stops bad orders BEFORE fulfillment.\n\n**Problem:** Chargebacks destroying Shopify merchant profits. Current solutions are REACTIVE, not PROACTIVE.\n\n**Gap:** Enterprise tools $500+/mo, SMB gap at $49-99/mo flat rate.\n\n**Timing:** Shopify Fraud Filter deprecated Jan 31, 2025 — merchants actively searching NOW.\n\n**Council Result:** CONDITIONAL (84.4 avg)\n- Demand: 88 | Advantage: 72 | Economics: 88 | Execution: 80 | Timing: 94\n\n**Recommendation:** Pivot to "Fraud Advisor" (advisory, not blocking) to address cold-start problem.',
    score: 84.4,
    councilStatus: 'completed',
    createdAt: '2026-02-08T00:00:00Z',
  },
];

const FALLBACK_TRANSCRIPTS: CouncilTranscript[] = [
  {
    id: 'council-001-chargeback-shield',
    filename: 'council-001-chargeback-shield.md',
    ideaName: 'Chargeback Shield',
    averageScore: 84.4,
    verdict: 'CONDITIONAL',
    content: '# Council Evaluation: Chargeback Shield\n\n**Average Score: 84.4**\n**Verdict: CONDITIONAL**\n\n## Key Findings\n- Timing is PERFECT (94) — Fraud Filter deprecated Jan 31, 2025\n- Economics work (88) — 83% margin, LTV:CAC 12:1\n- Cold-start problem flagged by 4/5 agents\n- Trust barrier for high-stakes fraud decisions\n\n## Recommendation\nPivot to "Fraud Advisor" — advisory, not blocking. Lower stakes = faster adoption. Graduate to blocking once trust earned.',
    createdAt: '2026-02-08T00:00:00Z',
    scores: [
      { agent: 'Demand', score: 88, verdict: 'CONDITIONAL' },
      { agent: 'Unfair Advantage', score: 72, verdict: 'CONDITIONAL' },
      { agent: 'Economics', score: 88, verdict: 'CONDITIONAL' },
      { agent: 'Execution', score: 80, verdict: 'CONDITIONAL' },
      { agent: 'Timing', score: 94, verdict: 'PASS' },
    ],
  },
];

interface CouncilTranscript {
  id: string;
  filename: string;
  ideaName: string;
  averageScore: number;
  verdict: string;
  content: string;
  createdAt: string;
  scores: { agent: string; score: number; verdict: string }[];
}

export default function CouncilPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [transcripts, setTranscripts] = useState<CouncilTranscript[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<CouncilTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'ideas' | 'transcripts'>('ideas');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      // Use fallback data if API returns empty (gateway filesystem not accessible)
      const fetchedIdeas = data.ideas && data.ideas.length > 0 ? data.ideas : FALLBACK_IDEAS;
      const fetchedTranscripts = data.transcripts && data.transcripts.length > 0 ? data.transcripts : FALLBACK_TRANSCRIPTS;
      setIdeas(fetchedIdeas);
      setTranscripts(fetchedTranscripts);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
      // Use fallback data on error
      setIdeas(FALLBACK_IDEAS);
      setTranscripts(FALLBACK_TRANSCRIPTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-accent-green';
    if (score >= 75) return 'text-accent-yellow';
    if (score >= 60) return 'text-text-secondary';
    return 'text-accent-red';
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending': return <Badge variant="yellow" size="sm">Pending Council</Badge>;
      case 'completed': return <Badge variant="blue" size="sm">Conditional</Badge>;
      case 'approved': return <Badge variant="green" size="sm">✓ Approved</Badge>;
      case 'rejected': return <Badge variant="red" size="sm">✗ Rejected</Badge>;
      default: return <Badge variant="default" size="sm">{status || 'Draft'}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Users className="w-5 h-5 text-accent-purple" />
            Council
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            5-agent deliberation system for ruthless idea validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('ideas')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              view === 'ideas' 
                ? 'bg-accent-purple text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-1" />
            Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setView('transcripts')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              view === 'transcripts' 
                ? 'bg-accent-purple text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Transcripts ({transcripts.length})
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Council Agents Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
        {COUNCIL_AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card key={agent.id} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: agent.color }}
              />
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: agent.color + '20' }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: agent.color }} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text-primary">
                      {agent.name}
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      {agent.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Threshold Info */}
      <Card className="mb-6 bg-bg-secondary/50">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
              <span className="text-text-secondary">
                <strong className="text-text-primary">Pass:</strong> Avg 90+
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-accent-red" />
              <span className="text-text-secondary">
                <strong className="text-text-primary">Fail:</strong> Any &lt;60
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-text-secondary">
                <strong className="text-text-primary">Consensus:</strong> 3+ at 90+
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Loading ideas and transcripts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-text-primary mb-3">
              {view === 'ideas' ? 'Business Ideas' : 'Council Transcripts'}
            </h2>
            
            {view === 'ideas' ? (
              ideas.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No ideas found in knowledge/ideas/
                </div>
              ) : (
                ideas.map((idea) => (
                  <Card 
                    key={idea.id}
                    className={`cursor-pointer transition-all ${
                      selectedIdea?.id === idea.id 
                        ? 'ring-2 ring-accent-purple bg-accent-purple/10' 
                        : 'hover:bg-bg-secondary/60'
                    }`}
                    onClick={() => { setSelectedIdea(idea); setSelectedTranscript(null); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {getStatusBadge(idea.councilStatus)}
                        {idea.score !== undefined && idea.score > 0 && (
                          <span className={`text-sm font-bold ${getScoreColor(idea.score)}`}>
                            {idea.score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-primary line-clamp-2">{idea.title}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">{idea.filename}</p>
                    </CardContent>
                  </Card>
                ))
              )
            ) : (
              transcripts.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  No council transcripts found
                </div>
              ) : (
                transcripts.map((transcript) => (
                  <Card 
                    key={transcript.id}
                    className={`cursor-pointer transition-all ${
                      selectedTranscript?.id === transcript.id 
                        ? 'ring-2 ring-accent-purple bg-accent-purple/10' 
                        : 'hover:bg-bg-secondary/60'
                    }`}
                    onClick={() => { setSelectedTranscript(transcript); setSelectedIdea(null); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge 
                          variant={
                            transcript.verdict.toLowerCase() === 'approved' ? 'green' :
                            transcript.verdict.toLowerCase() === 'rejected' ? 'red' :
                            'yellow'
                          }
                          size="sm"
                        >
                          {transcript.verdict}
                        </Badge>
                        <span className={`text-sm font-bold ${getScoreColor(transcript.averageScore)}`}>
                          {transcript.averageScore.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary line-clamp-2">{transcript.ideaName}</p>
                      <div className="flex gap-1 mt-2">
                        {transcript.scores.map((s, i) => (
                          <div 
                            key={i}
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              s.score >= 90 ? 'bg-accent-green/20 text-accent-green' :
                              s.score >= 75 ? 'bg-accent-yellow/20 text-accent-yellow' :
                              'bg-bg-secondary text-text-muted'
                            }`}
                          >
                            {s.score}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )
            )}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedIdea ? (
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {selectedIdea.title}
                      </h3>
                      {getStatusBadge(selectedIdea.councilStatus)}
                    </div>
                    {selectedIdea.score !== undefined && selectedIdea.score > 0 && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(selectedIdea.score)}`}>
                          {selectedIdea.score.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-text-muted">Council Score</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
                    <ReactMarkdown>{selectedIdea.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : selectedTranscript ? (
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {selectedTranscript.ideaName}
                      </h3>
                      <Badge 
                        variant={
                          selectedTranscript.verdict.toLowerCase() === 'approved' ? 'green' :
                          selectedTranscript.verdict.toLowerCase() === 'rejected' ? 'red' :
                          'yellow'
                        }
                      >
                        {selectedTranscript.verdict}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(selectedTranscript.averageScore)}`}>
                        {selectedTranscript.averageScore.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-text-muted">Average Score</div>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {selectedTranscript.scores.map((score, i) => (
                      <div key={i} className="text-center p-2 bg-bg-secondary rounded-lg">
                        <div className={`text-lg font-bold ${getScoreColor(score.score)}`}>
                          {score.score}
                        </div>
                        <div className="text-[10px] text-text-muted truncate">{score.agent}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
                    <ReactMarkdown>{selectedTranscript.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-text-tertiary">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select an idea or transcript to view details</p>
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
