'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Activity,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Clock,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Smartphone,
  Monitor,
  Settings,
  Zap
} from 'lucide-react';

interface GatewayStatus {
  online: boolean;
  version: string;
  uptime: number;
  hostname: string;
  model: string;
  thinkingMode: string;
  channel: string;
  lastPing: string;
}

interface NodeStatus {
  id: string;
  name: string;
  type: 'phone' | 'desktop' | 'server';
  online: boolean;
  lastSeen: string;
  os?: string;
  capabilities?: string[];
}

interface ConfigInfo {
  model: string;
  thinkingMode: string;
  channel: string;
  workspaceDir: string;
  capabilities: string[];
}

export default function StatusPage() {
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setGateway(data.gateway);
        setNodes(data.nodes || []);
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError('Failed to connect to gateway');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getNodeIcon = (type: NodeStatus['type']) => {
    switch (type) {
      case 'phone': return Smartphone;
      case 'desktop': return Monitor;
      default: return Server;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
            <Activity className="w-5 h-5 text-accent-green" />
            System Status
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Gateway health, configuration, and connected nodes
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-text-muted ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-accent-red/30 bg-accent-red/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-red">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gateway Status */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-accent-purple" />
          Gateway
        </h2>
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="text-center py-4 text-text-muted">Loading gateway status...</div>
            ) : gateway ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {gateway.online ? (
                    <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-accent-green" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center">
                      <WifiOff className="w-5 h-5 text-accent-red" />
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-text-tertiary">Status</span>
                    <p className={`text-sm font-semibold ${gateway.online ? 'text-accent-green' : 'text-accent-red'}`}>
                      {gateway.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Version</span>
                    <p className="text-sm font-semibold text-text-primary">{gateway.version}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-yellow/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent-yellow" />
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Uptime</span>
                    <p className="text-sm font-semibold text-text-primary">{formatUptime(gateway.uptime)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Host</span>
                    <p className="text-sm font-semibold text-text-primary truncate max-w-[120px]">
                      {gateway.hostname}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-text-muted">
                Unable to fetch gateway status
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4 text-accent-blue" />
          Configuration
        </h2>
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="text-center py-4 text-text-muted">Loading configuration...</div>
            ) : config ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-bg-secondary rounded-lg p-3">
                  <span className="text-xs text-text-tertiary">Model</span>
                  <p className="text-sm font-medium text-text-primary mt-1">{config.model}</p>
                </div>
                <div className="bg-bg-secondary rounded-lg p-3">
                  <span className="text-xs text-text-tertiary">Thinking Mode</span>
                  <p className="text-sm font-medium text-text-primary mt-1 capitalize">{config.thinkingMode}</p>
                </div>
                <div className="bg-bg-secondary rounded-lg p-3">
                  <span className="text-xs text-text-tertiary">Channel</span>
                  <p className="text-sm font-medium text-text-primary mt-1 capitalize">{config.channel}</p>
                </div>
                <div className="bg-bg-secondary rounded-lg p-3">
                  <span className="text-xs text-text-tertiary">Workspace</span>
                  <p className="text-sm font-medium text-text-primary mt-1 font-mono text-xs truncate">
                    {config.workspaceDir}
                  </p>
                </div>
                {config.capabilities && config.capabilities.length > 0 && (
                  <div className="bg-bg-secondary rounded-lg p-3 md:col-span-2">
                    <span className="text-xs text-text-tertiary">Capabilities</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.capabilities.map((cap, i) => (
                        <Badge key={i} variant="default" size="sm">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-text-muted">
                Unable to fetch configuration
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nodes */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-yellow" />
          Connected Nodes
        </h2>
        {nodes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-30" />
              <p className="text-sm text-text-tertiary">No nodes connected</p>
              <p className="text-xs text-text-muted mt-1">
                Pair a device using the OpenClaw mobile app
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(node => {
              const Icon = getNodeIcon(node.type);
              return (
                <Card key={node.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        node.online ? 'bg-accent-green/20' : 'bg-bg-tertiary'
                      }`}>
                        <Icon className={`w-5 h-5 ${node.online ? 'text-accent-green' : 'text-text-muted'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {node.name}
                          </span>
                          {node.online ? (
                            <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-text-muted flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {node.os || node.type} • Last seen {new Date(node.lastSeen).toLocaleTimeString()}
                        </p>
                        {node.capabilities && node.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {node.capabilities.slice(0, 3).map((cap, i) => (
                              <Badge key={i} variant="default" size="sm">{cap}</Badge>
                            ))}
                            {node.capabilities.length > 3 && (
                              <Badge variant="default" size="sm">+{node.capabilities.length - 3}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
