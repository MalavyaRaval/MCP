import WebSocket from 'ws';
import * as net from 'net';

// 1. Connect to Router
const ws = new WebSocket('ws://localhost:8080', { headers: { 'x-agent-id': 'test-agent' } });
ws.on('open', () => console.log('Test Agent: Connected to Router'));

// 2. Connect to TCP Channel
const client = net.createConnection({ port: 9090 }, () => {
  console.log('Test Agent: Connected to TCP Channel');
  client.write(JSON.stringify({ type: 'handshake', agentId: 'test-agent', id: 1 }));
});

client.on('data', (data) => console.log('Test Agent: Received from TCP:', data.toString()));
