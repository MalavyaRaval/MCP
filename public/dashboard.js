document.addEventListener('DOMContentLoaded', () => {
    updateAgentList();
    setInterval(updateAgentList, 5000);
});

function updateAgentList() {
    fetch('/api/agents')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('agent-list');
            if (list) {
                list.innerHTML = data.agents.map((id: string) => `<li>${id}</li>`).join('');
            }
        });
}

function pingAgent() {
    const target = (document.getElementById('agent-input') as HTMLInputElement).value || 'agent-1';
    fetch('/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', target: target, payload: 'Ping from Dashboard' })
    }).then(res => res.json()).then(data => {
        const log = document.getElementById('log');
        if (log) {
            log.innerHTML += `<p>Dispatched to ${target}: ${data.timestamp}</p>`;
        }
    });
}
