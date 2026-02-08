'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { Badge } from '@/components/ui/Badge';
import { Send, Hash, MessageSquare, Plus } from 'lucide-react';

const CHANNELS = ['general', 'council'];

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today at ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) return `Yesterday at ${time}`;

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
}

/** Returns true if two ISO timestamps are within 5 minutes of each other. */
function isCloseInTime(a: string, b: string): boolean {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 5 * 60 * 1000;
}

export default function ChatPage() {
  const { agents, messages, activeChannel, setActiveChannel, addMessage } = useStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter messages for the active channel
  const channelMessages = messages
    .filter((m) => m.channel === activeChannel)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Auto-scroll to bottom when messages change or channel switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length, activeChannel]);

  // Focus input when channel changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChannel]);

  // Resolve an agent by id
  const getAgent = (agentId?: string | null) =>
    agentId ? agents.find((a) => a.id === agentId) : undefined;

  // Send a message
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({
      id: 'msg-' + Date.now(),
      channel: activeChannel,
      sender_agent_id: 'agent-john',
      sender_name: 'John H.',
      content: trimmed,
      message_type: 'text',
      created_at: new Date().toISOString(),
    });

    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine if a channel is a DM (agent id based)
  const isDMChannel = (channel: string) => channel.startsWith('agent-');

  return (
    <div className="flex h-full min-h-0">
      {/* -------- Sidebar -------- */}
      <aside className="flex flex-col w-48 shrink-0 bg-bg-secondary border-r border-border">
        {/* Channels section */}
        <div className="px-3 pt-4 pb-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            Channels
          </h3>
          <ul className="space-y-0.5">
            {CHANNELS.map((ch) => {
              const isActive = activeChannel === ch;
              return (
                <li key={ch}>
                  <button
                    onClick={() => setActiveChannel(ch)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-accent-purple/20 text-accent-purple font-medium'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    <Hash className="w-4 h-4 shrink-0" />
                    <span className="truncate">{ch}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Direct Messages section */}
        <div className="px-3 pt-4 pb-1">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
            Direct Messages
          </h3>
          <ul className="space-y-0.5">
            {agents.map((agent) => {
              const isActive = activeChannel === agent.id;
              return (
                <li key={agent.id}>
                  <button
                    onClick={() => setActiveChannel(agent.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-accent-purple/20 text-accent-purple font-medium'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    }`}
                  >
                    <AgentAvatar agent={agent} size="sm" showStatus />
                    <span className="truncate">{agent.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Spacer */}
        <div className="flex-1" />
      </aside>

      {/* -------- Main Chat Area -------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        {/* Channel header */}
        <header className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0">
          {isDMChannel(activeChannel) ? (
            <>
              <MessageSquare className="w-5 h-5 text-text-tertiary" />
              <h2 className="text-base font-semibold text-text-primary">
                {getAgent(activeChannel)?.name ?? activeChannel}
              </h2>
              {getAgent(activeChannel) && (
                <Badge
                  variant={
                    getAgent(activeChannel)!.status === 'active'
                      ? 'green'
                      : getAgent(activeChannel)!.status === 'idle'
                        ? 'yellow'
                        : 'default'
                  }
                  size="sm"
                >
                  {getAgent(activeChannel)!.status}
                </Badge>
              )}
            </>
          ) : (
            <>
              <Hash className="w-5 h-5 text-text-tertiary" />
              <h2 className="text-base font-semibold text-text-primary">{activeChannel}</h2>
            </>
          )}
        </header>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 min-h-0">
          {channelMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No messages yet in #{activeChannel}</p>
              <p className="text-xs mt-1">Be the first to send a message.</p>
            </div>
          )}

          {channelMessages.map((msg, idx) => {
            const senderAgent = getAgent(msg.sender_agent_id);
            const prevMsg = idx > 0 ? channelMessages[idx - 1] : null;

            // Group messages from the same sender that are close in time
            const isGrouped =
              prevMsg &&
              prevMsg.sender_agent_id === msg.sender_agent_id &&
              isCloseInTime(prevMsg.created_at, msg.created_at);

            if (isGrouped) {
              // Continuation message -- compact, no avatar/header
              return (
                <div
                  key={msg.id}
                  className="group flex items-start pl-12 hover:bg-bg-secondary/40 rounded-md transition-colors"
                >
                  <span className="hidden group-hover:inline-block text-[10px] text-text-tertiary w-10 shrink-0 pt-1 text-right pr-2">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">{msg.content}</p>
                </div>
              );
            }

            // First message in a group -- full display
            return (
              <div
                key={msg.id}
                className={`group flex items-start gap-3 hover:bg-bg-secondary/40 rounded-md px-1 py-2 transition-colors ${
                  idx > 0 ? 'mt-3' : ''
                }`}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {senderAgent ? (
                    <AgentAvatar agent={senderAgent} size="sm" showStatus={false} />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center text-xs font-bold text-text-secondary">
                      {(msg.sender_name ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Message body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {msg.sender_name ?? 'Unknown'}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      {formatTimestamp(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed mt-0.5">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="shrink-0 px-5 pb-4 pt-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3 py-2 focus-within:border-accent-purple transition-colors">
            <Plus className="w-5 h-5 text-text-tertiary shrink-0 cursor-pointer hover:text-text-secondary transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${isDMChannel(activeChannel) ? (getAgent(activeChannel)?.name ?? activeChannel) : activeChannel}...`}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1.5 rounded-md text-accent-purple hover:bg-accent-purple/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
