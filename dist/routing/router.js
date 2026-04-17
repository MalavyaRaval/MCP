"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRouter = void 0;
const ws_1 = require("ws");
class AgentRouter {
    constructor(port) {
        this.connectedAgents = new Map();
        // Callback to notify dashboard
        this.onAgentUpdate = () => { };
        this.wss = new ws_1.WebSocketServer({ port });
        this.init();
        console.log(`Router listening on port ${port}`);
    }
    init() {
        this.wss.on('connection', (ws, req) => {
            const agentId = req.headers['x-agent-id'] || `agent-${Date.now()}`;
            this.connectedAgents.set(agentId, ws);
            this.notifyUpdate();
            console.log(`Agent ${agentId} connected.`);
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.routeDecision(message, agentId);
                }
                catch (e) {
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
    notifyUpdate() {
        this.onAgentUpdate(Array.from(this.connectedAgents.keys()));
    }
    routeDecision(message, senderId) {
        if (message.target && this.connectedAgents.has(message.target)) {
            this.connectedAgents.get(message.target)?.send(JSON.stringify(message));
        }
    }
    getAgents() {
        return Array.from(this.connectedAgents.keys());
    }
}
exports.AgentRouter = AgentRouter;
