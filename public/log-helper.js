// Add to dashboard.js to handle logging
function appendLog(message) {
    const log = document.getElementById('log');
    if (log) {
        log.innerHTML += `<p>${new Date().toLocaleTimeString()}: ${message}</p>`;
        log.scrollTop = log.scrollHeight; // Auto-scroll
    }
}
