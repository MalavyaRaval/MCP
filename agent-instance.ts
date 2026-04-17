import WebSocket from 'ws';
import * as net from 'net';

const AGENT_ID = process.argv[2] || 'agent-' + Math.floor(Math.random() * 1000);

// 1. Connect to Router
const ws = new WebSocket('ws://localhost:8080', { headers: { 'x-agent-id': AGENT_ID } });
ws.on('open', () => {
    console.log(`[${AGENT_ID}] Connected to Router`);
    // Send a sample decision
    ws.send(JSON.stringify({ type: 'decision', target: 'agent-target', payload: 'task-complete' }));
});

// 2. Connect to TCP Channel
const client = net.createConnection({ port: 9090 }, () => {
    console.log(`[${AGENT_ID}] Connected to TCP Channel`);
    client.write(JSON.stringify({ type: 'handshake', agentId: AGENT_ID, id: Date.now() }));
});

client.on('data', (data) => {
    const msg = JSON.parse(data.toString());
    console.log(`[${AGENT_ID}] Received TCP message:`, msg);
});
