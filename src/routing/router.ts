import { WebSocketServer, WebSocket } from 'ws';

export class AgentRouter {
  private wss: WebSocketServer;
  private connectedAgents: Map<string, WebSocket> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.init();
    console.log(`Router listening on port ${port}`);
  }

  private init() {
    this.wss.on('connection', (ws, req) => {
      const agentId = req.headers['x-agent-id'] as string || `agent-${Date.now()}`;
      this.connectedAgents.set(agentId, ws);
      console.log(`Agent ${agentId} connected to router.`);

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
        console.log(`Agent ${agentId} disconnected.`);
      });
    });
  }

  private routeDecision(message: any, senderId: string) {
    console.log(`Routing decision from ${senderId}:`, message.type);
    // Logic for directing decisions to other agents
    if (message.target && this.connectedAgents.has(message.target)) {
      this.connectedAgents.get(message.target)?.send(JSON.stringify(message));
    }
  }
}
