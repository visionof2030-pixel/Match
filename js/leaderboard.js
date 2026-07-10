// ============================================================
//  لوحة المتصدرين
// ============================================================

let currentLeaderboardPeriod = 'all';

function setLeaderboardPeriod(period) {
    currentLeaderboardPeriod = period;
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === period);
    });
    renderLeaderboard(period);
}

async function renderLeaderboard(period) {
    const container = document.getElementById("leaderboardContainer");
    if (!state.loaded) {
        container.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> جاري التحميل...</div>`;
        return;
    }
    
    // جلب أحدث التوقعات
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from("predictions")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(500);
            if (!error && data) {
                state.predictions = data;
            }
        } catch (e) {
            console.warn("⚠️ فشل جلب التوقعات للترتيب:", e);
        }
    }
    
    const predictions = state.predictions || [];
    const games = state.previousGamesData || [];
    if (!predictions.length || !games.length) {
        container.innerHTML = `<div class="empty-state"><span class="icon">📭</span> لا توجد بيانات كافية</div>`;
        return;
    }

    let filteredGames = games;
    if (period === '24h') {
        const nowTime = now();
        const last24h = nowTime - 24 * 60 * 60 * 1000;
        filteredGames = games.filter(g => {
            const ts = g.sortTimestamp || 0;
            return ts >= last24h && ts <= nowTime;
        });
    }

    const scores = {};
    for (let p of predictions) {
        if (!scores[p.user_name]) {
            scores[p.user_name] = { name: p.user_name, points: 0, correct: 0, wrong: 0, total: 0 };
        }
        scores[p.user_name].total++;
        const parts = (p.match_id || "").split("_");
        if (parts.length < 3) continue;
        const team1 = parts[1],
            team2 = parts[2];
        
        // استخدام دالة findMatchResult المحسنة
        const result = findMatchResult(team1, team2);
        let winner = null;
        if (result) {
            winner = determineWinner(result);
        }
        
        // معالجة التعادل
        if (winner === null && result) {
            // المباراة انتهت بالتعادل
            const isCorrect = p.prediction === 'DRAW';
            if (isCorrect) {
                scores[p.user_name].points++;
                scores[p.user_name].correct++;
            } else {
                scores[p.user_name].wrong++;
            }
        } else if (winner) {
            const isCorrect = p.prediction === winner;
            if (isCorrect) {
                scores[p.user_name].points++;
                scores[p.user_name].correct++;
            } else {
                scores[p.user_name].wrong++;
            }
        }
    }
    
    const board = Object.values(scores).sort((a, b) => b.points - a.points || (b.correct - a.correct));
    if (!board.length) {
        container.innerHTML = `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات صحيحة</div>`;
        return;
    }
    document.getElementById('lbTotalPlayers').textContent = board.length;
    document.getElementById('lbTotalPredictions').textContent = predictions.length;

    let rank = 1;
    let i = 0;
    while (i < board.length) {
        let j = i;
        let points = board[i].points;
        while (j < board.length && board[j].points === points) {
            j++;
        }
        const groupSize = j - i;
        for (let k = i; k < j; k++) {
            board[k].rank = rank;
        }
        i = j;
        rank += groupSize;
    }

    const prevRankKey = `prevRank_${period}`;
    let prevRank = {};
    try {
        const raw = localStorage.getItem(prevRankKey);
        if (raw) prevRank = JSON.parse(raw);
    } catch (e) {}

    const currentRank = {};
    board.forEach((p) => {
        currentRank[p.name] = p.rank;
    });
    localStorage.setItem(prevRankKey, JSON.stringify(currentRank));

    const topThree = board.slice(0, 3);
    const rest = board.slice(3, 10);

    let html = '';
    if (topThree.length) {
        const champ = topThree[0];
        const accuracy = champ.total > 0 ? Math.round((champ.correct / champ.total) * 100) : 0;
        const isCurrentUser = champ.name === localStorage.getItem('lastUserName') || '';
        const prevPos = prevRank[champ.name] || 0;
        const currentPos = champ.rank;
        let arrow = '';
        if (prevPos && prevPos !== currentPos) {
            if (currentPos < prevPos) arrow = ' <span class="arrow-up">▲</span>';
            else if (currentPos > prevPos) arrow = ' <span class="arrow-down">▼</span>';
        } else if (prevPos) {
            arrow = ' <span class="arrow-unchanged">—</span>';
        }
        const medal = champ.rank === 1 ? '🥇' : champ.rank === 2 ? '🥈' : champ.rank === 3 ? '🥉' : `#${champ.rank}`;
        html += `
            <div class="champion-card" style="${isCurrentUser ? 'border-color:var(--gold);box-shadow:0 0 60px rgba(212,167,69,0.08);' : ''}" onclick="openPlayerPredictions('${champ.name}')">
                <div class="rank-badge">${medal}</div>
                <div class="avatar">${champ.name.charAt(0).toUpperCase()}</div>
                <div class="info">
                    <div class="name">${champ.name} ${isCurrentUser ? '👤' : ''}
                        <button class="compare-btn" onclick="event.stopPropagation(); openCompareModal('${champ.name}')">📊 مقارنة</button>
                    </div>
                    <div class="stats-row">
                        <span class="item">🏆 <strong>${champ.points}</strong> نقطة</span>
                        <span class="item">✅ <strong style="color:var(--gold-light);">${champ.correct}</strong></span>
                        <span class="item">📊 <strong style="font-size:0.7rem;">${champ.total}</strong></span>
                        <span class="item">📊 <strong>${accuracy}%</strong> نجاح</span>
                        <span class="item">${arrow}</span>
                    </div>
                    <div class="progress-wrapper">
                        <div class="progress-label"><span>نسبة النجاح</span><span>${accuracy}%</span></div>
                        <div class="progress-bar"><div class="fill" style="width:${Math.min(accuracy,100)}%;"></div></div>
                    </div>
                </div>
            </div>
        `;
    }
    if (rest.length || topThree.length > 1) {
        const allPlayers = [...topThree.slice(1), ...rest];
        html += `<div class="players-list">`;
        allPlayers.forEach((player) => {
            const rankNum = player.rank;
            const accuracy = player.total > 0 ? Math.round((player.correct / player.total) * 100) : 0;
            const isCurrentUser = player.name === localStorage.getItem('lastUserName') || '';
            let medal = '';
            if (rankNum === 1) medal = '🥇';
            else if (rankNum === 2) medal = '🥈';
            else if (rankNum === 3) medal = '🥉';
            else if (rankNum === 4) medal = '4';
            else if (rankNum === 5) medal = '5';
            else medal = `#${rankNum}`;

            let rankClass = '';
            if (rankNum === 1) rankClass = 'gold';
            else if (rankNum === 2) rankClass = 'silver';
            else if (rankNum === 3) rankClass = 'bronze';
            else rankClass = '';

            let borderClass = '';
            if (rankNum === 1) borderClass = 'gold-border';
            else if (rankNum === 2) borderClass = 'silver-border';
            else if (rankNum === 3) borderClass = 'bronze-border';

            const isTie = board.filter(p => p.rank === rankNum).length > 1;
            const tieBadge = isTie ? ' ⚡' : '';

            const prevPos = prevRank[player.name] || 0;
            const currentPos = rankNum;
            let arrow = '';
            if (prevPos && prevPos !== currentPos) {
                if (currentPos < prevPos) arrow = ' ▲';
                else if (currentPos > prevPos) arrow = ' ▼';
            } else if (prevPos) {
                arrow = ' —';
            }
            const arrowClass = arrow.includes('▲') ? 'arrow-up' : (arrow.includes('▼') ? 'arrow-down' :
                'arrow-unchanged');

            html += `
                <div class="player-card" style="${isCurrentUser ? 'border-color:rgba(212,167,69,0.30);' : ''}" onclick="openPlayerPredictions('${player.name}')">
                    <div class="rank ${rankClass}">${medal}${tieBadge}</div>
                    <div class="avatar-sm ${borderClass}">${player.name.charAt(0).toUpperCase()}</div>
                    <div class="info-sm">
                        <div class="name-sm">${player.name} ${isCurrentUser ? '👤' : ''}
                            ${isTie ? `<span class="mini-badge gold">⚡ متعادل</span>` : ''}
                        </div>
                        <div class="sub-sm">
                            <span>✅ <span style="color:var(--gold-light);">${player.correct}</span></span>
                            <span>📊 <span style="font-size:0.65rem;">${player.total}</span></span>
                            <span>📊 ${accuracy}%</span>
                            <span class="${arrowClass}">${arrow.trim()}</span>
                        </div>
                        <div class="progress-mini"><div class="fill-mini" style="width:${Math.min(accuracy,100)}%;"></div></div>
                    </div>
                    <div class="points-sm">${player.points}</div>
                    <button class="compare-btn" onclick="event.stopPropagation(); openCompareModal('${player.name}')">📊 مقارنة</button>
                    ${isCurrentUser ? `<div class="current-user-indicator active"></div><div class="pulse-dot"></div>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    container.innerHTML = html;
}

// ============================================================
//  جميع إحصائيات اللاعبين (للمقارنة)
// ============================================================
function getAllPlayersStats() {
    const stats = {};
    const predictions = state.predictions || [];
    const games = state.previousGamesData || [];

    for (let p of predictions) {
        if (!stats[p.user_name]) {
            stats[p.user_name] = { name: p.user_name, points: 0, correct: 0, wrong: 0, total: 0, predictions: [] };
        }
        stats[p.user_name].total++;
        const parts = (p.match_id || "").split("_");
        if (parts.length < 3) continue;
        const team1 = parts[1],
            team2 = parts[2];
        
        const result = findMatchResult(team1, team2);
        let winner = null;
        if (result) {
            winner = determineWinner(result);
        }
        
        if (winner === null && result) {
            // تعادل
            const isCorrect = p.prediction === 'DRAW';
            if (isCorrect) {
                stats[p.user_name].points++;
                stats[p.user_name].correct++;
            } else {
                stats[p.user_name].wrong++;
            }
        } else if (winner) {
            const isCorrect = p.prediction === winner;
            if (isCorrect) {
                stats[p.user_name].points++;
                stats[p.user_name].correct++;
            } else {
                stats[p.user_name].wrong++;
            }
        }
        stats[p.user_name].predictions.push({ matchId: p.match_id, prediction: p.prediction, correct: isCorrect });
    }
    return stats;
}