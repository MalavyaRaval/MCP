// Connect to Orchestrator's WebSocket for live updates
const socket = new WebSocket(`ws://${window.location.host}`);

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data); // Debugging
        if (data.type === 'status') {
            appendLog(`[${data.agentId}] ${data.message}`);
        }
    } catch (err) {
        console.error('Failed to parse WS message:', err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    updateAgentList();
    setInterval(updateAgentList, 5000);
});

async function updateAgentList() {
    try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        const list = document.getElementById('agent-list');
        if (list) {
            list.innerHTML = data.agents.map(id => `<li>${id}</li>`).join('');
        }
    } catch (err) {
        console.error('Error fetching agents:', err);
    }
}

window.pingAgent = function() {
    const input = document.getElementById('agent-input');
    const target = input.value || 'agent-1';
    
    fetch('/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', target: target, payload: 'Ping from Dashboard' })
    })
    .then(res => res.json())
    .then(data => {
        appendLog(`Dispatched to ${target}: ${data.timestamp}`);
    })
    .catch(err => console.error('Ping error:', err));
}

window.runTask = function(taskType) {
    const target = document.getElementById('agent-input').value || 'agent-1';
    
    fetch('/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: taskType, target: target, payload: `Executing ${taskType}` })
    })
    .then(res => res.json())
    .then(data => {
        appendLog(`Task '${taskType}' dispatched to ${target}: ${data.timestamp}`);
    })
    .catch(err => console.error('Task error:', err));
}
