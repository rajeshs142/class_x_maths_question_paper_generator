// script.js
// script.js

let ALL_QUESTIONS_DATA = [];
let CURRENT_MODE = 'mock';

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();
    renderChapterList();
    renderHistoryTable();
});

async function loadAllData() {
    try {
        // Load all chapters defined in config.js
        const promises = CHAPTERS.map(ch => fetch(`data/${ch.file}`).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${ch.file}`);
            return res.json();
        }));
        
        ALL_QUESTIONS_DATA = await Promise.all(promises);
        console.log(`Loaded ${ALL_QUESTIONS_DATA.length} chapters.`);
        
    } catch (error) {
        console.error(error);
        alert("Error loading data. 1. Check if JSON files exist in /data folder. 2. Use a local server (Live Server).");
    }
}

function renderChapterList() {
    const container = document.getElementById('chapter-list');
    container.innerHTML = CHAPTERS.map(ch => `
        <label class="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50 transition select-none">
            <input type="checkbox" class="chapter-cb w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" value="${ch.name}" checked>
            <span class="text-sm text-gray-700">${ch.name}</span>
        </label>
    `).join('');
}

function toggleChapters(selectAll) {
    const checkboxes = document.querySelectorAll('.chapter-cb');
    checkboxes.forEach(cb => cb.checked = selectAll);
}

function setMode(mode) {
    CURRENT_MODE = mode;
    const activeClass = "px-6 py-3 font-bold text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 transition-colors";
    const inactiveClass = "px-6 py-3 text-gray-500 hover:text-indigo-600 transition-colors";
    
    document.getElementById('tab-mock').className = mode === 'mock' ? activeClass : inactiveClass;
    document.getElementById('tab-custom').className = mode === 'custom' ? activeClass : inactiveClass;
    
    document.getElementById('panel-mock').style.display = mode === 'mock' ? 'block' : 'none';
    document.getElementById('panel-custom').style.display = mode === 'custom' ? 'block' : 'none';
}

function handleGenerate() {
    if (ALL_QUESTIONS_DATA.length === 0) {
        alert("Data not loaded yet. Please wait or refresh.");
        return;
    }

    const sources = Array.from(document.querySelectorAll('.src-cb:checked')).map(cb => cb.value);
    if (sources.length === 0) { alert("Select at least one Source!"); return; }

    let paper = [];
    let metaText = "";

    if (CURRENT_MODE === 'mock') {
        paper = generateBoardPaper(ALL_QUESTIONS_DATA, sources);
        metaText = `Mode: Board Mock (80M) | Sources: ${sources.join(', ').toUpperCase()} | Date: ${new Date().toLocaleDateString()}`;
        updateHeader(80, 3);
    } else {
        // Custom Mode
        const selectedChapters = Array.from(document.querySelectorAll('.chapter-cb:checked')).map(cb => cb.value);
        if (selectedChapters.length === 0) { alert("Select at least one Chapter!"); return; }
        
        const allowedMarks = Array.from(document.querySelectorAll('.mark-cb:checked')).map(cb => parseInt(cb.value));
        if (allowedMarks.length === 0) { alert("Select at least one Question Type (Marks)!"); return; }

        const targetMarks = parseInt(document.getElementById('custom-marks').value);
        
        paper = generateCustomPaper(ALL_QUESTIONS_DATA, selectedChapters, targetMarks, sources, allowedMarks);
        
        const actualTotal = paper.reduce((sum, q) => sum + parseInt(q.marks), 0);
        
        // Generate Chapter Label
        let chapterText = selectedChapters.length <= 3 ? selectedChapters.join(", ") : `${selectedChapters.slice(0, 2).join(", ")} + ${selectedChapters.length - 2} more`;

        metaText = `Test: ${chapterText} | Marks: ${actualTotal} | Types: ${allowedMarks.join(', ')}M`;
        
        const timeHrs = (actualTotal * 2.5) / 60;
        const roundedTime = (Math.ceil(timeHrs * 4) / 4).toFixed(2).replace('.00', '');
        updateHeader(actualTotal, roundedTime);
    }

    if (paper.length === 0) {
        alert("No questions found! Try selecting 'NCERT + PYQ + SSM' or more chapters.");
        return;
    }

    renderPaper(paper);
    savePaper(paper, metaText);
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('paper-view').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('paper-meta').innerText = metaText;
}

function updateHeader(marks, hours) {
    document.getElementById('paper-marks').innerText = `Max Marks: ${marks}`;
    document.getElementById('paper-time').innerText = `Time: ${hours} Hours`;
}

function renderPaper(paperQuestions) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    const answerContainer = document.getElementById('answer-list');
    answerContainer.innerHTML = '';

    const sections = {
        'SECTION A (1 Mark)': paperQuestions.filter(q => q.marks == 1),
        'SECTION B (2 Marks)': paperQuestions.filter(q => q.marks == 2),
        'SECTION C (3 Marks)': paperQuestions.filter(q => q.marks == 3),
        'SECTION D (5 Marks)': paperQuestions.filter(q => q.marks == 5),
        'SECTION E (Case Study - 4 Marks)': paperQuestions.filter(q => q.marks == 4)
    };

    let qNum = 1;

    for (const [title, qs] of Object.entries(sections)) {
        if (qs.length === 0) continue;

        // Section Header
        const secHeader = document.createElement('div');
        secHeader.className = "font-bold text-center text-lg mt-8 mb-6 border-b-2 border-gray-800 pb-1 uppercase tracking-wide break-inside-avoid";
        secHeader.innerText = title;
        container.appendChild(secHeader);

        const ansHeader = document.createElement('div');
        ansHeader.className = "font-bold mt-4 mb-2 text-lg border-b border-gray-300";
        ansHeader.innerText = title;
        answerContainer.appendChild(ansHeader);

        qs.forEach(q => {
            // Question Render
            const qDiv = document.createElement('div');
            qDiv.className = "mb-6 break-inside-avoid flex justify-between items-start group";
            
            const sourceText = q.source ? q.source.map(s => s.replace(/_/g, ' ').toUpperCase()).join(', ') : '';

            let content = `
            <div class="flex gap-3 w-full">
                <span class="font-bold text-lg min-w-[25px]">${qNum}.</span>
                <div class="flex-1 text-base leading-relaxed">
                    <p class="font-serif text-gray-900">${q.text.replace(/\n/g, '<br>')}</p>`;

            if (q.image) {
                content += `<img src="${q.image}" class="mt-4 max-w-[90%] md:max-w-[300px] h-auto border border-gray-200 p-1 rounded block">`;
            }

            // MCQ Options
            if (q.type === 'mcq' || q.type === 'assertion_reason') {
                content += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-3 ml-1 font-serif text-sm">`;
                if(q.options) {
                    q.options.forEach((opt, index) => {
                        const label = String.fromCharCode(97 + index); 
                        content += `<div class="flex gap-2">
                            <span class="font-bold">(${label})</span>
                            <span>${opt}</span>
                        </div>`;
                    });
                }
                content += `</div>`;
            }

            content += `</div>
            </div>
            
            <!-- Source Tag (Marks removed) -->
            <div class="flex flex-col items-end ml-4 min-w-[70px]">
                <span class="text-[10px] text-gray-400 mt-1 text-right leading-tight italic source-tag select-none">
                    [${sourceText}]
                </span>
            </div>`;

            qDiv.innerHTML = content;
            container.appendChild(qDiv);

            // Answer Render
            const ansDiv = document.createElement('div');
            ansDiv.className = "mb-3 text-sm border-b border-gray-100 pb-2 break-inside-avoid";
            ansDiv.innerHTML = `
                <div class="flex gap-2">
                    <strong class="text-indigo-700 min-w-[25px]">${qNum}.</strong>
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">${q.answer}</div>
                        ${q.explanation ? `<div class="text-gray-500 text-xs mt-1 italic">Hint: ${q.explanation}</div>` : ''}
                    </div>
                </div>`;
            answerContainer.appendChild(ansDiv);

            qNum++;
        });
    }
}

// 8. Toggle Answers
function toggleAnswers() {
    const ans = document.getElementById('answer-key-container');
    ans.classList.toggle('hidden');
    if (!ans.classList.contains('hidden')) {
        ans.scrollIntoView({ behavior: 'smooth' });
    }
}

// 9. Load Paper from History (Restores a saved paper)
window.loadPaperByIds = function(ids, criteria) {
    // Find questions from ALL_QUESTIONS_DATA
    let paper = [];
    ALL_QUESTIONS_DATA.forEach(ch => {
        const found = ch.questions.filter(q => ids.includes(q.id));
        paper.push(...found);
    });

    // Sort to maintain section order (1m -> 5m)
    paper.sort((a, b) => a.marks - b.marks);

    renderPaper(paper);
    
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('paper-view').classList.remove('hidden');
    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('paper-meta').innerText = criteria;
}

// 10. History Table Renderer
function renderHistoryTable() {
    const history = getHistory(); 
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';

    if(history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400">No history yet.</td></tr>`;
        return;
    }

    history.forEach(rec => {
        const starClass = rec.starred ? "text-yellow-400 fill-current" : "text-gray-300 hover:text-yellow-400";
        const rowBg = rec.starred ? "bg-yellow-50" : "hover:bg-gray-50";

        // Format Date: "Oct 24, 2023, 10:45 AM"
        const dateObj = new Date(rec.id); // ID is timestamp, accurate source
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const fullDateTime = `${dateStr}, <span class="text-gray-400 text-[10px]">${timeStr}</span>`;

        const row = `
            <tr class="border-b ${rowBg} transition">
                <td class="p-2 w-8 text-center">
                    <button onclick="toggleStar(${rec.id})" title="${rec.starred ? 'Unstar' : 'Star this paper'}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${starClass}" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                </td>
                
                <!-- Date & Time Column -->
                <td class="p-2 text-xs font-mono text-gray-600 whitespace-nowrap">${fullDateTime}</td>
                
                <td class="p-2 font-medium text-gray-700 text-xs truncate max-w-xs" title="${rec.criteria}">${rec.criteria}</td>
                
                <td class="p-2 flex items-center gap-3">
                    <button onclick="loadPaperFromHistory(${rec.id})" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-wider">View</button>
                    <button onclick="deletePaper(${rec.id})" class="text-red-400 hover:text-red-600" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}