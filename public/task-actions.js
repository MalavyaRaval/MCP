// Add these new action functions to dashboard.js

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
