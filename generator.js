// generator.js

function getRandom(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Check if a question matches ANY of the selected sources
function filterBySource(questions, sources) {
    return questions.filter(q => {
        return q.source.some(s => sources.includes(s));
    });
}

function generateBoardPaper(allData, selectedSources) {
    let paper = [];
    
    // Pools to hold questions before organizing them into sections
    let pool = {
        '1m': [], '2m': [], '3m': [], '5m': [], '4m': [], 'ar': []
    };

    // 1. Iterate through the Blueprint
    BOARD_BLUEPRINT.forEach(rule => {
        const chapterData = allData.find(ch => ch.chapter_name === rule.chapter);
        
        if (!chapterData) {
            console.error(`Missing Chapter Data: ${rule.chapter}`);
            return;
        }

        // 1. Get questions from SELECTED sources first
        const sourceFilteredQuestions = filterBySource(chapterData.questions, selectedSources);

        for (const [marks, count] of Object.entries(rule.breakdown)) {
            if (count > 0) {
                // --- STRATEGY: Try Selected Source -> Fallback to All Sources ---

                // Step A: Try Selected Sources
                let candidates = sourceFilteredQuestions.filter(q => q.marks == marks);

                // Exclude AR from standard 1M pool
                if (marks == 1) {
                    candidates = candidates.filter(q => q.type !== 'assertion_reason');
                }

                // Step B: FALLBACK if not enough questions
                if (candidates.length < count) {
                    console.warn(`[Fallback] ${rule.chapter}: Not enough ${marks}M Qs in ${selectedSources}. Searching ALL sources.`);
                    
                    let allSourceCandidates = chapterData.questions.filter(q => q.marks == marks);
                    
                    if (marks == 1) {
                        allSourceCandidates = allSourceCandidates.filter(q => q.type !== 'assertion_reason');
                    }
                    
                    // Use the full pool
                    candidates = allSourceCandidates;
                }

                // Step C: Pick Random
                const picked = getRandom(candidates, count);
                pool[marks + 'm'].push(...picked);
            }
        }

        // Special Collection for Assertion-Reason (Collect from ALL sources to be safe)
        const arCandidates = chapterData.questions.filter(q => q.type === 'assertion_reason');
        pool['ar'].push(...arCandidates);
    });

    // 2. Construct Section A (18 MCQs + 2 ARs)
    let sectionA_MCQs = pool['1m'];
    
    // Trim to 18
    if (sectionA_MCQs.length > 18) {
        sectionA_MCQs = getRandom(sectionA_MCQs, 18);
    }

    // Select exactly 2 ARs
    let finalARs = [];
    if (pool['ar'].length >= 2) {
        // Try to prefer selected sources
        let preferredAR = filterBySource(pool['ar'], selectedSources);
        if (preferredAR.length >= 2) {
             finalARs = getRandom(preferredAR, 2);
        } else {
             finalARs = getRandom(pool['ar'], 2);
        }
    }

    paper.push(...sectionA_MCQs);
    paper.push(...finalARs);

    // 3. Add remaining sections
    paper.push(...pool['2m']);
    paper.push(...pool['3m']);
    paper.push(...pool['5m']);
    paper.push(...pool['4m']);

    return paper;
}

function generateCustomPaper(allData, chapterNames, totalMarks, selectedSources, allowedMarks) {
    let paper = [];
    let currentMarks = 0;
    
    const activeChapters = allData.filter(ch => chapterNames.includes(ch.chapter_name));
    
    if(activeChapters.length === 0) return [];

    let pool = [];
    activeChapters.forEach(ch => {
        // Apply Fallback logic here too? 
        // For custom, we usually respect the filter strictly, but we can be lenient.
        
        let validQuestions = ch.questions.filter(q => {
            const sourceMatch = q.source.some(s => selectedSources.includes(s));
            const qMark = parseInt(q.marks);
            const markMatch = allowedMarks.includes(qMark);
            return sourceMatch && markMatch;
        });

        // If Custom Mode yields ZERO questions for a chapter because of source, 
        // we can optionally fallback. For now, let's keep Custom strict.
        pool.push(...validQuestions);
    });

    if(pool.length === 0) return [];

    pool.sort(() => 0.5 - Math.random());

    for (let q of pool) {
        if (currentMarks >= totalMarks) break;

        if (!paper.some(p => p.id === q.id)) {
            const qMark = parseInt(q.marks);
            // Allow slight overflow (up to 3 marks) to fit big questions at the end
            if ((currentMarks + qMark <= totalMarks) || (currentMarks < totalMarks && (currentMarks + qMark - totalMarks) <= 3)) {
                paper.push(q);
                currentMarks += qMark;
            }
        }
    }
    
    paper.sort((a, b) => a.marks - b.marks);
    return paper;
}