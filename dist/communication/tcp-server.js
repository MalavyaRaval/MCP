"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentCommunication = void 0;
const net = __importStar(require("net"));
class AgentCommunication {
    constructor(port) {
        this.connections = new Map();
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
                    }
                    else if (msg.type === 'message') {
                        console.log(`Message received from ${agentId}:`, msg);
                        socket.write(JSON.stringify({ type: 'ack', id: msg.id }));
                    }
                }
                catch (e) {
                    console.error('TCP Communication Error:', e);
                }
            });
            socket.on('close', () => {
                if (agentId)
                    this.connections.delete(agentId);
            });
        });
        this.server.listen(port, () => console.log(`TCP Server listening on port ${port}`));
    }
    send(targetAgentId, message) {
        const socket = this.connections.get(targetAgentId);
        if (socket) {
            // Basic retry logic wrapper would go here in production
            socket.write(JSON.stringify({ ...message, id: Date.now() }));
        }
        else {
            console.error(`Failed to send to ${targetAgentId}: Connection not found.`);
        }
    }
}
exports.AgentCommunication = AgentCommunication;
