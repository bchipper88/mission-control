'use client';

import '@xyflow/react/dist/style.css';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import { useStore } from '@/store';
import { AgentAvatar } from '@/components/ui/AgentAvatar';
import { StatusDot } from '@/components/ui/StatusDot';
import { Badge } from '@/components/ui/Badge';
import { User, Cloud, HardDrive, DollarSign } from 'lucide-react';
import { Agent } from '@/types';

// ---------------------------------------------------------------------------
// Custom Node Component
// ---------------------------------------------------------------------------

function AgentNode({ data }: { data: { agent: Agent } }) {
  const agent = data.agent;

  return (
    <div
      style={{
        background: '#16161f',
        border: '1px solid #2a2a3e',
        borderRadius: 12,
        padding: 16,
        minWidth: 220,
        maxWidth: 260,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#3a3a4e', border: 'none', width: 8, height: 8 }}
      />

      {/* Top row: avatar + name/role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <AgentAvatar agent={agent} size="md" showStatus={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#e4e4e7',
              fontWeight: 600,
              fontSize: 13,
              lineHeight: '18px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {agent.name}
          </div>
          <div
            style={{
              color: '#a1a1aa',
              fontSize: 11,
              lineHeight: '15px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {agent.role}
          </div>
        </div>
        <StatusDot status={agent.status} size="md" />
      </div>

      {/* Model & provider */}
      {(agent.model || agent.provider) && (
        <div
          style={{
            color: '#71717a',
            fontSize: 10,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {agent.provider && <span>{agent.provider}</span>}
          {agent.provider && agent.model && <span>/</span>}
          {agent.model && <span>{agent.model}</span>}
        </div>
      )}

      {/* Cost info */}
      {agent.cost_info && (
        <div
          style={{
            color: '#71717a',
            fontSize: 10,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <DollarSign size={10} />
          <span>
            {agent.cost_info.input}/{agent.cost_info.output} per {agent.cost_info.unit}
          </span>
        </div>
      )}

      {/* Skills */}
      {agent.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {agent.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="default" size="sm">
              {skill}
            </Badge>
          ))}
          {agent.skills.length > 4 && (
            <Badge variant="default" size="sm">
              +{agent.skills.length - 4}
            </Badge>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3a3a4e', border: 'none', width: 8, height: 8 }}
      />
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode };

// ---------------------------------------------------------------------------
// Tree layout helper
// ---------------------------------------------------------------------------

const H_SPACING = 280;
const V_SPACING = 200;

interface TreeNode {
  agent: Agent;
  children: TreeNode[];
}

function buildTree(agents: Agent[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  agents.forEach((a) => map.set(a.id, { agent: a, children: [] }));

  const roots: TreeNode[] = [];

  agents.forEach((a) => {
    if (a.parent_agent_id && map.has(a.parent_agent_id)) {
      map.get(a.parent_agent_id)!.children.push(map.get(a.id)!);
    } else {
      roots.push(map.get(a.id)!);
    }
  });

  return roots;
}

function measureWidth(node: TreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((sum, c) => sum + measureWidth(c), 0);
}

function layoutTree(
  node: TreeNode,
  depth: number,
  leftOffset: number,
  nodes: Node[],
  edges: Edge[],
) {
  const width = measureWidth(node);
  const x = (leftOffset + width / 2) * H_SPACING;
  const y = depth * V_SPACING;

  nodes.push({
    id: node.agent.id,
    type: 'agentNode',
    position: { x, y },
    data: { agent: node.agent },
  });

  if (node.agent.parent_agent_id) {
    edges.push({
      id: `e-${node.agent.parent_agent_id}-${node.agent.id}`,
      source: node.agent.parent_agent_id,
      target: node.agent.id,
      animated: true,
      style: { stroke: '#3a3a4e', strokeWidth: 2 },
    });
  }

  let childLeft = leftOffset;
  node.children.forEach((child) => {
    layoutTree(child, depth + 1, childLeft, nodes, edges);
    childLeft += measureWidth(child);
  });
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function OrgChartPage() {
  const agents = useStore((s) => s.agents);

  // Compute stats
  const humanCount = agents.filter((a) => a.type === 'human').length;
  const apiCount = agents.filter((a) => a.type === 'api').length;
  const localCount = agents.filter((a) => a.type === 'local').length;
  const totalCost = agents.reduce((sum, a) => {
    if (a.cost_info) return sum + a.cost_info.input + a.cost_info.output;
    return sum;
  }, 0);

  // Build flow elements
  const { initialNodes, initialEdges } = useMemo(() => {
    const roots = buildTree(agents);
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    let globalLeft = 0;
    roots.forEach((root) => {
      layoutTree(root, 0, globalLeft, flowNodes, flowEdges);
      globalLeft += measureWidth(root);
    });

    // Center the graph horizontally
    if (flowNodes.length > 0) {
      const minX = Math.min(...flowNodes.map((n) => n.position.x));
      const maxX = Math.max(...flowNodes.map((n) => n.position.x));
      const centerOffset = (maxX - minX) / 2 + minX;
      flowNodes.forEach((n) => {
        n.position.x -= centerOffset;
        n.position.y += 40;
      });
    }

    return { initialNodes: flowNodes, initialEdges: flowEdges };
  }, [agents]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const stats = [
    {
      icon: User,
      count: humanCount,
      label: 'Humans',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.12)',
    },
    {
      icon: Cloud,
      count: apiCount,
      label: 'API Agents',
      color: '#a855f7',
      bg: 'rgba(168,85,247,0.12)',
    },
    {
      icon: HardDrive,
      count: localCount,
      label: 'Local Models',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.12)',
    },
    {
      icon: DollarSign,
      count: `$${totalCost.toFixed(2)}`,
      label: 'Infra Cost',
      color: '#eab308',
      bg: 'rgba(234,179,8,0.12)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Header stats bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a3e',
          background: '#0d0d14',
          flexShrink: 0,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              borderRadius: 10,
              background: stat.bg,
              border: `1px solid ${stat.color}22`,
            }}
          >
            <stat.icon size={16} style={{ color: stat.color }} />
            <div>
              <div style={{ color: stat.color, fontWeight: 700, fontSize: 16, lineHeight: '20px' }}>
                {stat.count}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: 11, lineHeight: '14px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* React Flow canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1a1a2e" gap={20} size={1} />
          <Controls
            style={{
              background: '#16161f',
              border: '1px solid #2a2a3e',
              borderRadius: 8,
            }}
          />
          <MiniMap
            nodeColor="#3a3a4e"
            maskColor="rgba(0,0,0,0.7)"
            style={{
              background: '#16161f',
              border: '1px solid #2a2a3e',
              borderRadius: 8,
            }}
          />
        </ReactFlow>

        {/* Inject background style */}
        <style>{`.react-flow__background { background: #0a0a0f; }`}</style>
      </div>
    </div>
  );
}
