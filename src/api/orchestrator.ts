import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { AgentRouter } from '../routing/router';
import { AgentCommunication } from '../communication/tcp-server';
import path from 'path';

export class Orchestrator {
  private app = express();
  private server = http.createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  private router: AgentRouter;
  private communicator: AgentCommunication;

  constructor(router: AgentRouter, communicator: AgentCommunication) {
    this.router = router;
    this.communicator = communicator;
    this.setupRoutes();
    this.setupWSS();
  }

  private setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../public')));

    this.app.get('/api/agents', (req, res) => {
      res.json({ agents: this.router.getAgents() });
    });

    this.app.post('/orchestrate', (req, res) => {
      const { action, target, payload } = req.body;
      this.communicator.send(target, { type: action, data: payload });
      res.json({ status: 'dispatched', timestamp: new Date().toISOString() });
    });
  }

  private setupWSS() {
    this.wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        // Forward agent status messages to all connected dashboard clients
        this.wss.clients.forEach(client => {
          if (client.readyState === 1) client.send(data.toString());
        });
      });
    });

    this.server.listen(3000, () => console.log('Orchestrator API running on port 3000'));
  }
}
