import { AgentRouter } from './routing/router';
import { AgentCommunication } from './communication/tcp-server';
import { Orchestrator } from './api/orchestrator';

// Initialize core components
const router = new AgentRouter(8080);
const communicator = new AgentCommunication(9090);

// Initialize orchestration layer
new Orchestrator(router, communicator);

console.log('System initialized: Router(8080), TCP(9090), API(3000)');
