// ============================================================
//  شجرة البطولة (المخطط)
// ============================================================

function renderBracket() {
    const container = document.getElementById('bracketContainer');

    let allMatches = [];

    if (state.openfootballMatches && state.openfootballMatches.length) {
        allMatches = [...state.openfootballMatches];
    }

    if (state.allGames && state.allGames.length) {
        const gamesWithStage = state.allGames.filter(g =>
            g.group && ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL', 'Final'].includes(g.group) ||
            g.type === 'final' || g.type === 'third' || g.group === 'Final' ||
            g.round === 'final' || g.round === 'third' ||
            g.stage && g.stage.toLowerCase().includes('round')
        );
        allMatches = [...allMatches, ...gamesWithStage];
    }

    if (allMatches.length === 0) {
        const first32 = matchesData.filter(m => m.round === 'round32').map(m => ({
            team1: m.team1,
            team2: m.team2,
            round: 'Round of 32',
            stage: 'Round of 32',
            date: m.timeISO,
            home_score: 0,
            away_score: 0,
            finished: false,
            _id: `r32_${m.id}`
        }));
        allMatches = [...first32];
    }

    const roundMapping = {
        'Round of 32': 'R32',
        'R32': 'R32',
        'Round of 16': 'R16',
        'R16': 'R16',
        'Quarter-finals': 'QF',
        'Quarterfinal': 'QF',
        'QF': 'QF',
        'Semi-finals': 'SF',
        'Semifinal': 'SF',
        'SF': 'SF',
        'Final': 'FINAL',
        'FINAL': 'FINAL',
        '3rd Place': '3RD',
        'Third Place': '3RD',
        '3RD': '3RD'
    };

    const roundOrder = ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'];
    const roundNames = {
        'R32': 'دور الـ 32',
        'R16': 'دور الـ 16',
        'QF': 'ربع النهائي',
        'SF': 'نصف النهائي',
        '3RD': 'المركز الثالث',
        'FINAL': 'النهائي'
    };

    const rounds = {};
    roundOrder.forEach(r => rounds[r] = []);

    const seenMatches = new Set();

    for (let match of allMatches) {
        let roundKey = null;
        if (match.round) roundKey = roundMapping[match.round] || null;
        if (!roundKey && match.stage) {
            const s = match.stage.toLowerCase();
            if (s.includes('round of 32') || s.includes('r32')) roundKey = 'R32';
            else if (s.includes('round of 16') || s.includes('r16')) roundKey = 'R16';
            else if (s.includes('quarter')) roundKey = 'QF';
            else if (s.includes('semi')) roundKey = 'SF';
            else if (s.includes('final')) roundKey = 'FINAL';
            else if (s.includes('third')) roundKey = '3RD';
        }
        if (!roundKey && match.group) {
            const g = match.group.toUpperCase();
            if (roundOrder.includes(g)) roundKey = g;
        }
        if (!roundKey && match.type) {
            if (match.type.toLowerCase() === 'final') roundKey = 'FINAL';
            else if (match.type.toLowerCase() === 'third') roundKey = '3RD';
        }
        if (!roundKey && match._id && match._id.toString().startsWith('r32_')) {
            roundKey = 'R32';
        }

        if (roundKey && rounds[roundKey]) {
            const homeName = match.team1 || match.home_team_name_fa || match.home_team_name_en || match
                .home_team_label || '?';
            const awayName = match.team2 || match.away_team_name_fa || match.away_team_name_en || match
                .away_team_label || '?';
            const matchKey = `${roundKey}|${homeName}|${awayName}`;

            if (!seenMatches.has(matchKey)) {
                seenMatches.add(matchKey);
                rounds[roundKey].push(match);
            }
        }
    }

    if (!rounds['R32'] || rounds['R32'].length === 0) {
        const first32 = matchesData.filter(m => m.round === 'round32').map(m => ({
            team1: m.team1,
            team2: m.team2,
            round: 'Round of 32',
            stage: 'Round of 32',
            date: m.timeISO,
            home_score: 0,
            away_score: 0,
            finished: false,
            _id: `r32_${m.id}`
        }));
        for (let m of first32) {
            const matchKey = `R32|${m.team1}|${m.team2}`;
            if (!seenMatches.has(matchKey)) {
                seenMatches.add(matchKey);
                rounds['R32'].push(m);
            }
        }
    }

    if (rounds['R32'] && rounds['R32'].length > 16) {
        rounds['R32'] = rounds['R32'].slice(0, 16);
    }
    if (rounds['R16'] && rounds['R16'].length > 8) {
        rounds['R16'] = rounds['R16'].slice(0, 8);
    }
    if (rounds['FINAL'] && rounds['FINAL'].length > 1) {
        rounds['FINAL'] = rounds['FINAL'].slice(0, 1);
    }

    let hasMatches = false;
    let html = `<div class="bracket-tree">`;

    for (let r of roundOrder) {
        const matches = rounds[r] || [];
        if (matches.length === 0) continue;
        hasMatches = true;

        matches.sort((a, b) => (a.date || a.time || '').localeCompare(b.date || b.time || ''));

        html += `<div class="bracket-round">
                    <div class="bracket-round-title">🏅 ${roundNames[r] || r}</div>`;

        for (let match of matches) {
            let homeName = match.team1 || match.home_team_name_fa || match.home_team_name_en || match
                .home_team_label || '?';
            let awayName = match.team2 || match.away_team_name_fa || match.away_team_name_en || match
                .away_team_label || '?';
            let homeDisplay = translateBracketTeamName(homeName);
            let awayDisplay = translateBracketTeamName(awayName);
            if (homeDisplay === homeName && !homeName.includes('متصدر') && !homeName.includes('وصيف') && !homeName
                .includes('ثالث')) {
                homeDisplay = translateToArabic(homeName);
            }
            if (awayDisplay === awayName && !awayName.includes('متصدر') && !awayName.includes('وصيف') && !awayName
                .includes('ثالث')) {
                awayDisplay = translateToArabic(awayName);
            }
            const flag1 = getFlag(homeDisplay) || '🏁';
            const flag2 = getFlag(awayDisplay) || '🏁';

            let statusText = '⏳ لم تلعب';
            let statusClass = 'pending';
            const isFinished = match.finished === true || match.finished === "TRUE" || match.status === 'finished';
            const isLive = match.live === true || match.live === "TRUE" || match.status === 'live';
            let scoreText = '';
            let winnerText = '';
            let penaltyText = '';
            if (isFinished) {
                const s1 = match.home_score || match.goals1?.length || 0;
                const s2 = match.away_score || match.goals2?.length || 0;
                scoreText = `${s1} - ${s2}`;
                statusText = '✅ انتهت';
                statusClass = 'finished';
                const penData = extractPenaltyData(match);
                if (penData) {
                    penaltyText = ` ⚽ ركلات ترجيح: ${penData.home} — ${penData.away}`;
                    if (parseInt(penData.home) > parseInt(penData.away)) winnerText = `🏆 ${homeDisplay}`;
                    else if (parseInt(penData.away) > parseInt(penData.home)) winnerText = `🏆 ${awayDisplay}`;
                    else winnerText = '🤝 تعادل';
                } else {
                    if (s1 > s2) winnerText = `🏆 ${homeDisplay}`;
                    else if (s2 > s1) winnerText = `🏆 ${awayDisplay}`;
                    else winnerText = '🤝 تعادل';
                }
            } else if (isLive) {
                statusText = '🔴 جارية';
                statusClass = 'live';
            }

            const matchId = match._id || match.id || `bracket_${homeName}_${awayName}_${Date.now()}`;

            html += `
                        <div class="bracket-match-item" onclick="openBracketMatchDetail('${matchId}')">
                            <div class="teams">
                                <span class="team"><span class="flag">${flag1}</span> ${homeDisplay}</span>
                                <span class="vs">🆚</span>
                                <span class="team"><span class="flag">${flag2}</span> ${awayDisplay}</span>
                            </div>
                            ${scoreText ? `<div class="score">${scoreText}${penaltyText}</div>` : ''}
                            ${winnerText ? `<div class="match-winner">${winnerText}</div>` : ''}
                            <div class="status ${statusClass}">${statusText}</div>
                        </div>
                    `;
        }

        html += `</div>`;
    }

    html += `</div>`;

    if (!hasMatches) {
        container.innerHTML = `<div class="empty-state"><span class="icon">📊</span> لا توجد مباريات في المخطط</div>`;
        return;
    }
    container.innerHTML = html;
}

// ============================================================
//  تفاصيل مباراة المخطط
// ============================================================
async function openBracketMatchDetail(matchId) {
    const detailDiv = document.getElementById('bracketMatchDetail');
    detailDiv.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> جاري التحميل...</div>`;
    let match = state.openfootballMatches.find(m => (m._id === matchId || m.id === matchId));
    if (!match) {
        match = state.allGames.find(g => g._id === matchId || g.id === matchId);
    }
    if (!match) {
        const fakeMatch = matchesData.find(m => `r32_${m.id}` === matchId);
        if (fakeMatch) {
            match = {
                team1: fakeMatch.team1,
                team2: fakeMatch.team2,
                round: 'Round of 32',
                stage: 'Round of 32',
                date: fakeMatch.timeISO,
                home_score: 0,
                away_score: 0,
                finished: false,
                _id: matchId
            };
        }
    }
    if (!match) {
        detailDiv.innerHTML =
            `<div class="empty-state"><span class="icon">⚠️</span> لا توجد تفاصيل لهذه المباراة</div>`;
        document.getElementById('bracketMatchModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }
    let homeName = match.team1 || match.home_team_name_fa || match.home_team_name_en || match.home_team_label ||
    '?';
    let awayName = match.team2 || match.away_team_name_fa || match.away_team_name_en || match.away_team_label ||
    '?';
    let homeDisplay = translateBracketTeamName(homeName);
    let awayDisplay = translateBracketTeamName(awayName);
    if (homeDisplay === homeName && !homeName.includes('متصدر') && !homeName.includes('وصيف') && !homeName
        .includes('ثالث')) {
        homeDisplay = translateToArabic(homeName);
    }
    if (awayDisplay === awayName && !awayName.includes('متصدر') && !awayName.includes('وصيف') && !awayName
        .includes('ثالث')) {
        awayDisplay = translateToArabic(awayName);
    }
    const flag1 = getFlag(homeDisplay) || '🏁';
    const flag2 = getFlag(awayDisplay) || '🏁';
    const isFinished = match.finished === true || match.finished === "TRUE" || match.status === 'finished';
    let scoreText = 'لم تلعب بعد';
    let penaltyText = '';
    let winnerText = '';
    if (isFinished) {
        const s1 = match.home_score || match.goals1?.length || 0;
        const s2 = match.away_score || match.goals2?.length || 0;
        scoreText = `${s1} - ${s2}`;
        const penData = extractPenaltyData(match);
        if (penData) {
            penaltyText = ` ⚽ ركلات ترجيح: ${penData.home} — ${penData.away}`;
            if (parseInt(penData.home) > parseInt(penData.away)) winnerText = `🏆 الفائز: ${homeDisplay}`;
            else if (parseInt(penData.away) > parseInt(penData.home)) winnerText = `🏆 الفائز: ${awayDisplay}`;
            else winnerText = '🤝 تعادل';
        } else {
            if (s1 > s2) winnerText = `🏆 الفائز: ${homeDisplay}`;
            else if (s2 > s1) winnerText = `🏆 الفائز: ${awayDisplay}`;
            else winnerText = '🤝 تعادل';
        }
    }
    const dateStr = match.date || match.time || match.local_date || 'تاريخ غير معروف';
    const stadium = match.ground || (match.stadium_id ? getStadiumName(match.stadium_id) : 'غير معروف');
    const predictions = await getPredictionsForMatchFull(matchId);
    const predCount = predictions.length;

    detailDiv.innerHTML = `
        <div class="modal-teams">
            <div class="m-team"><span class="flag">${flag1}</span> ${homeDisplay}</div>
            <div class="m-vs">🆚</div>
            <div class="m-team"><span class="flag">${flag2}</span> ${awayDisplay}</div>
        </div>
        <div style="text-align:center;font-size:1.2rem;font-weight:800;color:var(--gold-light);">${scoreText}${penaltyText}</div>
        ${winnerText ? `<div style="text-align:center;font-size:0.9rem;color:var(--success);font-weight:700;margin:4px 0;">${winnerText}</div>` : ''}
        <div style="text-align:center;margin:8px 0;font-size:0.8rem;color:var(--text-secondary);">
            📅 ${dateStr} 
            ${stadium ? `| 🏟️ ${stadium}` : ''}
            ${predCount > 0 ? `| 📋 ${predCount} توقع` : ''}
        </div>
        <div style="text-align:center;margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button class="tab-btn" style="background:var(--gold-glow);border-color:var(--border-gold);color:var(--gold-light);" onclick="closeBracketModal()">إغلاق</button>
            ${isFinished ? `<button class="tab-btn" style="background:var(--info-bg);border-color:rgba(74,158,255,0.15);color:var(--info);" onclick="openMatchPredictions('${matchId}', '${homeDisplay}', '${awayDisplay}', ${match.home_score || match.goals1?.length || 0}, ${match.away_score || match.goals2?.length || 0})">📋 عرض التوقعات</button>` : ''}
            <button class="tab-btn" style="background:var(--info-bg);border-color:rgba(74,158,255,0.15);color:var(--info);" onclick="openViewPredictionsModal('${matchId}', '${homeDisplay}', '${awayDisplay}')">📋 استعراض التوقعات</button>
        </div>
    `;
    document.getElementById('bracketMatchModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBracketModal() {
    document.getElementById('bracketMatchModal').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleBracketAdmin() {
    const wrapper = document.getElementById('bracketWrapper');
    if (wrapper.classList.contains('visible')) {
        wrapper.classList.remove('visible');
    } else {
        wrapper.classList.add('visible');
        renderBracket();
        showCopyToast('🏆 تم عرض مسار البطولة (بدون مباريات مكررة)');
    }
}