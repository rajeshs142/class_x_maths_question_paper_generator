// generator.js

function getRandom(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function filterBySource(questions, sources) {
    return questions.filter(q => {
        return q.source.some(s => sources.includes(s));
    });
}

function generateBoardPaper(allData, selectedSources) {
    let paper = [];
    
    // Separate pools for standard questions and AR questions
    let pool = {
        '1m': [], '2m': [], '3m': [], '5m': [], '4m': [], 'ar': []
    };

    // 1. Collect questions from all chapters
    allData.forEach(chapterData => {
        // Filter by source first
        let availableQuestions = filterBySource(chapterData.questions, selectedSources);
        
        // Fallback to all questions if filtered pool is empty to prevent crashes
        if(availableQuestions.length === 0) {
            availableQuestions = chapterData.questions;
        }

        // Separate Assertion-Reason questions immediately
        const arQuestions = availableQuestions.filter(q => q.type === 'assertion_reason');
        pool['ar'].push(...arQuestions);

        // Collect other questions based on Blueprint
        // We find the blueprint rule for this chapter
        const rule = BOARD_BLUEPRINT.find(r => r.chapter === chapterData.chapter_name);
        
        if (rule) {
            for (const [marks, count] of Object.entries(rule.breakdown)) {
                if (count > 0) {
                    // Filter candidates for this mark category
                    // Crucial: Exclude AR questions from the '1m' pool here, we handle them separately
                    const candidates = availableQuestions.filter(q => q.marks == marks && q.type !== 'assertion_reason');
                    
                    // Pick random questions based on blueprint count
                    // Note: For 1M, we might pick fewer if some slots are reserved for AR, 
                    // but usually ARs are *additional* to the standard 18 MCQs in a 20Q section.
                    // The standard pattern is 18 MCQs + 2 ARs = 20 Total.
                    // If blueprint says "3" for 1M, we take 3 MCQs. 
                    // We will forcefully append 2 ARs at the end of Section A regardless of chapter distribution.
                    
                    const picked = getRandom(candidates, count);
                    pool[marks + 'm'].push(...picked);
                }
            }
        }
    });

    // 2. Construct Section A (1 Mark)
    // Constraint: 18 MCQs + 2 ARs (Total 20)
    
    let sectionA_MCQs = pool['1m'];
    
    // If we have more than 18 MCQs selected by blueprint, trim to 18 to make room for AR
    if (sectionA_MCQs.length > 18) {
        sectionA_MCQs = getRandom(sectionA_MCQs, 18);
    } 
    // If we have fewer than 18, we just keep what we have (or could try to fetch more, but let's stick to blueprint)

    // Select exactly 2 Assertion-Reason questions from the global AR pool
    let finalARs = [];
    if (pool['ar'].length >= 2) {
        finalARs = getRandom(pool['ar'], 2);
    } else {
        // Fallback: If not enough ARs in selected source, try ALL sources
        const allARs = [];
        allData.forEach(ch => {
            allARs.push(...ch.questions.filter(q => q.type === 'assertion_reason'));
        });
        finalARs = getRandom(allARs, 2);
    }

    // Combine for Section A
    // MCQs first (Q1-18), then ARs (Q19-20)
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
        const validQuestions = ch.questions.filter(q => {
            const sourceMatch = q.source.some(s => selectedSources.includes(s));
            const qMark = parseInt(q.marks);
            const markMatch = allowedMarks.includes(qMark);
            return sourceMatch && markMatch;
        });
        pool.push(...validQuestions);
    });

    if(pool.length === 0) return [];

    pool.sort(() => 0.5 - Math.random());

    for (let q of pool) {
        if (currentMarks >= totalMarks) break;

        if (!paper.some(p => p.id === q.id)) {
            const qMark = parseInt(q.marks);
            if ((currentMarks + qMark <= totalMarks) || (currentMarks < totalMarks && (currentMarks + qMark - totalMarks) <= 2)) {
                paper.push(q);
                currentMarks += qMark;
            }
        }
    }
    
    // Sort custom paper by marks
    paper.sort((a, b) => a.marks - b.marks);

    return paper;
}