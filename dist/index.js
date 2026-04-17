"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("./routing/router");
const tcp_server_1 = require("./communication/tcp-server");
const orchestrator_1 = require("./api/orchestrator");
// Initialize core components
const router = new router_1.AgentRouter(8080);
const communicator = new tcp_server_1.AgentCommunication(9090);
// Initialize orchestration layer
new orchestrator_1.Orchestrator(router, communicator);
console.log('System initialized: Router(8080), TCP(9090), API(3000)');
