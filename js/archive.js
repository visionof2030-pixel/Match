// ============================================================
//  أرشيف المباريات
// ============================================================

function toggleArchive() {
    const section = document.getElementById('archiveSection');
    const container = document.getElementById('archiveContainer');
    const countSpan = document.getElementById('archiveCount');

    if (section.classList.contains('visible')) {
        section.classList.remove('visible');
        return;
    }

    section.classList.add('visible');
    container.innerHTML = `<div class="duplicates-empty">⏳ جاري تحميل الأرشيف...</div>`;

    const games = state.previousGamesData || [];
    if (games.length === 0) {
        container.innerHTML = `<div class="duplicates-empty">📭 لا توجد مباريات منتهية</div>`;
        countSpan.textContent = '0';
        return;
    }

    const predictions = state.predictions || [];
    const archiveData = games.map(game => {
        const matchPredictions = predictions.filter(p => {
            const parts = p.match_id ? p.match_id.split('_') : [];
            if (parts.length < 3) return false;
            return (parts[1] === game.homeAr && parts[2] === game.awayAr) ||
                (parts[1] === game.awayAr && parts[2] === game.homeAr);
        });

        let correct = 0,
            wrong = 0;
        const result = findMatchResult(game.homeAr, game.awayAr);
        let winner = null;
        if (result) {
            winner = determineWinner(result);
        }

        for (let p of matchPredictions) {
            if (winner === null && result) {
                // تعادل
                if (p.prediction === 'DRAW') correct++;
                else wrong++;
            } else if (winner) {
                if (p.prediction === winner) correct++;
                else wrong++;
            }
        }

        return {
            ...game,
            correct,
            wrong,
            total: matchPredictions.length,
            accuracy: matchPredictions.length > 0 ? Math.round((correct / matchPredictions.length) * 100) : 0
        };
    });

    archiveData.sort((a, b) => (b.correct + b.wrong) - (a.correct + a.wrong));
    countSpan.textContent = archiveData.length;

    let html = `<div class="archive-summary">
        <span class="item">📊 إجمالي المباريات: <strong>${archiveData.length}</strong></span>
        <span class="item">✅ إجمالي التوقعات الصحيحة: <strong class="highlight">${archiveData.reduce((sum, m) => sum + m.correct, 0)}</strong></span>
        <span class="item">📈 متوسط الدقة: <strong class="highlight">${Math.round(archiveData.reduce((sum, m) => sum + m.accuracy, 0) / archiveData.length)}%</strong></span>
    </div>
    <div class="archive-list">`;

    archiveData.forEach(m => {
        let penaltyHtml = '';
        if (m.hadPenalties && m.homePenalty !== null && m.awayPenalty !== null) {
            penaltyHtml =
                `<span class="score-penalty-badge">⚽ ركلات ترجيح: ${m.homePenalty} — ${m.awayPenalty}</span>`;
        }
        html += `
            <div class="archive-item" onclick="openPreviousMatchPredictions('${m.homeAr}', '${m.awayAr}', ${m.homeScore}, ${m.awayScore})">
                <div class="match-info">
                    <span class="flag">${getFlag(m.homeAr)}</span> ${m.homeAr}
                    <span class="score">${m.homeScore} - ${m.awayScore} ${penaltyHtml}</span>
                    <span class="flag">${getFlag(m.awayAr)}</span> ${m.awayAr}
                </div>
                <div class="stats">
                    <span class="correct">✅ ${m.correct}</span>
                    <span class="wrong">❌ ${m.wrong}</span>
                    <span class="accuracy">${m.accuracy}%</span>
                    <span style="color:var(--text-secondary);font-size:0.6rem;">${m.total} توقع</span>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}