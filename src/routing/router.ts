import { WebSocketServer, WebSocket } from 'ws';

export class AgentRouter {
  private wss: WebSocketServer;
  private connectedAgents: Map<string, WebSocket> = new Map();
  // Callback to notify dashboard
  public onAgentUpdate: (agents: string[]) => void = () => {};

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.init();
    console.log(`Router listening on port ${port}`);
  }

  private init() {
    this.wss.on('connection', (ws, req) => {
      const agentId = req.headers['x-agent-id'] as string || `agent-${Date.now()}`;
      this.connectedAgents.set(agentId, ws);
      this.notifyUpdate();
      console.log(`Agent ${agentId} connected.`);

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.routeDecision(message, agentId);
        } catch (e) {
          console.error('Failed to parse decision message:', e);
        }
      });

      ws.on('close', () => {
        this.connectedAgents.delete(agentId);
        this.notifyUpdate();
        console.log(`Agent ${agentId} disconnected.`);
      });
    });
  }

  private notifyUpdate() {
    this.onAgentUpdate(Array.from(this.connectedAgents.keys()));
  }

  private routeDecision(message: any, senderId: string) {
    if (message.target && this.connectedAgents.has(message.target)) {
      this.connectedAgents.get(message.target)?.send(JSON.stringify(message));
    }
  }

  public getAgents(): string[] {
    return Array.from(this.connectedAgents.keys());
  }
}
