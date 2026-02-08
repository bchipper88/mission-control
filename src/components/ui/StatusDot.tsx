'use client';

import { AgentStatus } from '@/types';

const statusColors: Record<AgentStatus, string> = {
  active: 'bg-accent-green',
  idle: 'bg-accent-yellow',
  offline: 'bg-text-muted',
};

const statusLabels: Record<AgentStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
};

interface StatusDotProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusDot({ status, size = 'md', showLabel = false }: StatusDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block rounded-full ${sizeClasses[size]} ${statusColors[status]} ${
          status === 'active' ? 'animate-pulse-dot' : ''
        }`}
      />
      {showLabel && (
        <span className="text-xs text-text-secondary">{statusLabels[status]}</span>
      )}
    </span>
  );
}
