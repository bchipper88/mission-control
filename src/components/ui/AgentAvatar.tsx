'use client';

import { Agent } from '@/types';
import { StatusDot } from './StatusDot';

const typeColors: Record<string, string> = {
  human: 'from-accent-blue to-accent-cyan',
  api: 'from-accent-purple to-accent-pink',
  local: 'from-accent-green to-accent-yellow',
};

interface AgentAvatarProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
}

export function AgentAvatar({ agent, size = 'md', showStatus = true }: AgentAvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusPositions = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: 'bottom-0 right-0',
    xl: 'bottom-0.5 right-0.5',
  };

  const initials = agent.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${
          typeColors[agent.type] || typeColors.api
        } flex items-center justify-center font-bold text-white`}
      >
        {initials}
      </div>
      {showStatus && (
        <span className={`absolute ${statusPositions[size]}`}>
          <StatusDot status={agent.status} size="sm" />
        </span>
      )}
    </div>
  );
}
