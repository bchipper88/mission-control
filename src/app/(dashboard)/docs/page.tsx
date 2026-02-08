'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { FileText, Search, Clock, User, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const typeColors: Record<string, 'blue' | 'purple' | 'yellow' | 'green' | 'default'> = {
  note: 'blue',
  report: 'purple',
  template: 'yellow',
  guide: 'green',
};

const typeIcons: Record<string, typeof FileText> = {
  note: FileText,
  guide: Brain,
  report: FileText,
  template: FileText,
};

export default function DocsPage() {
  const { documents, agents } = useStore();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const selectedDoc = selectedDocId ? documents.find(d => d.id === selectedDocId) : null;

  const getAgent = (agentId?: string | null) =>
    agentId ? agents.find((a) => a.id === agentId) : undefined;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 flex gap-6 h-[calc(100vh-0px)]">
      {/* Document List */}
      <div className="w-80 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-blue" />
            Docs
          </h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-secondary border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-purple"
          />
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-8 text-text-tertiary text-sm">
              No documents found
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const Icon = typeIcons[doc.doc_type ?? 'note'] ?? FileText;
              const isSelected = selectedDocId === doc.id;
              const author = getAgent(doc.created_by);

              return (
                <Card
                  key={doc.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-accent-purple bg-accent-purple/10'
                      : 'hover:bg-bg-secondary/60'
                  }`}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Icon className="w-4 h-4 text-text-tertiary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-text-primary truncate">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={typeColors[doc.doc_type ?? 'note'] ?? 'default'} size="sm">
                            {doc.doc_type ?? 'note'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary">
                          {author && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {author.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(doc.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedDoc ? (
          <Card className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text-primary">{selectedDoc.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                  <Badge variant={typeColors[selectedDoc.doc_type ?? 'note'] ?? 'default'} size="sm">
                    {selectedDoc.doc_type ?? 'note'}
                  </Badge>
                  {getAgent(selectedDoc.created_by) && (
                    <span>by {getAgent(selectedDoc.created_by)?.name}</span>
                  )}
                  <span>Updated {formatDate(selectedDoc.updated_at)}</span>
                </div>
              </div>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-text-primary mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-text-primary mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-text-primary mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-text-secondary mb-3 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-text-secondary">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-text-secondary">{children}</ol>,
                    li: ({ children }) => <li className="text-text-secondary">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                    code: ({ children }) => <code className="bg-bg-tertiary px-1.5 py-0.5 rounded text-accent-purple text-xs">{children}</code>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-purple pl-4 italic text-text-tertiary">{children}</blockquote>,
                  }}
                >
                  {selectedDoc.content ?? ''}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-text-tertiary">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a document to view</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
