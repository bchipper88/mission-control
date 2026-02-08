'use client';

import { Sidebar } from '@/components/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { useLoadData } from '@/hooks/useLoadData';
import { useStore } from '@/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load data from Supabase on mount
  useLoadData();
  
  const isLoading = useStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="min-h-screen pt-14 md:pt-0 md:ml-56">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
