import express from 'express';
import { AgentRouter } from '../routing/router';
import { AgentCommunication } from '../communication/tcp-server';
import path from 'path';

export class Orchestrator {
  private app = express();
  private router: AgentRouter;
  private communicator: AgentCommunication;

  constructor(router: AgentRouter, communicator: AgentCommunication) {
    this.router = router;
    this.communicator = communicator;
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use(express.json());
    
    // Serve static dashboard
    this.app.use(express.static(path.join(__dirname, '../../public')));

    this.app.post('/orchestrate', (req, res) => {
      const { action, target, payload } = req.body;
      
      console.log(`Orchestrating action: ${action} for ${target}`);
      this.communicator.send(target, { type: action, data: payload });
      
      res.json({ status: 'dispatched', timestamp: new Date().toISOString() });
    });

    this.app.listen(3000, () => console.log('Orchestrator API running on port 3000'));
  }
}
