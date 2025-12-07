// storage.js

const DB_KEY = "cbse_paper_history";

function savePaper(paperData, criteria) {
    const history = getHistory();
    
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        criteria: criteria,
        questions: paperData.map(q => q.id),
        starred: false // Default state
    };

    history.unshift(record); // Add to top

    // Logic: Keep max 10 items, BUT do not delete Starred items.
    // Filter out unstarred items if count > 10
    if (history.length > 10) {
        // Find index of last unstarred item to remove
        for (let i = history.length - 1; i >= 0; i--) {
            if (!history[i].starred) {
                history.splice(i, 1);
                break;
            }
        }
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(history));
    renderHistoryTable(); 
}

function getHistory() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function toggleStar(id) {
    let history = getHistory();
    const paper = history.find(p => p.id === id);
    if(paper) {
        paper.starred = !paper.starred;
        // Sort: Starred first, then by Date (Newest first)
        history.sort((a, b) => (b.starred - a.starred) || (b.id - a.id));
        localStorage.setItem(DB_KEY, JSON.stringify(history));
        renderHistoryTable();
    }
}

function deletePaper(id) {
    if(!confirm("Delete this paper?")) return;
    let history = getHistory();
    history = history.filter(p => p.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(history));
    renderHistoryTable();
}

function clearHistory() {
    if(confirm("Delete all history? (Starred papers will be kept)")) {
        let history = getHistory();
        // Only keep starred
        const saved = history.filter(p => p.starred);
        localStorage.setItem(DB_KEY, JSON.stringify(saved));
        renderHistoryTable();
    }
}