import * as net from 'net';

export class AgentCommunication {
  private server: net.Server;
  private connections: Map<string, net.Socket> = new Map();

  constructor(port: number) {
    this.server = net.createServer((socket) => {
      let agentId = '';
      
      socket.on('data', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'handshake') {
            agentId = msg.agentId;
            this.connections.set(agentId, socket);
            console.log(`TCP channel established with agent: ${agentId}`);
            socket.write(JSON.stringify({ type: 'ack', id: msg.id }));
          } else if (msg.type === 'message') {
            console.log(`Message received from ${agentId}:`, msg);
            socket.write(JSON.stringify({ type: 'ack', id: msg.id }));
          }
        } catch (e) {
          console.error('TCP Communication Error:', e);
        }
      });

      socket.on('close', () => {
        if (agentId) this.connections.delete(agentId);
      });
    });
    this.server.listen(port, () => console.log(`TCP Server listening on port ${port}`));
  }

  send(targetAgentId: string, message: any) {
    const socket = this.connections.get(targetAgentId);
    if (socket) {
      // Basic retry logic wrapper would go here in production
      socket.write(JSON.stringify({ ...message, id: Date.now() }));
    } else {
      console.error(`Failed to send to ${targetAgentId}: Connection not found.`);
    }
  }
}
