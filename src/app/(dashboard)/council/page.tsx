'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { Badge } from '@/components/ui/Badge';
import { Users, MessageSquare, Play, Plus, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const DEFAULT_TOPIC =
  'Should we prioritize the Mac Studio cluster setup or the newsletter automation pipeline?';

const ACTION_ITEMS = [
  'Draft infrastructure cost comparison document',
  'Schedule follow-up session for final vote',
  'Assign newsletter audit to available agent',
];

type VoteType = 'for' | 'against' | 'neutral';

interface VoteCounts {
  up: number;
  down: number;
  neutral: number;
}

export default function CouncilPage() {
  const { agents, messages } = useStore();

  // Council messages from the "council" channel, sorted chronologically
  const councilMessages = messages
    .filter((m) => m.channel === 'council')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Derive topic from the first council message or use default
  const sessionTopic =
    councilMessages.length > 0 && councilMessages[0].content.includes('Topic:')
      ? councilMessages[0].content.split('Topic:')[1]?.trim() ?? DEFAULT_TOPIC
      : DEFAULT_TOPIC;

  // Participating agents (those who sent council messages)
  const participantIds = Array.from(new Set(councilMessages.map((m) => m.sender_agent_id).filter(Boolean)));
  const participants = agents.filter((a) => participantIds.includes(a.id));

  // Session status
  const [sessionStatus, setSessionStatus] = useState<'In Progress' | 'Completed'>('In Progress');

  // Per-message vote counts keyed by message id
  const [votes, setVotes] = useState<Record<string, VoteCounts>>(() => {
    const initial: Record<string, VoteCounts> = {};
    councilMessages.forEach((m) => {
      initial[m.id] = { up: 0, down: 0, neutral: 0 };
    });
    return initial;
  });

  // Per-agent position for voting summary
  const [agentPositions, setAgentPositions] = useState<Record<string, VoteType>>(() => {
    const initial: Record<string, VoteType> = {};
    participants.forEach((a) => {
      initial[a.id] = 'neutral';
    });
    return initial;
  });

  // New session modal
  const [showNewSession, setShowNewSession] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  // Resolve an agent by id
  const getAgent = (agentId?: string | null) =>
    agentId ? agents.find((a) => a.id === agentId) : undefined;

  // Handle vote on a message
  const handleVote = (messageId: string, type: 'up' | 'down' | 'neutral') => {
    setVotes((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [type]: (prev[messageId]?.[type] ?? 0) + 1,
      },
    }));
  };

  // Toggle agent selection in new session modal
  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  // Cycle agent position in the voting summary
  const cyclePosition = (agentId: string) => {
    setAgentPositions((prev) => {
      const current = prev[agentId] ?? 'neutral';
      const order: VoteType[] = ['neutral', 'for', 'against'];
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...prev, [agentId]: next };
    });
  };

  // Compute consensus
  const positionCounts = Object.values(agentPositions);
  const forCount = positionCounts.filter((p) => p === 'for').length;
  const againstCount = positionCounts.filter((p) => p === 'against').length;
  const neutralCount = positionCounts.filter((p) => p === 'neutral').length;

  let consensusLabel = 'No Consensus';
  let consensusVariant: 'yellow' | 'green' | 'red' = 'yellow';
  if (forCount > againstCount && forCount > neutralCount) {
    consensusLabel = 'Leaning For';
    consensusVariant = 'green';
  } else if (againstCount > forCount && againstCount > neutralCount) {
    consensusLabel = 'Leaning Against';
    consensusVariant = 'red';
  }

  const positionBadgeVariant: Record<VoteType, 'green' | 'red' | 'yellow'> = {
    for: 'green',
    against: 'red',
    neutral: 'yellow',
  };

  const positionLabels: Record<VoteType, string> = {
    for: 'For',
    against: 'Against',
    neutral: 'Neutral',
  };

  // Format timestamp
  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStartSession = () => {
    if (!newTopic.trim() || selectedAgentIds.size === 0) return;
    // Reset state for the "new session" UX
    setSessionStatus('In Progress');
    setNewTopic('');
    setSelectedAgentIds(new Set());
    setShowNewSession(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* -------- Header -------- */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Users className="w-6 h-6 text-accent-purple" />
            Council
          </h1>
          <p className="text-sm text-text-tertiary mt-0.5">Multi-Agent Deliberation</p>
        </div>
        <button
          onClick={() => setShowNewSession(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-accent-purple rounded-lg hover:bg-accent-purple/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* -------- Main Content -------- */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* -------- Left: Session + Discussion Thread -------- */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Active Council Session */}
          <div className="px-6 pt-5 pb-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-accent-cyan shrink-0" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Active Session
                      </span>
                      <Badge
                        variant={sessionStatus === 'In Progress' ? 'blue' : 'green'}
                        size="sm"
                      >
                        {sessionStatus}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-text-primary leading-relaxed">
                      {sessionTopic}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setSessionStatus((s) =>
                        s === 'In Progress' ? 'Completed' : 'In Progress'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {sessionStatus === 'In Progress' ? 'End Session' : 'Reopen'}
                  </button>
                </div>

                {/* Participants row */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                  <span className="text-xs text-text-tertiary font-medium">Participants:</span>
                  <div className="flex items-center -space-x-2">
                    {participants.map((agent) => (
                      <div
                        key={agent.id}
                        className="ring-2 ring-bg-card rounded-full"
                        title={agent.name}
                      >
                        <AgentAvatar agent={agent} size="sm" showStatus={false} />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {participants.length} agent{participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discussion Thread */}
          <div className="px-6 pb-6">
            <h2 className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussion Thread
            </h2>

            {councilMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                <Users className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">No council messages yet.</p>
                <p className="text-xs mt-1">Start a new session to begin deliberation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {councilMessages.map((msg) => {
                  const senderAgent = getAgent(msg.sender_agent_id);
                  const msgVotes = votes[msg.id] ?? { up: 0, down: 0, neutral: 0 };

                  return (
                    <Card key={msg.id}>
                      <CardContent>
                        <div className="flex items-start gap-4">
                          {/* Agent avatar */}
                          <div className="shrink-0 mt-0.5">
                            {senderAgent ? (
                              <AgentAvatar agent={senderAgent} size="lg" showStatus />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center text-base font-bold text-text-secondary">
                                {(msg.sender_name ?? '?')[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Message body */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-sm font-semibold text-text-primary">
                                {msg.sender_name ?? 'Unknown'}
                              </span>
                              {senderAgent && (
                                <span className="text-xs text-text-tertiary">
                                  {senderAgent.role}
                                </span>
                              )}
                              <span className="text-[10px] text-text-tertiary ml-auto shrink-0">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-text-primary leading-relaxed">
                              {msg.content}
                            </p>

                            {/* Voting buttons */}
                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
                              <button
                                onClick={() => handleVote(msg.id, 'up')}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-text-secondary hover:text-accent-green hover:bg-accent-green/10 transition-colors"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{msgVotes.up}</span>
                              </button>
                              <button
                                onClick={() => handleVote(msg.id, 'down')}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>{msgVotes.down}</span>
                              </button>
                              <button
                                onClick={() => handleVote(msg.id, 'neutral')}
                                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-text-secondary hover:text-accent-yellow hover:bg-accent-yellow/10 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                                <span>{msgVotes.neutral}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* -------- Right: Voting Summary Panel -------- */}
        <aside className="w-64 shrink-0 border-l border-border bg-bg-secondary overflow-y-auto">
          <div className="px-4 pt-5 pb-4">
            {/* Consensus Status */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
              Consensus Status
            </h3>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-primary">Overall</span>
                  <Badge variant={consensusVariant} size="md">
                    {consensusLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3 text-accent-green" />
                    {forCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3 text-accent-red" />
                    {againstCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Minus className="w-3 h-3 text-accent-yellow" />
                    {neutralCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Positions */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
              Agent Positions
            </h3>
            <div className="space-y-2">
              {participants.map((agent) => {
                const position = agentPositions[agent.id] ?? 'neutral';
                return (
                  <Card key={agent.id} hover onClick={() => cyclePosition(agent.id)}>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <AgentAvatar agent={agent} size="sm" showStatus={false} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">
                            {agent.name}
                          </p>
                        </div>
                        <Badge variant={positionBadgeVariant[position]} size="sm">
                          {positionLabels[position]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {participants.length === 0 && (
                <p className="text-xs text-text-tertiary text-center py-4">
                  No participants yet.
                </p>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="px-4 pb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
              Action Items
            </h3>
            <Card>
              <CardContent>
                <ul className="space-y-2">
                  {ACTION_ITEMS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent-purple shrink-0" />
                      <span className="text-xs text-text-secondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* -------- New Session Modal -------- */}
      {showNewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-border bg-bg-card shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-purple" />
                New Council Session
              </h2>
              <button
                onClick={() => setShowNewSession(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-4">
              {/* Topic */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Topic / Question
                </label>
                <textarea
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter the topic or question for deliberation..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple resize-none"
                />
              </div>

              {/* Select Agents */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">
                  Select Participating Agents
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {agents.map((agent) => {
                    const isSelected = selectedAgentIds.has(agent.id);
                    return (
                      <label
                        key={agent.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-accent-purple/10 border border-accent-purple/30'
                            : 'bg-bg-secondary border border-border hover:border-border-light'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAgentSelection(agent.id)}
                          className="rounded border-border text-accent-purple focus:ring-accent-purple bg-bg-tertiary"
                        />
                        <AgentAvatar agent={agent} size="sm" showStatus />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {agent.name}
                          </p>
                          <p className="text-[10px] text-text-tertiary truncate">{agent.role}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <span className="text-xs text-text-tertiary">
                {selectedAgentIds.size} agent{selectedAgentIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewSession(false)}
                  className="px-4 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg border border-border hover:border-border-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartSession}
                  disabled={!newTopic.trim() || selectedAgentIds.size === 0}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-accent-purple rounded-lg hover:bg-accent-purple/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
