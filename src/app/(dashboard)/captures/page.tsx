'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Camera, Plus, Grid, List, Monitor, Globe, FileImage } from 'lucide-react';
import { useState } from 'react';

interface Capture {
  id: string;
  title: string;
  type: 'screenshot' | 'webpage' | 'file';
  timestamp: string;
  agent: string;
  tags: string[];
}

const sampleCaptures: Capture[] = [
  { id: 'cap-1', title: 'Mac Studio M4 Ultra Specs', type: 'webpage', timestamp: '2025-02-07T10:30:00Z', agent: 'GLM-4.7', tags: ['research', 'hardware'] },
  { id: 'cap-2', title: 'Exo Labs Documentation', type: 'webpage', timestamp: '2025-02-07T09:15:00Z', agent: 'GLM-4.7', tags: ['research', 'exo'] },
  { id: 'cap-3', title: 'GPU Market Analysis Chart', type: 'screenshot', timestamp: '2025-02-06T14:20:00Z', agent: 'Henry', tags: ['research', 'charts'] },
  { id: 'cap-4', title: 'Competitor Channel Screenshots', type: 'screenshot', timestamp: '2025-02-06T10:00:00Z', agent: 'Flash', tags: ['content', 'research'] },
  { id: 'cap-5', title: 'Newsletter Template Draft', type: 'file', timestamp: '2025-02-05T16:30:00Z', agent: 'Henry', tags: ['content', 'newsletter'] },
  { id: 'cap-6', title: 'Local Model Benchmark Results', type: 'file', timestamp: '2025-02-05T12:00:00Z', agent: 'GLM-4.7', tags: ['benchmark', 'models'] },
];

const typeIcons: Record<string, typeof Monitor> = {
  screenshot: Monitor,
  webpage: Globe,
  file: FileImage,
};

export default function CapturesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-accent-cyan" />
            Captures
          </h1>
          <p className="text-xs text-text-muted mt-1">Screenshots, webpages, and media captured by agents</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${viewMode === 'grid' ? 'bg-accent-purple/15 text-accent-purple' : 'text-text-muted hover:bg-bg-hover'}`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 ${viewMode === 'list' ? 'bg-accent-purple/15 text-accent-purple' : 'text-text-muted hover:bg-bg-hover'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-accent-cyan text-white text-xs font-medium rounded-md hover:bg-accent-cyan/90">
            <Plus className="w-3.5 h-3.5" />
            New Capture
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-4">
          {sampleCaptures.map((cap) => {
            const Icon = typeIcons[cap.type];
            return (
              <Card key={cap.id} hover>
                {/* Placeholder thumbnail */}
                <div className="aspect-video bg-bg-tertiary border-b border-border flex items-center justify-center">
                  <Icon className="w-8 h-8 text-text-muted/30" />
                </div>
                <CardContent className="space-y-2">
                  <h3 className="text-xs font-semibold truncate">{cap.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted">
                    <span>{cap.agent}</span>
                    <span>·</span>
                    <span>{new Date(cap.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1">
                    {cap.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {sampleCaptures.map((cap) => {
            const Icon = typeIcons[cap.type];
            return (
              <Card key={cap.id} hover>
                <CardContent className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bg-tertiary rounded flex items-center justify-center">
                    <Icon className="w-4 h-4 text-text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold">{cap.title}</h3>
                    <p className="text-[10px] text-text-muted">{cap.agent} · {new Date(cap.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {cap.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
