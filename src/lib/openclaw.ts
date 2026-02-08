/**
 * OpenClaw Gateway WebSocket Client
 *
 * Connects to the OpenClaw Gateway for agent orchestration,
 * session management, and real-time message streaming.
 */

type EventHandler = (data: unknown) => void;

interface OpenClawSession {
  id: string;
  agent_id: string;
  status: string;
  created_at: string;
}

interface OpenClawMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: unknown[];
}

export class OpenClawClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private handlers: Map<string, EventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: string[] = [];
  private connected = false;

  constructor(url?: string, token?: string) {
    this.url = url || process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
    this.token = token || process.env.OPENCLAW_AUTH_TOKEN || '';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.token ? `${this.url}?token=${this.token}` : this.url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.flushQueue();
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit('message', data);
            if (data.type) {
              this.emit(data.type, data);
            }
          } catch {
            this.emit('raw', event.data);
          }
        };

        this.ws.onclose = () => {
          this.connected = false;
          this.emit('disconnected', {});
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          if (!this.connected) {
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
      this.connect().catch(() => {
        // Will retry via onclose handler
      });
    }, delay);
  }

  private flushQueue(): void {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()!;
      this.ws?.send(msg);
    }
  }

  private send(data: Record<string, unknown>): void {
    const msg = JSON.stringify(data);
    if (this.connected && this.ws) {
      this.ws.send(msg);
    } else {
      this.messageQueue.push(msg);
    }
  }

  // Event emitter
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) handlers.splice(index, 1);
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  // Gateway API methods
  async listSessions(): Promise<OpenClawSession[]> {
    this.send({ method: 'sessions.list' });
    return new Promise((resolve) => {
      const unsub = this.on('sessions.list.result', (data) => {
        unsub();
        resolve(data as OpenClawSession[]);
      });
    });
  }

  async getSessionHistory(sessionId: string): Promise<OpenClawMessage[]> {
    this.send({ method: 'sessions.history', params: { session_id: sessionId } });
    return new Promise((resolve) => {
      const unsub = this.on('sessions.history.result', (data) => {
        unsub();
        resolve(data as OpenClawMessage[]);
      });
    });
  }

  sendMessage(sessionId: string, content: string): void {
    this.send({
      method: 'sessions.send',
      params: { session_id: sessionId, content },
    });
  }

  dispatchTask(agentId: string, task: string, metadata?: Record<string, unknown>): void {
    this.send({
      method: 'tasks.dispatch',
      params: { agent_id: agentId, task, metadata },
    });
  }

  get isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance for use across the app
let clientInstance: OpenClawClient | null = null;

export function getOpenClawClient(): OpenClawClient {
  if (!clientInstance) {
    clientInstance = new OpenClawClient();
  }
  return clientInstance;
}
