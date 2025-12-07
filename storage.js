// storage.js
const DB_KEY = "cbse_paper_history";

// --- CORE DATA OPERATIONS ---

function getHistoryData() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function saveHistoryData(historyArray) {
    localStorage.setItem(DB_KEY, JSON.stringify(historyArray));
}

function addPaperToHistory(paperData, criteria) {
    const history = getHistoryData();
    
    const record = {
        id: Date.now(),
        date: new Date().toISOString(), // Standard ISO format for data
        criteria: criteria,
        questions: paperData.map(q => q.id),
        starred: false
    };

    history.unshift(record);

    // Keep max 10 items, but preserve starred ones
    if (history.length > 10) {
        for (let i = history.length - 1; i >= 0; i--) {
            if (!history[i].starred) {
                history.splice(i, 1);
                break;
            }
        }
    }
    
    saveHistoryData(history);
}