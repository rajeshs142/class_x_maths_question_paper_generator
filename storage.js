// storage.js

const DB_KEY = "cbse_paper_history";

function savePaper(paperData, criteria) {
    const history = getHistory();
    
    const record = {
        id: Date.now(), // Unique timestamp ID
        date: new Date().toLocaleString(),
        criteria: criteria, // e.g., "Board Mock" or "Ch 1, 2 (20 Marks)"
        questions: paperData.map(q => q.id) // Store only IDs
    };

    history.unshift(record); // Add to top
    if (history.length > 10) history.pop(); // Keep last 10 only
    
    localStorage.setItem(DB_KEY, JSON.stringify(history));
    renderHistoryTable();
}

function getHistory() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function loadPaperFromHistory(id) {
    const history = getHistory();
    const paper = history.find(p => p.id === id);
    if(paper) {
        // We need to fetch full question objects from the IDs
        // This requires access to the global 'allQuestions' array (handled in script.js)
        window.loadPaperByIds(paper.questions, paper.criteria);
    }
}

function clearHistory() {
    localStorage.removeItem(DB_KEY);
    renderHistoryTable();
}