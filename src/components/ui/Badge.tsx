'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'pink' | 'cyan';
  size?: 'sm' | 'md';
}

const variantClasses: Record<string, string> = {
  default: 'bg-bg-tertiary text-text-secondary',
  green: 'bg-accent-green/15 text-accent-green',
  yellow: 'bg-accent-yellow/15 text-accent-yellow',
  red: 'bg-accent-red/15 text-accent-red',
  blue: 'bg-accent-blue/15 text-accent-blue',
  purple: 'bg-accent-purple/15 text-accent-purple',
  pink: 'bg-accent-pink/15 text-accent-pink',
  cyan: 'bg-accent-cyan/15 text-accent-cyan',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {children}
    </span>
  );
}
