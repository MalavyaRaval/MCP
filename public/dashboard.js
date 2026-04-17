function pingAgent() {
    fetch('/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'message', target: 'agent-1', payload: 'Ping from Dashboard' })
    }).then(res => res.json()).then(data => {
        const log = document.getElementById('log');
        log.innerHTML += `<p>Dispatched: ${data.timestamp}</p>`;
    });
}
