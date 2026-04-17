// Add to dashboard.js to handle logging
function appendLog(message) {
    const log = document.getElementById('log');
    if (log) {
        log.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${message}</p>`;
        log.scrollTop = log.scrollHeight; // Auto-scroll
    }
}

// Update fetch in pingAgent to log success
// (Replace the existing fetch .then block in dashboard.js)
    .then(data => appendLog(`Dispatched to ${target}: ${data.timestamp}`))
