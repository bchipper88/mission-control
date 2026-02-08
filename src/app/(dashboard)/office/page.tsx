'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusDot } from '@/components/ui/StatusDot';
import { 
  Monitor, 
  Wifi, 
  Coffee, 
  TreePine, 
  Activity, 
  RefreshCw,
  Cpu,
  Zap,
  Clock,
  DollarSign,
  Terminal,
  Users,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LiveSession {
  id: string;
  key: string;
  name: string;
  type: 'main' | 'subagent' | 'isolated';
  model: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  currentTask: string | null;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  messageCount: number;
}

interface SessionsData {
  sessions: LiveSession[];
  stats: {
    active: number;
    idle: number;
    subagents: number;
    totalCost: number;
  };
}

// ---------------------------------------------------------------------------
// Pixel-art color palette
// ---------------------------------------------------------------------------

const COLORS = {
  floor: '#0e0e16',
  floorDot: '#14141e',
  deskSurface: '#1c1c2b',
  deskBorder: '#2a2a3e',
  deskTop: '#222235',
  monitor: '#3a3a4e',
  monitorScreenActive: '#0a3a2a',
  wallAccent: '#16161f',
  shadow: '#08080c',
  plant: '#22c55e',
  plantPot: '#8b5c2a',
  coffee: '#f59e0b',
  wifi: '#3b82f6',
  speechBubble: '#1e1e2d',
  speechBorder: '#3a3a4e',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FloorPattern() {
  const dots: React.ReactElement[] = [];
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 25; col++) {
      if ((row + col) % 3 === 0) {
        dots.push(
          <div
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: col * 20,
              top: row * 20,
              width: 2,
              height: 2,
              backgroundColor: COLORS.floorDot,
            }}
          />
        );
      }
    }
  }
  return <>{dots}</>;
}

function PlantDecoration({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <TreePine size={14} style={{ color: COLORS.plant }} strokeWidth={2.5} />
      <div style={{ width: 8, height: 5, backgroundColor: COLORS.plantPot, border: '1px solid #6b4420', marginTop: -2 }} />
    </div>
  );
}

interface SessionDeskProps {
  session: LiveSession;
  x: number;
  y: number;
  isMain?: boolean;
  onClick: () => void;
}

function SessionDesk({ session, x, y, isMain, onClick }: SessionDeskProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = session.status === 'active';
  const color = session.type === 'main' ? '#8b5cf6' : session.type === 'subagent' ? '#22c55e' : '#3b82f6';
  
  const deskW = isMain ? 100 : 70;
  const deskH = isMain ? 60 : 45;
  
  const initials = session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        cursor: 'pointer',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        zIndex: hovered ? 20 : 5,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Speech bubble for active sessions */}
      {isActive && session.currentTask && (
        <div style={{
          position: 'absolute',
          top: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: COLORS.speechBubble,
          border: `1px solid ${COLORS.speechBorder}`,
          padding: '2px 6px',
          fontSize: 8,
          color: '#a1a1aa',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 10,
        }}>
          {session.currentTask}
        </div>
      )}

      {/* Desk surface */}
      <div style={{
        width: deskW,
        height: deskH,
        backgroundColor: COLORS.deskSurface,
        border: `2px solid ${hovered ? color : COLORS.deskBorder}`,
        boxShadow: `2px 2px 0px ${COLORS.shadow}`,
        position: 'relative',
      }}>
        {/* Monitor */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: 8,
          width: isMain ? 20 : 16,
          height: isMain ? 14 : 10,
          backgroundColor: isActive ? COLORS.monitorScreenActive : '#111118',
          border: `2px solid ${COLORS.monitor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Monitor size={isMain ? 8 : 6} style={{ color: isActive ? '#22c55e' : '#3a3a4e' }} />
        </div>

        {/* Avatar */}
        <div style={{
          position: 'absolute',
          right: isMain ? 12 : 8,
          top: isMain ? 10 : 6,
          width: isMain ? 28 : 20,
          height: isMain ? 28 : 20,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMain ? 10 : 8,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'monospace',
        }}>
          {initials}
          {/* Status dot */}
          <div style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: session.status === 'active' ? '#22c55e' : session.status === 'idle' ? '#f59e0b' : '#71717a',
            border: `1px solid ${COLORS.deskSurface}`,
          }} />
        </div>

        {/* Type badge */}
        {session.type === 'subagent' && (
          <div style={{
            position: 'absolute',
            top: 2,
            right: 2,
            fontSize: 6,
            color: '#22c55e',
            fontFamily: 'monospace',
          }}>
            SUB
          </div>
        )}
      </div>

      {/* Name label */}
      <div style={{
        textAlign: 'center',
        marginTop: 4,
        fontSize: 9,
        fontWeight: 600,
        color: hovered ? '#e4e4e7' : '#a1a1aa',
        fontFamily: 'monospace',
      }}>
        {session.name.length > 10 ? session.name.slice(0, 10) + '...' : session.name}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function OfficePage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [stats, setStats] = useState({ active: 0, idle: 0, subagents: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data: SessionsData = await res.json();
      setSessions(data.sessions || []);
      setStats(data.stats || { active: 0, idle: 0, subagents: 0, totalCost: 0 });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  // Calculate desk positions dynamically
  const mainSession = sessions.find(s => s.type === 'main');
  const subagentSessions = sessions.filter(s => s.type === 'subagent');
  
  // Layout: main desk in center, subagents around it
  const deskPositions = [
    { session: mainSession, x: 200, y: 100, isMain: true },
    ...subagentSessions.slice(0, 6).map((s, i) => ({
      session: s,
      x: 50 + (i % 3) * 140,
      y: i < 3 ? 30 : 200,
      isMain: false,
    })),
  ].filter(d => d.session);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Left: Office Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2a2a3e' }}>
        {/* Header */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid #2a2a3e',
          background: '#0d0d14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} style={{ color: '#8b5cf6' }} />
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7', margin: 0, fontFamily: 'monospace' }}>
              Virtual Office
            </h1>
            <span style={{ fontSize: 11, color: '#71717a' }}>Live view</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastRefresh && (
              <span style={{ fontSize: 10, color: '#71717a' }}>
                Updated {formatTime(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={fetchSessions}
              disabled={loading}
              style={{
                padding: '4px 8px',
                background: '#1a1a28',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={12} style={{ color: '#71717a' }} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Office Canvas */}
        <div style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: 500,
            height: 300,
            backgroundColor: COLORS.floor,
            border: `2px solid ${COLORS.deskBorder}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <FloorPattern />
            
            {/* Wall label */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 8,
              color: '#3a3a4e',
              fontFamily: 'monospace',
              letterSpacing: 2,
            }}>
              // NEVA HQ //
            </div>

            {/* Decorations */}
            <PlantDecoration x={15} y={15} />
            <PlantDecoration x={470} y={15} />
            <PlantDecoration x={15} y={260} />
            <PlantDecoration x={470} y={260} />

            {/* Wifi indicator */}
            <div style={{ position: 'absolute', right: 20, top: 8 }}>
              <Wifi size={12} style={{ color: stats.active > 0 ? '#3b82f6' : '#3a3a4e' }} />
            </div>

            {/* Session desks */}
            {loading ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#71717a',
                fontSize: 11,
                fontFamily: 'monospace',
              }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#71717a',
                fontSize: 11,
                fontFamily: 'monospace',
                textAlign: 'center',
              }}>
                No active sessions<br />
                <span style={{ fontSize: 9 }}>Gateway connection may be missing</span>
              </div>
            ) : (
              deskPositions.map((pos, i) => (
                pos.session && (
                  <SessionDesk
                    key={pos.session.id}
                    session={pos.session}
                    x={pos.x}
                    y={pos.y}
                    isMain={pos.isMain}
                    onClick={() => setSelectedSession(pos.session!)}
                  />
                )
              ))
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #2a2a3e',
          background: '#12121a',
          display: 'flex',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={12} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>{stats.active} active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>{stats.idle} idle</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={12} style={{ color: '#8b5cf6' }} />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>{stats.subagents} subagents</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <DollarSign size={12} style={{ color: '#eab308' }} />
            <span style={{ fontSize: 11, color: '#a1a1aa' }}>${stats.totalCost.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Right: Session List Panel */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', background: '#0d0d14' }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #2a2a3e',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Terminal size={16} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>Live Sessions</span>
          <span style={{ fontSize: 10, color: '#71717a', marginLeft: 'auto' }}>
            {sessions.length} total
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {sessions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 24, 
              color: '#71717a', 
              fontSize: 12,
              fontFamily: 'monospace',
            }}>
              No sessions found.<br />
              <span style={{ fontSize: 10 }}>
                Check OPENCLAW_GATEWAY_TOKEN in .env.local
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  style={{
                    padding: 12,
                    background: selectedSession?.id === session.id ? '#1e1e2d' : '#16161f',
                    border: `1px solid ${selectedSession?.id === session.id ? '#3a3a4e' : '#2a2a3e'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: session.type === 'main' ? '#8b5cf6' : '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#fff',
                    }}>
                      {session.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: '#e4e4e7',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {session.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#71717a' }}>
                        {session.type} • {session.model}
                      </div>
                    </div>
                    <StatusDot status={session.status} size="sm" />
                  </div>

                  {session.currentTask && (
                    <div style={{
                      fontSize: 10,
                      color: '#a1a1aa',
                      fontFamily: 'monospace',
                      padding: '4px 8px',
                      background: '#12121a',
                      borderRadius: 4,
                      marginBottom: 6,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {session.currentTask}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#71717a' }}>
                    <span>{session.tokenUsage.total.toLocaleString()} tokens</span>
                    <span>${session.cost.toFixed(4)}</span>
                    <span style={{ marginLeft: 'auto' }}>{formatTime(session.lastActivity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setSelectedSession(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
          <Card className="w-[450px] max-h-[80vh] overflow-auto">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: selectedSession.type === 'main' ? '#8b5cf6' : '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                  }}>
                    {selectedSession.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-text-primary">{selectedSession.name}</div>
                    <div className="text-xs text-text-muted">{selectedSession.key}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-bg-hover rounded"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2">
                <Badge variant={selectedSession.status === 'active' ? 'green' : selectedSession.status === 'idle' ? 'yellow' : 'default'}>
                  {selectedSession.status}
                </Badge>
                <Badge variant={selectedSession.type === 'main' ? 'purple' : 'cyan'}>
                  {selectedSession.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-text-muted text-xs">Model</div>
                  <div className="text-text-primary font-mono">{selectedSession.model}</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs">Last Activity</div>
                  <div className="text-text-primary">{formatTime(selectedSession.lastActivity)}</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs">Total Tokens</div>
                  <div className="text-text-primary">{selectedSession.tokenUsage.total.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-text-muted text-xs">Cost</div>
                  <div className="text-accent-yellow">${selectedSession.cost.toFixed(4)}</div>
                </div>
              </div>

              {selectedSession.currentTask && (
                <div>
                  <div className="text-text-muted text-xs mb-1">Current Task</div>
                  <div className="bg-bg-secondary p-3 rounded border border-border text-sm font-mono text-text-secondary">
                    {selectedSession.currentTask}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
}
