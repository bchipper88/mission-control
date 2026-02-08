'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { Badge } from '@/components/ui/Badge';
import { Monitor, Wifi, Coffee, TreePine } from 'lucide-react';
import { Agent } from '@/types';

// ---------------------------------------------------------------------------
// Pixel-art color palette (matching dark theme)
// ---------------------------------------------------------------------------

const COLORS = {
  floor: '#0e0e16',
  floorDot: '#14141e',
  deskSurface: '#1c1c2b',
  deskBorder: '#2a2a3e',
  deskTop: '#222235',
  monitor: '#3a3a4e',
  monitorScreen: '#0a2a1a',
  monitorScreenActive: '#0a3a2a',
  wallAccent: '#16161f',
  shadow: '#08080c',
  conferenceTable: '#1a1a28',
  conferenceBorder: '#2e2e44',
  plant: '#22c55e',
  plantPot: '#8b5c2a',
  coffee: '#f59e0b',
  wifi: '#3b82f6',
  speechBubble: '#1e1e2d',
  speechBorder: '#3a3a4e',
};

const AGENT_COLORS: Record<string, string> = {
  human: '#3b82f6',
  api: '#8b5cf6',
  local: '#22c55e',
};

// ---------------------------------------------------------------------------
// Desk positions (absolute positioning within the office canvas)
// ---------------------------------------------------------------------------

interface DeskConfig {
  agentId: string;
  x: number;
  y: number;
  isLarge?: boolean;
}

const DESK_LAYOUT: DeskConfig[] = [
  // Row 1 (top row)
  { agentId: 'agent-henry', x: 80, y: 60 },
  { agentId: 'agent-alex', x: 310, y: 40, isLarge: true },
  { agentId: 'agent-codex', x: 580, y: 60 },
  // Row 2 (bottom row)
  { agentId: 'agent-glm', x: 140, y: 300 },
  { agentId: 'agent-flash', x: 520, y: 300 },
];

// ---------------------------------------------------------------------------
// Pixel shadow utility
// ---------------------------------------------------------------------------

function pixelShadow(color: string, depth: number = 3): string {
  const shadows: string[] = [];
  for (let i = 1; i <= depth; i++) {
    shadows.push(`${i}px ${i}px 0px ${color}`);
  }
  return shadows.join(', ');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FloorPattern() {
  const dots: React.ReactElement[] = [];
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 40; col++) {
      if ((row + col) % 3 === 0) {
        dots.push(
          <div
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: col * 22,
              top: row * 22,
              width: 2,
              height: 2,
              backgroundColor: COLORS.floorDot,
              imageRendering: 'pixelated',
            }}
          />
        );
      }
    }
  }
  return <>{dots}</>;
}

function ConferenceTable() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 310,
        top: 200,
        width: 180,
        height: 60,
        backgroundColor: COLORS.conferenceTable,
        border: `2px solid ${COLORS.conferenceBorder}`,
        boxShadow: pixelShadow(COLORS.shadow, 4),
        imageRendering: 'pixelated',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {/* Chairs around the table */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            backgroundColor: COLORS.deskBorder,
            border: `1px solid ${COLORS.monitor}`,
          }}
        />
      ))}
      {/* Top chairs */}
      <div
        style={{
          position: 'absolute',
          top: -14,
          left: 30,
          display: 'flex',
          gap: 30,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 8,
              backgroundColor: COLORS.deskBorder,
              border: `1px solid ${COLORS.monitor}`,
            }}
          />
        ))}
      </div>
      {/* Bottom chairs */}
      <div
        style={{
          position: 'absolute',
          bottom: -14,
          left: 30,
          display: 'flex',
          gap: 30,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 8,
              backgroundColor: COLORS.deskBorder,
              border: `1px solid ${COLORS.monitor}`,
            }}
          />
        ))}
      </div>
      <span
        style={{
          position: 'absolute',
          fontSize: 8,
          color: '#71717a',
          fontFamily: 'monospace',
          letterSpacing: 1,
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        CONFERENCE
      </span>
    </div>
  );
}

function PlantDecoration({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        imageRendering: 'pixelated',
      }}
    >
      <TreePine size={16} style={{ color: COLORS.plant }} strokeWidth={2.5} />
      <div
        style={{
          width: 10,
          height: 6,
          backgroundColor: COLORS.plantPot,
          border: '1px solid #6b4420',
          marginTop: -2,
        }}
      />
    </div>
  );
}

function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Coffee size={18} style={{ color: COLORS.coffee }} strokeWidth={2} />
      <span
        style={{
          fontSize: 7,
          color: '#71717a',
          fontFamily: 'monospace',
          letterSpacing: 1,
        }}
      >
        COFFEE
      </span>
      <div
        style={{
          width: 30,
          height: 20,
          backgroundColor: '#1a1a24',
          border: `1px solid ${COLORS.deskBorder}`,
          boxShadow: pixelShadow(COLORS.shadow, 2),
          marginTop: 2,
        }}
      />
    </div>
  );
}

function WifiZone({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        opacity: 0.6,
      }}
    >
      <Wifi size={16} style={{ color: COLORS.wifi }} strokeWidth={2} />
      <span
        style={{
          fontSize: 7,
          color: '#71717a',
          fontFamily: 'monospace',
        }}
      >
        WiFi
      </span>
    </div>
  );
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: -36,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: COLORS.speechBubble,
        border: `1px solid ${COLORS.speechBorder}`,
        padding: '3px 8px',
        fontSize: 9,
        color: '#a1a1aa',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        maxWidth: 160,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        zIndex: 10,
        boxShadow: pixelShadow(COLORS.shadow, 2),
        imageRendering: 'pixelated',
      }}
    >
      {text}
      {/* Triangle pointer */}
      <div
        style={{
          position: 'absolute',
          bottom: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `5px solid ${COLORS.speechBorder}`,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent Desk Component
// ---------------------------------------------------------------------------

interface AgentDeskProps {
  agent: Agent;
  config: DeskConfig;
  taskTitle: string | null;
  onClick: () => void;
}

function AgentDesk({ agent, config, taskTitle, onClick }: AgentDeskProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = agent.status === 'active';
  const isIdle = agent.status === 'idle';
  const agentColor = AGENT_COLORS[agent.type] || AGENT_COLORS.api;

  const deskW = config.isLarge ? 140 : 110;
  const deskH = config.isLarge ? 80 : 65;

  const initials = agent.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        position: 'absolute',
        left: config.x,
        top: config.y,
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        zIndex: hovered ? 20 : 5,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Speech bubble for active agents */}
      {isActive && taskTitle && (
        <div style={{ position: 'relative', width: deskW }}>
          <SpeechBubble text={taskTitle} />
        </div>
      )}

      {/* Desk surface */}
      <div
        style={{
          width: deskW,
          height: deskH,
          backgroundColor: COLORS.deskSurface,
          border: `2px solid ${hovered ? agentColor : COLORS.deskBorder}`,
          boxShadow: hovered
            ? `${pixelShadow(COLORS.shadow, 4)}, 0 0 12px ${agentColor}33`
            : pixelShadow(COLORS.shadow, 3),
          position: 'relative',
          imageRendering: 'pixelated',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Desk top surface stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: COLORS.deskTop,
          }}
        />

        {/* Monitor on desk */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: config.isLarge ? 14 : 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: config.isLarge ? 28 : 22,
              height: config.isLarge ? 18 : 14,
              backgroundColor: isActive ? COLORS.monitorScreenActive : '#111118',
              border: `2px solid ${COLORS.monitor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Monitor
              size={config.isLarge ? 10 : 8}
              style={{ color: isActive ? '#22c55e' : isIdle ? '#f59e0b' : '#3a3a4e' }}
              strokeWidth={2}
            />
          </div>
          {/* Monitor stand */}
          <div
            style={{
              width: 4,
              height: 3,
              backgroundColor: COLORS.monitor,
            }}
          />
          <div
            style={{
              width: 10,
              height: 2,
              backgroundColor: COLORS.monitor,
            }}
          />
        </div>

        {/* Agent avatar circle */}
        <div
          style={{
            position: 'absolute',
            right: config.isLarge ? 18 : 12,
            top: config.isLarge ? 14 : 10,
            width: config.isLarge ? 36 : 30,
            height: config.isLarge ? 36 : 30,
            borderRadius: '50%',
            backgroundColor: agentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: config.isLarge ? 12 : 10,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'monospace',
            boxShadow: `0 0 0 2px ${COLORS.deskSurface}, 0 0 0 3px ${agentColor}66`,
            imageRendering: 'auto',
          }}
        >
          {initials}
          {/* Status dot on avatar */}
          <div
            style={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                agent.status === 'active'
                  ? '#22c55e'
                  : agent.status === 'idle'
                    ? '#f59e0b'
                    : '#71717a',
              border: `2px solid ${COLORS.deskSurface}`,
            }}
          />
        </div>

        {/* Keyboard on desk */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: config.isLarge ? 16 : 10,
            width: config.isLarge ? 30 : 24,
            height: 6,
            backgroundColor: '#252538',
            border: `1px solid ${COLORS.deskBorder}`,
          }}
        />

        {/* CEO label for large desk */}
        {config.isLarge && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              fontSize: 7,
              fontFamily: 'monospace',
              color: agentColor,
              opacity: 0.7,
              letterSpacing: 1,
            }}
          >
            CEO
          </div>
        )}
      </div>

      {/* Agent name label */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 6,
          fontSize: 10,
          fontWeight: 600,
          color: hovered ? '#e4e4e7' : '#a1a1aa',
          fontFamily: 'monospace',
          letterSpacing: 0.5,
          transition: 'color 0.15s ease',
        }}
      >
        {agent.name}
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: 8,
          color: '#71717a',
          fontFamily: 'monospace',
          marginTop: 1,
        }}
      >
        {agent.status.toUpperCase()}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent Detail Popup
// ---------------------------------------------------------------------------

interface AgentPopupProps {
  agent: Agent;
  agentTasks: { id: string; title: string; status: string; priority: string }[];
  onClose: () => void;
}

function AgentPopup({ agent, agentTasks, onClose }: AgentPopupProps) {
  const statusVariant =
    agent.status === 'active' ? 'green' : agent.status === 'idle' ? 'yellow' : 'default';
  const typeVariant =
    agent.type === 'human' ? 'blue' : agent.type === 'api' ? 'purple' : 'cyan';

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#16161f',
          border: `2px solid ${COLORS.deskBorder}`,
          boxShadow: pixelShadow('#000', 6),
          padding: 24,
          width: 400,
          maxHeight: '80vh',
          overflow: 'auto',
          imageRendering: 'pixelated',
          fontFamily: 'monospace',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-in"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <AgentAvatar agent={agent} size="xl" showStatus />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7' }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{agent.role}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <Badge variant={statusVariant} size="sm">
                {agent.status}
              </Badge>
              <Badge variant={typeVariant} size="sm">
                {agent.type}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${COLORS.deskBorder}`,
              color: '#71717a',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 14,
              fontFamily: 'monospace',
            }}
          >
            X
          </button>
        </div>

        {/* Model info */}
        {(agent.model || agent.provider) && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#12121a',
              border: `1px solid ${COLORS.deskBorder}`,
              marginBottom: 12,
              fontSize: 11,
              color: '#a1a1aa',
            }}
          >
            <span style={{ color: '#71717a' }}>Model: </span>
            {agent.provider && <span>{agent.provider} / </span>}
            {agent.model && <span style={{ color: '#e4e4e7' }}>{agent.model}</span>}
          </div>
        )}

        {/* Skills */}
        {agent.skills.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: '#71717a',
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {agent.skills.map((skill) => (
                <Badge key={skill} variant="default" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Tasks */}
        <div>
          <div
            style={{
              fontSize: 10,
              color: '#71717a',
              marginBottom: 6,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Tasks ({agentTasks.length})
          </div>
          {agentTasks.length === 0 ? (
            <div style={{ fontSize: 11, color: '#71717a', fontStyle: 'italic' }}>
              No tasks assigned
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {agentTasks.map((task) => {
                const priorityVariant =
                  task.priority === 'critical'
                    ? 'red'
                    : task.priority === 'high'
                      ? 'yellow'
                      : task.priority === 'medium'
                        ? 'blue'
                        : 'default';
                const statusColor =
                  task.status === 'in_progress'
                    ? 'green'
                    : task.status === 'review'
                      ? 'purple'
                      : task.status === 'done'
                        ? 'cyan'
                        : 'default';
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#12121a',
                      border: `1px solid ${COLORS.deskBorder}`,
                      fontSize: 11,
                      color: '#e4e4e7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                    <Badge variant={priorityVariant} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant={statusColor as 'default' | 'green' | 'purple' | 'cyan'} size="sm">
                      {task.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Soul */}
        {agent.soul_md && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 10,
                color: '#71717a',
                marginBottom: 6,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Soul
            </div>
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#12121a',
                border: `1px solid ${COLORS.deskBorder}`,
                fontSize: 11,
                color: '#a1a1aa',
                lineHeight: 1.5,
              }}
            >
              {agent.soul_md}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function OfficePage() {
  const agents = useStore((s) => s.agents);
  const tasks = useStore((s) => s.tasks);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = selectedAgentId
    ? agents.find((a) => a.id === selectedAgentId) ?? null
    : null;

  // Get tasks for an agent
  function getAgentTasks(agentId: string) {
    return tasks.filter((t) => t.assigned_agent_id === agentId);
  }

  // Get a display task title for the speech bubble
  function getActiveTaskTitle(agentId: string): string | null {
    const agentTasks = getAgentTasks(agentId);
    const active = agentTasks.find(
      (t) => t.status === 'in_progress' || t.status === 'assigned' || t.status === 'review'
    );
    return active ? active.title : agentTasks.length > 0 ? 'Working...' : null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #2a2a3e',
          background: '#0d0d14',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#e4e4e7',
            margin: 0,
            fontFamily: 'monospace',
            letterSpacing: 1,
          }}
        >
          Virtual Office
        </h1>
        <span style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace' }}>
          Team workspace
        </span>
      </div>

      {/* Office Canvas */}
      <div
        style={{
          flex: 1,
          padding: 20,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 840,
            height: 520,
            margin: '0 auto',
            backgroundColor: COLORS.floor,
            border: `2px solid ${COLORS.deskBorder}`,
            position: 'relative',
            overflow: 'hidden',
            imageRendering: 'pixelated',
            flexShrink: 0,
          }}
        >
          {/* Floor dot pattern */}
          <FloorPattern />

          {/* Wall accent line at top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: COLORS.wallAccent,
              borderBottom: `1px solid ${COLORS.deskBorder}`,
            }}
          />

          {/* Room label */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 9,
              color: '#3a3a4e',
              fontFamily: 'monospace',
              letterSpacing: 3,
              textTransform: 'uppercase',
              zIndex: 1,
            }}
          >
            // HQ Floor Plan //
          </div>

          {/* Decorative elements */}
          <PlantDecoration x={20} y={28} />
          <PlantDecoration x={790} y={28} />
          <PlantDecoration x={20} y={460} />
          <PlantDecoration x={790} y={460} />
          <PlantDecoration x={270} y={270} />

          <CoffeeMachine x={720} y={420} />
          <WifiZone x={740} y={24} />

          {/* Conference table */}
          <ConferenceTable />

          {/* Wall decorations - horizontal lines */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 60,
              width: 50,
              height: 1,
              backgroundColor: '#1a1a2e',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 4,
              right: 60,
              width: 50,
              height: 1,
              backgroundColor: '#1a1a2e',
            }}
          />

          {/* Agent desks */}
          {DESK_LAYOUT.map((deskConfig) => {
            const agent = agents.find((a) => a.id === deskConfig.agentId);
            if (!agent) return null;
            return (
              <AgentDesk
                key={agent.id}
                agent={agent}
                config={deskConfig}
                taskTitle={getActiveTaskTitle(agent.id)}
                onClick={() => setSelectedAgentId(agent.id)}
              />
            );
          })}

          {/* Network lines connecting desks (subtle) */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Alex to Henry */}
            <line
              x1={380}
              y1={120}
              x2={135}
              y2={100}
              stroke="#1a1a2e"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* Alex to Codex */}
            <line
              x1={380}
              y1={120}
              x2={635}
              y2={100}
              stroke="#1a1a2e"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* Henry to GLM */}
            <line
              x1={135}
              y1={130}
              x2={195}
              y2={300}
              stroke="#1a1a2e"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* GLM to Flash */}
            <line
              x1={250}
              y1={340}
              x2={520}
              y2={340}
              stroke="#1a1a2e"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </svg>
        </div>

        {/* Bottom status bar / taskbar */}
        <div
          style={{
            width: '100%',
            maxWidth: 840,
            margin: '0 auto',
            backgroundColor: '#12121a',
            border: `1px solid ${COLORS.deskBorder}`,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            imageRendering: 'pixelated',
            flexShrink: 0,
          }}
        >
          {agents.map((agent) => {
            const color = AGENT_COLORS[agent.type] || AGENT_COLORS.api;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  backgroundColor:
                    selectedAgentId === agent.id ? '#1e1e2d' : 'transparent',
                  border: `1px solid ${
                    selectedAgentId === agent.id ? color + '44' : 'transparent'
                  }`,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  fontFamily: 'monospace',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a28';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    selectedAgentId === agent.id ? '#1e1e2d' : 'transparent';
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AgentAvatar agent={agent} size="sm" showStatus />
                </div>
                <div style={{ minWidth: 0, textAlign: 'left' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#e4e4e7',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {agent.name}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#71717a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {agent.role}
                  </div>
                </div>
                <StatusDot status={agent.status} size="sm" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent popup */}
      {selectedAgent && (
        <AgentPopup
          agent={selectedAgent}
          agentTasks={getAgentTasks(selectedAgent.id).map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
          }))}
          onClose={() => setSelectedAgentId(null)}
        />
      )}
    </div>
  );
}
