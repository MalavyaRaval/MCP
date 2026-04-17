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
            list.innerHTML = data.agents.map((id) => `<li>${id}</li>`).join('');
        }
    } catch (err) {
        console.error('Error fetching agents:', err);
    }
}

window.pingAgent = function() {
    const input = document.getElementById('agent-input') as HTMLInputElement;
    const target = input.value || 'agent-1';
    
    fetch('/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', target: target, payload: 'Ping from Dashboard' })
    })
    .then(res => res.json())
    .then(data => {
        const log = document.getElementById('log');
        if (log) {
            log.innerHTML += `<p>Dispatched to ${target}: ${data.timestamp}</p>`;
        }
    })
    .catch(err => console.error('Ping error:', err));
}
