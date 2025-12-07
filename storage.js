// storage.js

const DB_KEY = "cbse_paper_history";

function savePaper(paperData, criteria) {
    const history = getHistory();
    
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        criteria: criteria,
        questions: paperData.map(q => q.id)
    };

    history.unshift(record);
    if (history.length > 10) history.pop();
    
    localStorage.setItem(DB_KEY, JSON.stringify(history));
    renderHistoryTable(); // Update UI immediately
}

function getHistory() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function deletePaper(id) {
    if(!confirm("Are you sure you want to delete this paper from history?")) return;

    let history = getHistory();
    // Filter out the ID to delete
    history = history.filter(p => p.id !== id);
    
    localStorage.setItem(DB_KEY, JSON.stringify(history));
    renderHistoryTable(); // Update UI immediately
}

function clearHistory() {
    if(confirm("Delete entire history?")) {
        localStorage.removeItem(DB_KEY);
        renderHistoryTable();
    }
}