'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { FileText, Plus, Search, Clock, User } from 'lucide-react';

interface Doc {
  id: string;
  title: string;
  content: string;
  project: string;
  author: string;
  updated: string;
  type: 'note' | 'report' | 'template' | 'guide';
}

const sampleDocs: Doc[] = [
  {
    id: 'doc-1',
    title: 'AI Scarcity Thesis - Draft 1',
    content: 'The current landscape of AI compute is characterized by an increasing imbalance between demand and supply...',
    project: 'AI Scarcity Research',
    author: 'Henry',
    updated: '2025-02-06T14:00:00Z',
    type: 'report',
  },
  {
    id: 'doc-2',
    title: 'Mac Studio Setup Guide',
    content: 'Step-by-step guide for setting up the M4 Ultra Mac Studio for local AI inference workloads...',
    project: 'Mac Studio Infrastructure',
    author: 'Codex',
    updated: '2025-02-05T11:00:00Z',
    type: 'guide',
  },
  {
    id: 'doc-3',
    title: 'Newsletter Template',
    content: '## This Week in AI\n\n### Headlines\n- ...\n\n### Analysis\n- ...\n\n### Recommendations\n- ...',
    project: 'Weekly Newsletter',
    author: 'Henry',
    updated: '2025-02-04T09:00:00Z',
    type: 'template',
  },
  {
    id: 'doc-4',
    title: 'Mission Control Architecture Notes',
    content: 'The dashboard uses Next.js 15 with App Router, connected to Supabase for persistence and OpenClaw Gateway for agent runtime...',
    project: 'Mission Control',
    author: 'Codex',
    updated: '2025-02-03T16:00:00Z',
    type: 'note',
  },
];

const typeColors: Record<string, string> = {
  note: 'blue',
  report: 'purple',
  template: 'yellow',
  guide: 'green',
};

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = sampleDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 flex gap-6 h-[calc(100vh-0px)]">
      {/* Document List */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-blue" />
            Docs
          </h1>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent-blue text-white text-xs font-medium rounded-md hover:bg-accent-blue/90">
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border rounded-md text-xs text-text-primary placeholder-text-muted outline-none focus:border-accent-blue"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              hover
              onClick={() => setSelectedDoc(doc)}
              className={selectedDoc?.id === doc.id ? 'border-accent-blue' : ''}
            >
              <CardContent>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={typeColors[doc.type] as 'blue' | 'purple' | 'yellow' | 'green'}>
                    {doc.type}
                  </Badge>
                  <span className="text-[10px] text-text-muted">{doc.project}</span>
                </div>
                <h3 className="text-xs font-semibold mb-1">{doc.title}</h3>
                <p className="text-[10px] text-text-muted line-clamp-2">{doc.content}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    {doc.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(doc.updated).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 bg-bg-secondary border border-border rounded-lg overflow-hidden">
        {selectedDoc ? (
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={typeColors[selectedDoc.type] as 'blue' | 'purple' | 'yellow' | 'green'}>
                  {selectedDoc.type}
                </Badge>
                <span className="text-[10px] text-text-muted">{selectedDoc.project}</span>
              </div>
              <h2 className="text-base font-bold">{selectedDoc.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                <span>{selectedDoc.author}</span>
                <span>·</span>
                <span>Updated {new Date(selectedDoc.updated).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{selectedDoc.content}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted text-sm">
            <div className="text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Select a document to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
