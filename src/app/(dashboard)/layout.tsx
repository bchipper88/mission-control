'use client';

import { Sidebar } from '@/components/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
