'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Sparkles,
  RefreshCw,
  Zap,
  Code,
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  version?: string;
  enabled: boolean;
  triggers?: string[];
}

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  automation: Zap,
  code: Code,
  research: Search,
  default: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  automation: '#22c55e',
  code: '#8b5cf6',
  research: '#3b82f6',
  integration: '#f59e0b',
  default: '#6b7280',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const categories = ['all', ...new Set(skills.map(s => s.category))];
  const filteredSkills = filter === 'all' 
    ? skills 
    : skills.filter(s => s.category === filter);
  
  const enabledCount = skills.filter(s => s.enabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Sparkles className="w-5 h-5 text-accent-yellow" />
            Skills
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Available agent capabilities and integrations
          </p>
        </div>
        <button
          onClick={fetchSkills}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Total Skills</span>
              <Sparkles className="w-4 h-4 text-accent-yellow" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{skills.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Enabled</span>
              <Zap className="w-4 h-4 text-accent-green" />
            </div>
            <p className="text-2xl font-bold text-accent-green">{enabledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-tertiary">Categories</span>
              <FileText className="w-4 h-4 text-accent-purple" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{categories.length - 1}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              filter === cat
                ? 'bg-accent-purple text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">
          Loading skills...
        </div>
      ) : skills.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-sm text-text-tertiary">No skills found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skills List */}
          <div className="lg:col-span-1 space-y-2">
            {filteredSkills.map(skill => {
              const Icon = CATEGORY_ICONS[skill.category] || CATEGORY_ICONS.default;
              const color = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.default;
              
              return (
                <Card
                  key={skill.id}
                  className={`cursor-pointer transition-all ${
                    selectedSkill?.id === skill.id
                      ? 'ring-2 ring-accent-purple bg-accent-purple/10'
                      : 'hover:bg-bg-secondary/60'
                  }`}
                  onClick={() => setSelectedSkill(skill)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color + '20' }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {skill.name}
                          </span>
                          {skill.enabled ? (
                            <Badge variant="green" size="sm">On</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Off</Badge>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                          {skill.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Skill Detail */}
          <div className="lg:col-span-2">
            {selectedSkill ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: (CATEGORY_COLORS[selectedSkill.category] || CATEGORY_COLORS.default) + '20' 
                      }}
                    >
                      {(() => {
                        const Icon = CATEGORY_ICONS[selectedSkill.category] || CATEGORY_ICONS.default;
                        const color = CATEGORY_COLORS[selectedSkill.category] || CATEGORY_COLORS.default;
                        return <Icon className="w-6 h-6" style={{ color }} />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-text-primary">
                        {selectedSkill.name}
                      </h2>
                      <p className="text-sm text-text-secondary mt-1">
                        {selectedSkill.description}
                      </p>
                    </div>
                    {selectedSkill.enabled ? (
                      <Badge variant="green">Enabled</Badge>
                    ) : (
                      <Badge variant="default">Disabled</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <span className="text-xs text-text-tertiary">Category</span>
                      <p className="text-sm font-medium text-text-primary capitalize mt-1">
                        {selectedSkill.category}
                      </p>
                    </div>
                    <div className="bg-bg-secondary rounded-lg p-3">
                      <span className="text-xs text-text-tertiary">Version</span>
                      <p className="text-sm font-medium text-text-primary mt-1">
                        {selectedSkill.version || '1.0.0'}
                      </p>
                    </div>
                  </div>

                  {selectedSkill.triggers && selectedSkill.triggers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Triggers</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkill.triggers.map((trigger, i) => (
                          <code 
                            key={i}
                            className="text-xs bg-bg-tertiary px-2 py-1 rounded text-accent-blue"
                          >
                            {trigger}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-text-tertiary">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a skill to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
