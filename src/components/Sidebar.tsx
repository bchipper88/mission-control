'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Users,
  Calendar,
  FolderOpen,
  Brain,
  FileText,
  UserCircle,
  Network,
  Building2,
  Search,
  Zap,
  DollarSign,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/mission-control', label: 'Mission Control', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/council', label: 'Council', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/costs', label: 'Costs', icon: DollarSign },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/docs', label: 'Docs', icon: FileText },
  { href: '/people', label: 'People', icon: UserCircle },
  { href: '/org', label: 'Org', icon: Network },
  { href: '/office', label: 'Office', icon: Building2 },
  { href: '/search', label: 'Search', icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg-secondary border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/mission-control" className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent-purple" />
          <span className="font-bold text-sm text-text-primary">Mission Control</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-text-secondary hover:text-text-primary"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-56 bg-bg-secondary border-r border-border flex flex-col h-screen fixed left-0 top-0 z-50
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo / Brand */}
        <div className="px-4 py-4 border-b border-border">
          <Link href="/mission-control" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-purple" />
            <span className="font-bold text-sm text-text-primary">Mission Control</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors mb-0.5 ${
                  isActive
                    ? 'bg-accent-purple/15 text-accent-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-dot" />
            <span>OpenClaw Connected</span>
          </div>
        </div>
      </aside>
    </>
  );
}
