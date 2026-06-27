// ============================================================
//  ui.js - واجهة المستخدم، العرض، الأحداث والتهيئة
// ============================================================

// (يعتمد على core.js و api.js)

function renderMatchCard(m, isUpcoming) {
    const st = getMatchStatus(m);
    const isLive = st.live;
    const isFinished = st.finished;
    const matchId = `${m.timeISO}_${m.team1}_${m.team2}`;
    const savedUserName = localStorage.getItem('lastUserName') || '';
    const submitted = isMatchSubmitted(matchId);
    const canPredictNow = isUpcoming && !isLive && !isFinished && canPredict(m.timeISO);

    const userHasPrediction = userPredictionsMap && userPredictionsMap[matchId] === true;

    let scoreDisplay = '🆚',
        scoreClass = 'upcoming',
        matchClass = '';
    let homeScore = 0,
        awayScore = 0,
        matchResult = null;
    if (isLive) {
        scoreDisplay = '🔴 LIVE';
        scoreClass = 'live';
        matchClass = 'live';
    } else if (isFinished) {
        const result = findMatchResult(m.team1, m.team2);
        if (result) {
            homeScore = result.homeScore;
            awayScore = result.awayScore;
            scoreDisplay = `${homeScore} - ${awayScore}`;
            scoreClass = 'finished';
            matchClass = 'finished-match';
            matchResult = { homeScore, awayScore };
        } else {
            scoreDisplay = '✅';
            scoreClass = 'finished';
            matchClass = 'finished-match';
        }
    }

    let predictBtnHtml = 'توقع الآن';
    let predictDisabled = false;
    let predictBtnClass = 'predict-btn';
    let predictBtnExtra = '';
    let editBtnHtml = 'تعديل';
    let editDisabled = true;
    let editBtnExtra = '';

    if (userHasPrediction) {
        predictDisabled = true;
        predictBtnHtml = '✅ تم التوقع';
        predictBtnClass += ' submitted';
        predictBtnExtra = 'disabled';
        if (canPredictNow) {
            editDisabled = false;
            editBtnExtra = `onclick="openEditPredictionModal('${matchId}','${m.team1}','${m.team2}','${m.timeISO}')"`;
        } else {
            editDisabled = true;
            editBtnExtra = 'disabled';
            if (isFinished) {
                editBtnHtml = '⏳ انتهت';
            } else if (isLive) {
                editBtnHtml = '⛔ جارية';
            } else if (!canPredict(m.timeISO) && !isFinished && !isLive) {
                editBtnHtml = '⏳ انتهت المهلة';
            } else {
                editBtnHtml = '⏳ غير متاح';
            }
        }
    } else if (submitted) {
        predictDisabled = true;
        predictBtnHtml = 'تم التوقع ✅';
        predictBtnClass += ' submitted';
        predictBtnExtra = 'disabled';
        if (canPredictNow) {
            editDisabled = false;
            editBtnExtra = `onclick="openEditPredictionModal('${matchId}','${m.team1}','${m.team2}','${m.timeISO}')"`;
        } else {
            editDisabled = true;
            editBtnExtra = 'disabled';
            if (isFinished) {
                editBtnHtml = '⏳ انتهت';
            } else if (isLive) {
                editBtnHtml = '⛔ جارية';
            } else if (!canPredict(m.timeISO) && !isFinished && !isLive) {
                editBtnHtml = '⏳ انتهت المهلة';
            } else {
                editBtnHtml = '⏳ غير متاح';
            }
        }
    } else if (!canPredictNow) {
        predictDisabled = true;
        if (isFinished) {
            predictBtnHtml = '📋 عرض التوقعات';
            predictBtnClass += ' view-btn';
            predictBtnExtra = `onclick="openMatchPredictions('${matchId}', '${m.team1}', '${m.team2}', ${homeScore}, ${awayScore})"`;
        } else if (isLive) {
            predictBtnHtml = '⛔ جارية';
            predictBtnClass += ' view-btn';
            predictBtnExtra = 'disabled';
        } else if (!canPredict(m.timeISO) && !isFinished && !isLive) {
            predictBtnHtml = '⏳ قريباً (أقل من 5 دقائق)';
            predictBtnClass += ' view-btn';
            predictBtnExtra = 'disabled';
        } else {
            predictBtnHtml = '⏳ قريباً';
            predictBtnClass += ' view-btn';
            predictBtnExtra = 'disabled';
        }
    } else {
        predictBtnExtra = `onclick="openNameModal('${matchId}','${m.team1}','${m.team2}','${m.timeISO}')"`;
    }

    const groupName = Object.keys(finalGroups).find(g => finalGroups[g].includes(m.team1)) || '';
    const isToday = isMatchToday(m.timeISO);
    const dayLabel = isToday ? '📌 اليوم' : (isMatchTodayOrTomorrow(m.timeISO) ? '📌 غداً' : '');
    let ground = getGroundForMatch(m.team1, m.team2, m.timeISO);
    if (!ground) {
        const matchFromAPI = state.allGames.find(g => {
            const home = translateToArabic(g.home_team_name_fa || g.home_team_name_en || '');
            const away = translateToArabic(g.away_team_name_fa || g.away_team_name_en || '');
            return (home === m.team1 && away === m.team2) || (home === m.team2 && away === m.team1);
        });
        if (matchFromAPI && matchFromAPI.stadium_id) {
            ground = getStadiumName(matchFromAPI.stadium_id);
        }
    }
    const onclickAttr = (isFinished && matchResult) ?
        `onclick="openMatchPredictions('${matchId}', '${m.team1}', '${m.team2}', ${homeScore}, ${awayScore})"` :
        '';

    const showEdit = (userHasPrediction || submitted) && canPredictNow;

    return `
            <div class="match-card ${matchClass}" ${onclickAttr}>
              <div class="match-teams">
                <div class="match-team"><span class="flag">${getFlag(m.team1)}</span> ${m.team1}</div>
                <div class="match-score ${scoreClass}">${scoreDisplay}</div>
                <div class="match-team"><span class="flag">${getFlag(m.team2)}</span> ${m.team2}</div>
              </div>
              <div class="match-meta">
                <span class="tag">🏅 ${m.roundLabel}</span>
                <span class="tag">${groupName ? `المجموعة ${groupName}` : ''}</span>
                ${isUpcoming ? `<span class="timer ${isLive ? 'live' : ''}">${isLive ? '🔴 تُلعب الآن' : st.text}</span>` : `<span class="tag finished-tag">✅ انتهت - اضغط لعرض التوقعات</span>`}
              </div>
              <div class="match-meta" style="margin-top:4px;">
                <span class="tag">${getDay(m.timeISO)}</span>
                <span class="tag">${getDateTimeDisplay(m.timeISO)}</span>
                ${dayLabel ? `<span class="tag" style="color:var(--gold-light);">${dayLabel}</span>` : ''}
                ${ground ? `<span class="tag stadium-tag">🏟️ ${ground}</span>` : ''}
              </div>
              ${isUpcoming ? `
                <div class="predict-btn-wrap">
                  <div class="btn-group">
                    <button class="${predictBtnClass}" ${predictBtnExtra} data-matchid="${matchId}">
                      ${predictBtnHtml}
                    </button>
                    ${showEdit ? `<button class="edit-btn" ${editBtnExtra} data-matchid="${matchId}">✏️ ${editBtnHtml}</button>` : ''}
                  </div>
                  <button class="view-btn" onclick="openViewPredictionsModal('${matchId}','${m.team1}','${m.team2}')">
                    📋 استعراض التوقعات
                  </button>
                  <button class="share-link-btn" onclick="copyMatchLink('${m.id}', '${m.team1}', '${m.team2}')">
                    🔗 مشاركة
                  </button>
                </div>
              ` : ''}
            </div>
          `;
}

function renderUpcoming() {
    try {
        const groupFilter = document.getElementById('groupFilter')?.value || 'all';
        let active = [];
        if (groupFilter === 'all') {
            active = upcomingMatches(matchesData);
        } else {
            const teams = finalGroups[groupFilter] || [];
            const allMatchesForGroup = matchesData.filter(m => teams.includes(m.team1) || teams.includes(m.team2));
            active = allMatchesForGroup;
            active.sort((a, b) => matchTime(a.timeISO) - matchTime(b.timeISO));
        }
        if (groupFilter === 'all') {
            if (currentDayFilter === 'today') {
                active = active.filter(m => isTodaySaudi(m.timeISO));
            } else if (currentDayFilter === 'tomorrow') {
                active = active.filter(m => isTomorrowSaudi(m.timeISO));
            } else if (currentDayFilter === 'week') {
                const today = getSaudiNow();
                const weekLater = new Date(today);
                weekLater.setDate(weekLater.getDate() + 7);
                active = active.filter(m => {
                    const d = toSaudiTime(m.timeISO);
                    return d >= today && d <= weekLater;
                });
            }
        }
        const container = document.getElementById('matchesContainer');
        document.getElementById('upcomingCount').textContent = active.length;
        if (!active.length) {
            container.innerHTML =
                `<div class="empty-state"><span class="icon">📭</span> لا توجد مباريات تطابق الفلاتر</div>`;
            return;
        }
        container.innerHTML = active.map(m => {
            const isUpcoming = (matchTime(m.timeISO) + MATCH_DURATION) > now();
            return renderMatchCard(m, isUpcoming);
        }).join('');
        updateShareAllCount();
    } catch (e) {
        console.error("renderUpcoming:", e);
        document.getElementById('matchesContainer').innerHTML =
            `<div class="empty-state"><span class="icon">⚠️</span> حدث خطأ</div>`;
    }
}

function renderPreviousGamesFiltered() {
    const searchText = document.getElementById('prevSearchInput')?.value.trim().toLowerCase() || '';
    let filtered = [...state.previousGamesData];

    filtered.sort((a, b) => (b.sortTimestamp || 0) - (a.sortTimestamp || 0));

    if (searchText) {
        filtered = filtered.filter(g =>
            g.homeAr.toLowerCase().includes(searchText) ||
            g.awayAr.toLowerCase().includes(searchText)
        );
    }

    const container = document.getElementById('previousMatchesContainer');
    const countSpan = document.getElementById('prevCount');
    countSpan.textContent = filtered.length;

    if (!filtered.length) {
        let message = '📭 لا توجد مباريات مطابقة';
        if (state.previousGamesData.length === 0) message = '⏳ جاري التحميل...';
        if (searchText && state.previousGamesData.length > 0) message =
            `🔍 لا توجد مباريات سابقة للمنتخب "${searchText}"`;
        container.innerHTML = `<div class="empty-state"><span class="icon">${message === '⏳ جاري التحميل...' ? '⏳' : '📭'}</span> ${message}</div>`;
        return;
    }

    container.innerHTML = filtered.map(g => {
        let ground = getGroundForMatch(g.homeAr, g.awayAr, null);
        return `
              <div class="match-card finished-match" onclick="openPreviousMatchPredictions('${g.homeAr}', '${g.awayAr}', ${g.homeScore}, ${g.awayScore})">
                <div class="match-teams">
                  <div class="match-team"><span class="flag">${getFlag(g.homeAr)}</span> ${g.homeAr}</div>
                  <div class="match-score finished">${g.homeScore} - ${g.awayScore}</div>
                  <div class="match-team"><span class="flag">${getFlag(g.awayAr)}</span> ${g.awayAr}</div>
                </div>
                <div class="match-meta">
                  <span class="tag">${g.dayName || 'تاريخ'}</span>
                  <span class="tag">${g.formattedDate || ''} ${g.timeMatch || ''}</span>
                  <span class="tag finished-tag">✅ انتهت - اضغط لعرض التوقعات</span>
                  ${ground ? `<span class="tag stadium-tag">🏟️ ${ground}</span>` : ''}
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="view-btn" onclick="event.stopPropagation();openPreviousMatchPredictions('${g.homeAr}','${g.awayAr}',${g.homeScore},${g.awayScore})" style="padding:6px 14px;border-radius:40px;font-size:0.65rem;font-weight:600;background:rgba(52,152,219,0.06);border:1px solid rgba(52,152,219,0.15);color:#5dade2;cursor:pointer;font-family:inherit;">📋 عرض التوقعات</button>
                  <button class="share-link-btn" onclick="event.stopPropagation();copyMatchLink('${g.homeAr}_${g.awayAr}','${g.homeAr}','${g.awayAr}')" style="padding:4px 12px;border-radius:40px;font-size:0.6rem;font-weight:600;background:rgba(52,152,219,0.1);border:1px solid rgba(52,152,219,0.2);color:#5dade2;cursor:pointer;font-family:inherit;">🔗 مشاركة</button>
                </div>
              </div>
            `;
    }).join('');
}

function calculateStandings() {
    try {
        const standings = {};
        for (const [group, teams] of Object.entries(finalGroups)) {
            standings[group] = {};
            teams.forEach(team => {
                standings[group][team] = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0,
                    points: 0 };
            });
        }
        state.previousGamesData.forEach(game => {
            const { homeAr, awayAr, homeScore, awayScore } = game;
            let groupName = null;
            for (const [g, teams] of Object.entries(finalGroups)) {
                if (teams.includes(homeAr) && teams.includes(awayAr)) { groupName = g; break; }
            }
            if (!groupName) return;
            const stats = standings[groupName];
            if (!stats[homeAr] || !stats[awayAr]) return;
            stats[homeAr].played++;
            stats[awayAr].played++;
            stats[homeAr].goalsFor += homeScore;
            stats[homeAr].goalsAgainst += awayScore;
            stats[awayAr].goalsFor += awayScore;
            stats[awayAr].goalsAgainst += homeScore;
            if (homeScore > awayScore) {
                stats[homeAr].wins++;
                stats[homeAr].points += 3;
                stats[awayAr].losses++;
            } else if (awayScore > homeScore) {
                stats[awayAr].wins++;
                stats[awayAr].points += 3;
                stats[homeAr].losses++;
            } else {
                stats[homeAr].draws++;
                stats[awayAr].draws++;
                stats[homeAr].points++;
                stats[awayAr].points++;
            }
        });
        const container = document.getElementById('standingsContainer');
        let html = '';
        for (const [group, teamsStats] of Object.entries(standings)) {
            const tableRows = [];
            for (const [team, stat] of Object.entries(teamsStats)) {
                tableRows.push({ team, ...stat, diff: stat.goalsFor - stat.goalsAgainst });
            }
            tableRows.sort((a, b) => b.points - a.points || b.diff - a.diff || b.goalsFor - a.goalsFor);
            html +=
                `<div class="group-card"><div class="group-title">المجموعة ${group}</div><table class="standings-table"><thead><tr><th>#</th><th>الفريق</th><th>ل</th><th>ف</th><th>ت</th><th>خ</th><th>له</th><th>عليه</th><th>±</th><th>ن</th></tr></thead><tbody>`;
            tableRows.forEach((row, idx) => {
                html +=
                    `<tr><td>${idx+1}</td><td><div class="team-cell"><span>${getFlag(row.team)}</span> <span>${row.team}</span></div></td><td>${row.played}</td><td>${row.wins}</td><td>${row.draws}</td><td>${row.losses}</td><td>${row.goalsFor}</td><td>${row.goalsAgainst}</td><td>${row.diff}</td><td style="color:#f0b429;font-weight:800;">${row.points}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        container.innerHTML = html ||
            `<div class="empty-state"><span class="icon">📊</span> لا توجد نتائج كافية</div>`;
    } catch (e) {
        console.error("calculateStandings:", e);
        document.getElementById('standingsContainer').innerHTML =
            `<div class="empty-state"><span class="icon">⚠️</span> خطأ في حساب الترتيب</div>`;
    }
}

function updateScorers() {
    let scorersDict = {};
    let playerTeamMap = {};
    for (let match of state.openfootballMatches) {
        const homeTeam = translateToArabic(match.team1 || '');
        const awayTeam = translateToArabic(match.team2 || '');
        const goals = [...(match.goals1 || []), ...(match.goals2 || [])];
        for (let g of goals) {
            if (!g.name) continue;
            let normalizedName = normalizeName(g.name);
            if (!scorersDict[normalizedName]) scorersDict[normalizedName] = 0;
            scorersDict[normalizedName]++;
            let team = '';
            if (match.goals1 && match.goals1.some(gg => gg.name === g.name)) team = homeTeam;
            else if (match.goals2 && match.goals2.some(gg => gg.name === g.name)) team = awayTeam;
            if (team && !playerTeamMap[normalizedName]) playerTeamMap[normalizedName] = team;
        }
    }
    for (let game of state.allGames) {
        if (game.finished === "TRUE" && game.scorers) {
            try {
                const scorersData = game.scorers;
                const homeTeam = translateToArabic(game.home_team_name_fa || game.home_team_name_en || '');
                const awayTeam = translateToArabic(game.away_team_name_fa || game.away_team_name_en || '');
                const scorerMatches = scorersData.match(/([^\d,]+?)\s*(\d+['’]?)/g);
                if (scorerMatches) {
                    for (let sm of scorerMatches) {
                        const parts = sm.match(/^(.+?)\s*(\d+['’]?)$/);
                        if (parts) {
                            let name = parts[1].trim();
                            let normalizedName = normalizeName(name);
                            if (!scorersDict[normalizedName]) scorersDict[normalizedName] = 0;
                            scorersDict[normalizedName]++;
                            if (!playerTeamMap[normalizedName]) {
                                if (game.home_team_name_en && name.includes(game.home_team_name_en))
                                    playerTeamMap[normalizedName] = homeTeam;
                                else if (game.away_team_name_en && name.includes(game.away_team_name_en))
                                    playerTeamMap[normalizedName] = awayTeam;
                                else if (game.home_team_name_fa && name.includes(game.home_team_name_fa))
                                    playerTeamMap[normalizedName] = homeTeam;
                                else if (game.away_team_name_fa && name.includes(game.away_team_name_fa))
                                    playerTeamMap[normalizedName] = awayTeam;
                            }
                        }
                    }
                }
            } catch (e) { /* تجاهل */ }
        }
    }
    window._scorersDict = scorersDict;
    window._playerTeamMap = playerTeamMap;
    renderScorers();
}

function renderScorers() {
    const container = document.getElementById('scorersContainer');
    const countSpan = document.getElementById('scorersCount');
    const scorersDict = window._scorersDict || {};
    const playerTeamMap = window._playerTeamMap || {};
    const scorersArray = Object.entries(scorersDict).map(([name, goals]) => ({ name, goals }));
    scorersArray.sort((a, b) => b.goals - a.goals);
    countSpan.textContent = scorersArray.length;
    if (!scorersArray.length) {
        container.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد أهداف مسجلة بعد</div>`;
        return;
    }
    let html =
        `<table class="scorers-table"><thead><tr><th>#</th><th>اللاعب</th><th>الفريق</th><th>الأهداف</th></tr></thead><tbody>`;
    scorersArray.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
        const team = playerTeamMap[s.name] || '';
        const flag = getFlag(team);
        html +=
            `<tr><td class="medal">${medal}</td><td class="player-name">${s.name}</td><td>${flag} ${team}</td><td class="goals">${s.goals}</td></tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderTeamStats() {
    const container = document.getElementById('teamStatsContainer');
    if (!state.previousGamesData.length) {
        container.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> لا توجد نتائج كافية</div>`;
        return;
    }
    const stats = {};
    state.previousGamesData.forEach(g => {
        const { homeAr, awayAr, homeScore, awayScore } = g;
        if (!stats[homeAr]) stats[homeAr] = { played: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0,
            losses: 0 };
        if (!stats[awayAr]) stats[awayAr] = { played: 0, goalsFor: 0, goalsAgainst: 0, wins: 0, draws: 0,
            losses: 0 };
        stats[homeAr].played++;
        stats[awayAr].played++;
        stats[homeAr].goalsFor += homeScore;
        stats[homeAr].goalsAgainst += awayScore;
        stats[awayAr].goalsFor += awayScore;
        stats[awayAr].goalsAgainst += homeScore;
        if (homeScore > awayScore) {
            stats[homeAr].wins++;
            stats[awayAr].losses++;
        } else if (awayScore > homeScore) {
            stats[awayAr].wins++;
            stats[homeAr].losses++;
        } else {
            stats[homeAr].draws++;
            stats[awayAr].draws++;
        }
    });
    const sorted = Object.keys(stats).sort((a, b) => {
        const diffA = stats[a].goalsFor - stats[a].goalsAgainst;
        const diffB = stats[b].goalsFor - stats[b].goalsAgainst;
        return diffB - diffA || stats[b].goalsFor - stats[a].goalsFor;
    });
    let html =
        `<table class="team-stats-table"><thead><tr><th>#</th><th>الفريق</th><th>لعب</th><th>فوز</th><th>تعادل</th><th>خسارة</th><th>له</th><th>عليه</th><th>±</th><th>معدل الأهداف</th></tr></thead><tbody>`;
    sorted.forEach((team, idx) => {
        const s = stats[team];
        const diff = s.goalsFor - s.goalsAgainst;
        const avg = s.played > 0 ? (s.goalsFor / s.played).toFixed(2) : '0.00';
        html += `<tr>
                <td>${idx+1}</td>
                <td class="team-name">${getFlag(team)} ${team}</td>
                <td>${s.played}</td>
                <td>${s.wins}</td>
                <td>${s.draws}</td>
                <td>${s.losses}</td>
                <td class="stat-highlight">${s.goalsFor}</td>
                <td>${s.goalsAgainst}</td>
                <td>${diff > 0 ? '+' : ''}${diff}</td>
                <td>${avg}</td>
              </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderBracket() {
    const container = document.getElementById('bracketContainer');

    let allMatches = [];
    if (state.openfootballMatches && state.openfootballMatches.length) {
        allMatches = [...state.openfootballMatches];
    }
    if (state.allGames && state.allGames.length) {
        const extra = state.allGames.filter(g =>
            g.group && ['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'].includes(g.group) ||
            g.type === 'final' || g.type === 'third' ||
            g.round === 'final' || g.round === 'third' ||
            g.stage && g.stage.toLowerCase().includes('round')
        );
        allMatches = [...allMatches, ...extra];
    }

    const uniqueMap = new Map();
    allMatches.forEach(m => {
        let roundKey = null;
        if (m.round) {
            const roundMap = {
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
            roundKey = roundMap[m.round] || null;
        }
        if (!roundKey && m.stage) {
            const s = m.stage.toLowerCase();
            if (s.includes('round of 32') || s.includes('r32')) roundKey = 'R32';
            else if (s.includes('round of 16') || s.includes('r16')) roundKey = 'R16';
            else if (s.includes('quarter')) roundKey = 'QF';
            else if (s.includes('semi')) roundKey = 'SF';
            else if (s.includes('final')) roundKey = 'FINAL';
            else if (s.includes('third')) roundKey = '3RD';
        }
        if (!roundKey && m.group) {
            const g = m.group.toUpperCase();
            if (['R32', 'R16', 'QF', 'SF', '3RD', 'FINAL'].includes(g)) roundKey = g;
        }
        if (!roundKey && m.type) {
            if (m.type.toLowerCase() === 'final') roundKey = 'FINAL';
            else if (m.type.toLowerCase() === 'third') roundKey = '3RD';
        }
        if (!roundKey && m._id && m._id.toString().startsWith('r32_')) roundKey = 'R32';

        if (!roundKey) return;

        const t1 = (m.team1 || m.home_team_name_en || m.home_team_name_fa || m.home_team_label || '').trim();
        const t2 = (m.team2 || m.away_team_name_en || m.away_team_name_fa || m.away_team_label || '').trim();
        const sortedTeams = [t1, t2].sort().join('|');
        const key = `${sortedTeams}|${roundKey}`;

        const isFinished = m.finished === true || m.finished === "TRUE" || m.status === 'finished';
        const hasScore = m.home_score !== undefined && m.away_score !== undefined;
        if (!uniqueMap.has(key) || isFinished || hasScore) {
            uniqueMap.set(key, m);
        }
    });
    allMatches = Array.from(uniqueMap.values());

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

    for (let match of allMatches) {
        let roundKey = null;
        if (match.round) {
            const roundMap = {
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
            roundKey = roundMap[match.round] || null;
        }
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
            rounds[roundKey].push(match);
        }
    }

    if (!rounds['R32'] || rounds['R32'].length === 0) {
        const first32 = matchesData.slice(0, 32).map(m => ({
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
        rounds['R32'] = first32;
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

            let statusText = '⏳ لم تلعب';
            let statusClass = 'pending';
            const isFinished = match.finished === true || match.finished === "TRUE" || match.status === 'finished';
            const isLive = match.live === true || match.live === "TRUE" || match.status === 'live';
            let scoreText = '';
            let winnerText = '';
            if (isFinished) {
                const s1 = match.home_score || match.goals1?.length || 0;
                const s2 = match.away_score || match.goals2?.length || 0;
                scoreText = `${s1} - ${s2}`;
                statusText = '✅ انتهت';
                statusClass = 'finished';
                if (s1 > s2) winnerText = `🏆 ${homeDisplay}`;
                else if (s2 > s1) winnerText = `🏆 ${awayDisplay}`;
                else winnerText = '🤝 تعادل';
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
                            ${scoreText ? `<div class="score">${scoreText}</div>` : ''}
                            ${winnerText ? `<div class="match-winner">${winnerText}</div>` : ''}
                            <div class="status ${statusClass}">${statusText}</div>
                        </div>
                    `;
        }

        html += `</div>`;
    }

    html += `</div>`;

    if (!hasMatches) {
        container.innerHTML =
            `<div class="empty-state"><span class="icon">📊</span> لا توجد مباريات في المخطط</div>`;
        return;
    }
    container.innerHTML = html;
}

async function renderAllPredictions() {
    const container = document.getElementById('allPredictions');
    const countSpan = document.getElementById('predictionsCount');
    let predictions = state.predictions;
    if (!predictions || !predictions.length) {
        await getAllPredictions();
        predictions = state.predictions;
    }
    countSpan.textContent = predictions.length;
    if (!predictions || !predictions.length) {
        container.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات بعد</div>`;
        return;
    }
    const sorted = [...predictions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    container.innerHTML = sorted.slice(0, 20).map(p => {
        const parts = p.match_id.split('_');
        const team1 = parts[1] || '?',
            team2 = parts[2] || '?';
        let predictionText = p.prediction === 'DRAW' ? '🤝 تعادل' : `🏆 فوز ${getFlag(p.prediction)} ${p.prediction}`;
        const status = getPredictionStatus(p);
        let cardClass = '',
            badgeClass = '';
        if (status.status === 'correct') {
            cardClass = 'correct';
            badgeClass = 'correct';
        } else if (status.status === 'wrong') {
            cardClass = 'wrong';
            badgeClass = 'wrong';
        } else {
            cardClass = 'pending';
            badgeClass = 'pending';
        }
        return `<div class="prediction-card ${cardClass}" onclick="openPlayerPredictions('${p.user_name || ''}')" style="cursor:pointer;">
              <div class="user"><div class="avatar-p">${p.user_name ? p.user_name.charAt(0).toUpperCase() : '👤'}</div><span class="name-p">${p.user_name || 'مجهول'}</span></div>
              <div class="prediction-text">${team1} 🆚 ${team2}</div>
              <div class="prediction-text" style="color:var(--gold-light);">🔮 ${predictionText}</div>
              <span class="status-badge ${badgeClass}">${status.text}</span>
              <div style="font-size:0.6rem;color:var(--text-secondary);margin-top:4px;">🕒 ${p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف'}</div>
            </div>`;
    }).join('');
}

// ------------------------------------------------------------
//  النوافذ المنبثقة والإشعارات
// ------------------------------------------------------------

function showCopyToast(msg) {
    const t = document.getElementById('copyToast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

function toggleCompactMode() {
    const container = document.getElementById('leaderboardContainer');
    const playersList = container?.querySelector('.players-list');
    const championCard = container?.querySelector('.champion-card');
    if (playersList) {
        isCompactMode = !isCompactMode;
        playersList.classList.toggle('compact-mode');
        if (championCard) {
            championCard.style.transform = isCompactMode ? 'scale(0.85)' : 'scale(1)';
            championCard.style.transformOrigin = 'center center';
            championCard.style.margin = isCompactMode ? '-10px 0' : '0';
        }
        const btn = document.getElementById('toggleCompactBtn');
        if (isCompactMode) {
            btn.innerHTML = '📐 وضع التصوير (مفعل)';
            btn.style.background = 'linear-gradient(135deg, var(--success), #27ae60)';
            showCopyToast('📐 تم تفعيل وضع التصغير للقطة الشاشة');
        } else {
            btn.innerHTML = '📐 تصغير للتصوير';
            btn.style.background = 'linear-gradient(135deg, var(--gold), #d49a1a)';
            showCopyToast('📐 تم إلغاء وضع التصغير');
        }
    } else {
        showCopyToast('⚠️ انتظر حتى تحميل البيانات');
    }
}

function resetCompactMode() {
    const container = document.getElementById('leaderboardContainer');
    const playersList = container?.querySelector('.players-list');
    const championCard = container?.querySelector('.champion-card');
    if (playersList) {
        isCompactMode = false;
        playersList.classList.remove('compact-mode');
        if (championCard) {
            championCard.style.transform = 'scale(1)';
            championCard.style.margin = '0';
        }
        const btn = document.getElementById('toggleCompactBtn');
        btn.innerHTML = '📐 تصغير للتصوير';
        btn.style.background = 'linear-gradient(135deg, var(--gold), #d49a1a)';
        showCopyToast('🔄 تم إعادة الحجم الطبيعي');
    }
}

function toggleModalCompact() {
    const modalContent = document.getElementById('matchPredictionsContent');
    const btn = document.getElementById('modalCompactBtn');
    isModalCompact = !isModalCompact;
    modalContent.classList.toggle('compact-mode');
    if (isModalCompact) {
        btn.textContent = '📐 تكبير';
        showCopyToast('📐 تم تصغير جدول التوقعات للتصوير');
    } else {
        btn.textContent = '📐 تصغير';
        showCopyToast('📐 تم تكبير جدول التوقعات');
    }
}

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
    const score = isFinished ?
        `${match.home_score || match.goals1?.length || 0} - ${match.away_score || match.goals2?.length || 0}` :
        'لم تلعب بعد';
    const dateStr = match.date || match.time || match.local_date || 'تاريخ غير معروف';
    const stadium = match.ground || (match.stadium_id ? getStadiumName(match.stadium_id) : 'غير معروف');
    const predictions = await getPredictionsForMatchFull(matchId);
    const predCount = predictions.length;

    let winnerText = '';
    if (isFinished) {
        const s1 = match.home_score || match.goals1?.length || 0;
        const s2 = match.away_score || match.goals2?.length || 0;
        if (s1 > s2) winnerText = `🏆 الفائز: ${homeDisplay}`;
        else if (s2 > s1) winnerText = `🏆 الفائز: ${awayDisplay}`;
        else winnerText = '🤝 تعادل';
    }

    detailDiv.innerHTML = `
            <div class="modal-teams">
              <div class="m-team"><span class="flag">${flag1}</span> ${homeDisplay}</div>
              <div class="m-vs">🆚</div>
              <div class="m-team"><span class="flag">${flag2}</span> ${awayDisplay}</div>
            </div>
            <div style="text-align:center;font-size:1.2rem;font-weight:800;color:var(--gold-light);">${score}</div>
            ${winnerText ? `<div style="text-align:center;font-size:0.9rem;color:var(--success);font-weight:700;margin:4px 0;">${winnerText}</div>` : ''}
            <div style="text-align:center;margin:8px 0;font-size:0.8rem;color:var(--text-secondary);">
              📅 ${dateStr} 
              ${stadium ? `| 🏟️ ${stadium}` : ''}
              ${predCount > 0 ? `| 📋 ${predCount} توقع` : ''}
            </div>
            <div style="text-align:center;margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
              <button class="tab-btn" style="background:rgba(240,180,41,0.08);border-color:rgba(240,180,41,0.2);color:var(--gold-light);" onclick="closeBracketModal()">إغلاق</button>
              ${isFinished ? `<button class="tab-btn" style="background:rgba(52,152,219,0.06);border-color:rgba(52,152,219,0.15);color:#5dade2;" onclick="openMatchPredictions('${matchId}', '${homeDisplay}', '${awayDisplay}', ${match.home_score || match.goals1?.length || 0}, ${match.away_score || match.goals2?.length || 0})">📋 عرض التوقعات</button>` : ''}
              <button class="tab-btn" style="background:rgba(52,152,219,0.06);border-color:rgba(52,152,219,0.15);color:#5dade2;" onclick="openViewPredictionsModal('${matchId}', '${homeDisplay}', '${awayDisplay}')">📋 استعراض التوقعات</button>
            </div>
          `;
    document.getElementById('bracketMatchModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBracketModal() {
    document.getElementById('bracketMatchModal').classList.remove('active');
    document.body.style.overflow = '';
}

function openPreviousMatchPredictions(team1, team2, homeScore, awayScore) {
    const match = matchesData.find(m => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m.team2 ===
        team1));
    if (match) {
        const matchId = `${match.timeISO}_${match.team1}_${match.team2}`;
        openMatchPredictions(matchId, team1, team2, homeScore, awayScore);
    } else {
        showCopyToast('⚠️ لا توجد توقعات لهذه المباراة');
    }
}

function updateShareAllCount() {
    if (!isAuthorized) {
        document.getElementById('shareAllCount').textContent = '🔒';
        return;
    }
    const today = getSaudiNow();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activeMatches = matchesData.filter(m => (matchTime(m.timeISO) + MATCH_DURATION) > now());
    const count = activeMatches.filter(m => {
        const d = toSaudiTime(m.timeISO);
        return (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) ||
            (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth());
    }).length;
    document.getElementById('shareAllCount').textContent = count;
}

function updateNewsTicker() {
    const tickerEl = document.getElementById('todayHighlights');
    if (!tickerEl) return;

    const today = getSaudiNow();
    const todayMatches = matchesData.filter(m => {
        const d = toSaudiTime(m.timeISO);
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear() &&
            (matchTime(m.timeISO) + MATCH_DURATION) > now();
    });

    if (todayMatches.length === 0) {
        tickerEl.textContent = '📅 لا توجد مباريات اليوم';
        return;
    }

    let text = '📅 مباريات اليوم: ';
    const matchTexts = todayMatches.map(m => {
        const flag1 = getFlag(m.team1);
        const flag2 = getFlag(m.team2);
        const timeStr = getTimeFromISO(m.timeISO);
        return `${flag1} ${m.team1} 🆚 ${flag2} ${m.team2} (${timeStr})`;
    });
    text += matchTexts.join(' | ');

    const predictions = state.predictions || [];
    if (predictions.length > 0) {
        const todayMatchIds = todayMatches.map(m => `${m.timeISO}_${m.team1}_${m.team2}`);
        const todayPredictions = predictions.filter(p => todayMatchIds.includes(p.match_id));

        if (todayPredictions.length > 0) {
            const userPreds = {};
            for (let p of todayPredictions) {
                if (!userPreds[p.user_name]) userPreds[p.user_name] = [];
                userPreds[p.user_name].push(p);
            }
            const sortedUsers = Object.entries(userPreds).sort((a, b) => b[1].length - a[1].length);
            if (sortedUsers.length > 0) {
                const topUser = sortedUsers[0];
                const predCount = topUser[1].length;
                text +=
                    ` | 🔥 أكثر متوقع اليوم: ${topUser[0]} (${predCount} توقع${predCount > 1 ? 'ات' : ''})`;
            }
        }
    }

    tickerEl.textContent = text;
}

function shareResults() {
    const currentUser = localStorage.getItem('lastUserName') || 'لاعب';
    const userScore = document.querySelector('.champion-card .info .stats-row .item:first-child strong')
        ?.textContent || '0';
    const userRank = document.querySelector('.champion-card .rank-badge')?.textContent || '🥇';
    const totalPlayers = document.getElementById('lbTotalPlayers')?.textContent || '0';
    const shareText =
        `🏆 كأس العالم 2026\n\n👤 ${currentUser}\n📊 النقاط: ${userScore}\n🏅 الترتيب: ${userRank}\n👥 عدد اللاعبين: ${totalPlayers}\n\n✨ توقع · تنافس · اربح ✨\n#كأس_العالم_2026 #توقعات`;
    if (navigator.share) {
        navigator.share({ title: 'نتائجي في كأس العالم 2026', text: shareText }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText).then(() => showCopyToast('✅ تم نسخ النتائج!')).catch(() =>
            prompt('انسخ النص التالي للمشاركة:', shareText));
    }
}

function shareAllTodayTomorrow() {
    if (!isAuthorized) {
        showPasswordOverlay();
        return;
    }
    const today = getSaudiNow();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activeMatches = matchesData.filter(m => (matchTime(m.timeISO) + MATCH_DURATION) > now());
    const todayTomorrowMatches = activeMatches.filter(m => {
        const d = toSaudiTime(m.timeISO);
        return (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) ||
            (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth());
    });
    if (!todayTomorrowMatches.length) {
        showCopyToast('⚠️ لا توجد مباريات اليوم أو غداً');
        return;
    }
    todayTomorrowMatches.sort((a, b) => matchTime(a.timeISO) - matchTime(b.timeISO));
    const baseUrl = window.location.origin + window.location.pathname;
    let shareText = '🏆 كأس العالم 2026 - روابط توقع مباريات اليوم والغد\n\n';
    shareText +=
        `📅 اليوم: ${formatSaudiDate(new Date().toISOString())}\n📅 غداً: ${formatSaudiDate(tomorrow.toISOString())}\n━\n\n`;
    todayTomorrowMatches.forEach((m, index) => {
        const dayLabel = isMatchToday(m.timeISO) ? '📌 اليوم' : '📌 غداً';
        const timeStr = getTimeFromISO(m.timeISO);
        const link = `${baseUrl}?m=${m.id}`;
        shareText +=
            `${index+1}. ${getFlag(m.team1)} ${m.team1} 🆚 ${getFlag(m.team2)} ${m.team2}\n🕒 ${dayLabel} - ${timeStr}\n🔗 <${link}>\n\n`;
    });
    shareText += '━\n✨ توقع · تنافس · اربح ✨\n#كأس_العالم_2026 #توقعات';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => showCopyToast(
            `✅ تم نسخ روابط ${todayTomorrowMatches.length} مباراة!`)).catch(() => fallbackCopy(shareText));
    } else {
        fallbackCopy(shareText);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showCopyToast('✅ تم نسخ جميع الروابط!');
    } catch (e) {
        prompt('انسخ النص التالي للمشاركة:', text);
    }
    document.body.removeChild(textArea);
}

function copyMatchLink(matchId, team1, team2) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?m=${matchId}`;
    if (navigator.share) {
        navigator.share({
            title: `🏆 توقع مباراة ${team1} 🆚 ${team2}`,
            text: `🔮 توقع نتيجة مباراة ${team1} 🆚 ${team2} في كأس العالم 2026\n\n🔗 ${shareUrl}`,
            url: shareUrl
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => showCopyToast('✅ تم نسخ رابط المباراة!')).catch(
        () => {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyToast('✅ تم نسخ رابط المباراة!');
        });
    }
}

function initTabs() {
    console.log("🔹 تفعيل التبويبات");
    const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.tab;
            console.log("🔹 تبويب مختار:", id);
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const target = document.getElementById(`${id}Tab`);
            if (target) target.classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const dayFilter = document.getElementById('dayFilterTabs');
            if (id === 'upcoming') dayFilter.classList.add('visible');
            else dayFilter.classList.remove('visible');
            if (id === 'previous' && !state.previousGamesData.length) loadPreviousGames();
            if (id === 'standings' && state.previousGamesData.length) calculateStandings();
            if (id === 'scorers') renderScorers();
            if (id === 'stats') renderTeamStats();
            if (id === 'bracket') renderBracket();
            if (id === 'predictions') renderAllPredictions();
        });
    });
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const id = activeTab.dataset.tab;
        const target = document.getElementById(`${id}Tab`);
        if (target) target.classList.add('active');
        if (id === 'upcoming') document.getElementById('dayFilterTabs').classList.add('visible');
    }
    console.log("✅ التبويبات مفعلة");
}

function showPasswordOverlay() {
    document.getElementById('passwordOverlay').classList.add('active');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('modalCompactBtn').classList.remove('visible');
    setTimeout(() => document.getElementById('passwordInput').focus(), 300);
    document.body.style.overflow = 'hidden';
}

function hidePasswordOverlay() {
    document.getElementById('passwordOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function checkPassword() {
    const input = document.getElementById('passwordInput').value.trim();
    const errorEl = document.getElementById('passwordError');
    if (input === SECRET_CODE) {
        isAuthorized = true;
        errorEl.textContent = '';
        hidePasswordOverlay();
        document.getElementById('shareAllContainer').classList.add('visible');
        document.getElementById('adminControls').classList.add('visible');
        if (document.getElementById('matchPredictionsModal').classList.contains('active')) {
            document.getElementById('modalCompactBtn').classList.add('visible');
        }
        updateShareAllCount();
        showCopyToast('✅ تم تفعيل لوحة الإدارة');
    } else {
        errorEl.textContent = '❌ رمز غير صحيح';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

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
            const parts = p.match_id.split('_');
            if (parts.length < 3) return false;
            return (parts[1] === game.homeAr && parts[2] === game.awayAr) ||
                (parts[1] === game.awayAr && parts[2] === game.homeAr);
        });

        let correct = 0,
            wrong = 0;
        const result = game.homeScore > game.awayScore ? game.homeAr :
            game.awayScore > game.homeScore ? game.awayAr : "DRAW";

        for (let p of matchPredictions) {
            if (p.prediction === result) correct++;
            else wrong++;
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
        html += `
              <div class="archive-item" onclick="openPreviousMatchPredictions('${m.homeAr}', '${m.awayAr}', ${m.homeScore}, ${m.awayScore})">
                <div class="match-info">
                  <span class="flag">${getFlag(m.homeAr)}</span> ${m.homeAr}
                  <span class="score">${m.homeScore} - ${m.awayScore}</span>
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

async function loadDuplicates() {
    const section = document.getElementById('duplicatesSection');
    const container = document.getElementById('duplicatesContainer');
    const badge = document.getElementById('dupCountBadge');

    if (section.classList.contains('visible')) {
        section.classList.remove('visible');
        return;
    }

    section.classList.add('visible');
    container.innerHTML = `<div class="duplicates-empty">⏳ جاري البحث عن التكرارات...</div>`;

    if (!supabaseClient) {
        container.innerHTML = `<div class="duplicates-empty">❌ Supabase غير متصل</div>`;
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("user_name, match_id, prediction, created_at")
            .order("created_at", { ascending: false })
            .limit(500);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="duplicates-empty">📭 لا توجد توقعات مسجلة</div>`;
            badge.textContent = '0';
            return;
        }

        const groups = {};
        for (let p of data) {
            const key = `${p.user_name}|${p.match_id}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(p);
        }

        const duplicates = {};
        for (let [key, items] of Object.entries(groups)) {
            if (items.length > 1) {
                const [userName, matchId] = key.split('|');
                duplicates[key] = {
                    user_name: userName,
                    match_id: matchId,
                    count: items.length,
                    predictions: items.map(p => p.prediction),
                    created_at: items[0].created_at
                };
            }
        }

        const dupKeys = Object.keys(duplicates);
        badge.textContent = dupKeys.length;

        if (dupKeys.length === 0) {
            container.innerHTML = `<div class="duplicates-empty">✅ لا توجد توقعات مكررة</div>`;
            return;
        }

        let html =
            `<table class="duplicates-table"><thead><tr><th>المستخدم</th><th>المباراة</th><th>التكرار</th><th>التوقعات</th></tr></thead><tbody>`;
        for (let key of dupKeys) {
            const d = duplicates[key];
            const parts = d.match_id.split('_');
            const team1 = parts[1] || '?';
            const team2 = parts[2] || '?';
            const preds = d.predictions.map(p => p === 'DRAW' ? 'تعادل' : p).join(' / ');
            html += `<tr>
                <td class="dup-user">${d.user_name}</td>
                <td class="dup-match">${getFlag(team1)} ${team1} 🆚 ${getFlag(team2)} ${team2}</td>
                <td class="dup-count">${d.count}</td>
                <td class="dup-preds">${preds}</td>
              </tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (e) {
        console.error("❌ جلب التكرارات:", e);
        container.innerHTML = `<div class="duplicates-empty">❌ حدث خطأ: ${e.message}</div>`;
    }
}

function runTests() {
    const modal = document.getElementById('testResultsModal');
    const content = document.getElementById('testResultsContent');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    content.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> جاري تشغيل الاختبارات...</div>`;

    setTimeout(() => {
        const results = [];
        let pass = 0,
            fail = 0;

        try {
            const future = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            const near = new Date(Date.now() + 2 * 60 * 1000).toISOString();
            const past = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            const r1 = canPredict(future) === true;
            const r2 = canPredict(near) === false;
            const r3 = canPredict(past) === false;
            if (r1 && r2 && r3) { pass++;
                results.push('✅ canPredict - صحيح'); } else { fail++;
                results.push('❌ canPredict - فشل'); }
        } catch (e) { fail++;
            results.push('❌ canPredict - استثناء: ' + e.message); }

        try {
            const t1 = translateToArabic('Argentina') === 'الأرجنتين';
            const t2 = translateToArabic('Germany') === 'ألمانيا';
            if (t1 && t2) { pass++;
                results.push('✅ translateToArabic - صحيح'); } else { fail++;
                results.push('❌ translateToArabic - فشل'); }
        } catch (e) { fail++;
            results.push('❌ translateToArabic - استثناء: ' + e.message); }

        try {
            const fakeGames = [{ homeAr: 'البرازيل', awayAr: 'الأرجنتين', homeScore: 2, awayScore: 1 }];
            const original = state.previousGamesData;
            state.previousGamesData = fakeGames;
            const res = findMatchResult('البرازيل', 'الأرجنتين');
            state.previousGamesData = original;
            if (res && res.homeScore === 2 && res.awayScore === 1) { pass++;
                results.push('✅ findMatchResult - صحيح'); } else { fail++;
                results.push('❌ findMatchResult - فشل'); }
        } catch (e) { fail++;
            results.push('❌ findMatchResult - استثناء: ' + e.message); }

        try {
            const key = 'submitted_matches';
            const old = localStorage.getItem(key);
            localStorage.setItem(key, JSON.stringify(['test1', 'test2']));
            const list = getSubmittedMatches();
            localStorage.setItem(key, old || '[]');
            if (Array.isArray(list) && list.length === 2 && list.includes('test1')) { pass++;
                results.push('✅ getSubmittedMatches - صحيح'); } else { fail++;
                results.push('❌ getSubmittedMatches - فشل'); }
        } catch (e) { fail++;
            results.push('❌ getSubmittedMatches - استثناء: ' + e.message); }

        try {
            const f1 = getFlag('البرازيل') === '🇧🇷';
            const f2 = getFlag('فرنسا') === '🇫🇷';
            if (f1 && f2) { pass++;
                results.push('✅ getFlag - صحيح'); } else { fail++;
                results.push('❌ getFlag - فشل'); }
        } catch (e) { fail++;
            results.push('❌ getFlag - استثناء: ' + e.message); }

        const total = results.length;
        content.innerHTML = `
              <div style="text-align:center;margin-bottom:16px;">
                <div style="font-size:1.2rem;font-weight:800;color:var(--gold-light);">
                  ${pass} ✅ نجاح / ${fail} ❌ فشل
                </div>
                <div style="font-size:0.8rem;color:var(--text-secondary);">من أصل ${total} اختبار</div>
              </div>
              <div style="max-height:300px;overflow-y:auto;text-align:right;">
                ${results.map(r => `<div style="padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.8rem;">${r}</div>`).join('')}
              </div>
              <div style="text-align:center;margin-top:16px;">
                <button class="tab-btn" onclick="document.getElementById('testResultsModal').classList.remove('active');document.body.style.overflow='';" style="background:rgba(240,180,41,0.08);border-color:rgba(240,180,41,0.2);color:var(--gold-light);">إغلاق</button>
              </div>
            `;
    }, 500);
}

function checkUrlForMatch() {
    const params = new URLSearchParams(window.location.search);
    const matchId = params.get('m');
    if (matchId && !isNaN(matchId)) {
        const match = matchesData.find(m => m.id === parseInt(matchId));
        if (match && !isMatchFinished(match.timeISO)) {
            setTimeout(() => {
                openNameModal(`${match.timeISO}_${match.team1}_${match.team2}`, match.team1,
                    match.team2, match.timeISO);
            }, 800);
        }
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme === 'light' ? 'light' : '');
    localStorage.setItem('theme', newTheme);
    document.getElementById('themeToggleBtn').textContent = newTheme === 'light' ? '☀️ الوضع الفاتح' :
        '🌙 الوضع المظلم';
}

function closePredictionModal() {
    document.getElementById('predictionModal').classList.remove('active');
    document.body.style.overflow = '';
    isEditing = false;
}

function closeViewPredictionsModal() {
    document.getElementById('viewPredictionsModal').classList.remove('active');
    document.body.style.overflow = '';
}

function closePlayerPredictionsModal() {
    document.getElementById('playerPredictionsModal').classList.remove('active');
    document.body.style.overflow = '';
}

function closeMatchPredictionsModal() {
    document.getElementById('matchPredictionsModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ------------------------------------------------------------
//  النوافذ الرئيسية للتوقعات
// ------------------------------------------------------------

let nameModalMatchId = '',
    nameModalTeam1 = '',
    nameModalTeam2 = '',
    nameModalTimeISO = '';

function openNameModal(matchId, team1, team2, timeISO) {
    if (isMatchFinished(timeISO)) { showCopyToast('⛔ هذه المباراة انتهت، لا يمكن التوقع.'); return; }
    if (!canPredict(timeISO)) { showCopyToast(
            '⛔ لا يمكن التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).'); return; }

    nameModalMatchId = matchId;
    nameModalTeam1 = team1;
    nameModalTeam2 = team2;
    nameModalTimeISO = timeISO;

    document.getElementById('nameInput').value = localStorage.getItem('lastUserName') || '';
    document.getElementById('nameStatus').style.display = 'none';
    document.getElementById('nameError').textContent = '';
    document.getElementById('nameSubmitBtn').disabled = false;
    document.getElementById('nameSubmitBtn').textContent = 'متابعة →';

    document.getElementById('nameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('nameInput').focus(), 300);
}

function closeNameModal() {
    document.getElementById('nameModal').classList.remove('active');
    document.body.style.overflow = '';
}

let currentMatchId = '',
    currentTeam1 = '',
    currentTeam2 = '',
    currentTimeISO = '';

function openPredictionModal(matchId, team1, team2, timeISO, userName) {
    if (isMatchFinished(timeISO)) { showCopyToast('⛔ هذه المباراة انتهت، لا يمكن التوقع.'); return; }
    if (!canPredict(timeISO)) { showCopyToast(
            '⛔ لا يمكن التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).'); return; }

    isEditing = false;
    currentMatchId = matchId;
    currentTeam1 = team1;
    currentTeam2 = team2;
    currentTimeISO = timeISO;
    currentUserName = userName || localStorage.getItem('lastUserName') || '';

    document.getElementById('modalTitle').textContent = '📝 توقع نتيجة المباراة';
    document.getElementById('greetingName').textContent = currentUserName;
    document.getElementById('modalUserGreeting').style.display = 'block';
    document.getElementById('modalTeam1').textContent = team1;
    document.getElementById('modalTeam2').textContent = team2;
    document.getElementById('optTeam1').textContent = team1;
    document.getElementById('optTeam2').textContent = team2;
    document.getElementById('modalFlag1').textContent = getFlag(team1);
    document.getElementById('modalFlag2').textContent = getFlag(team2);
    document.getElementById('modalDateTime').textContent = `📅 ${getDateTimeDisplay(timeISO)} (بتوقيتك المحلي)`;

    const msgEl = document.getElementById('modalMessage');
    msgEl.textContent = '';
    msgEl.className = 'modal-message';

    if (isMatchSubmitted(matchId)) {
        msgEl.textContent = `⚠️ توقعت مسبقاً هذه المباراة`;
        msgEl.className = 'modal-message warning';
        document.getElementById('modalSubmitBtn').disabled = true;
    } else {
        document.getElementById('modalSubmitBtn').disabled = false;
    }

    document.getElementById('modalSubmitBtn').textContent = '💾 حفظ التوقع';
    document.querySelectorAll('input[name="prediction"]').forEach(el => el.checked = false);

    document.getElementById('predictionModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openEditPredictionModal(matchId, team1, team2, timeISO) {
    if (isMatchFinished(timeISO)) { showCopyToast('⛔ هذه المباراة انتهت، لا يمكن تعديل التوقع.'); return; }
    if (!canPredict(timeISO)) { showCopyToast(
            '⛔ لا يمكن تعديل التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).'
        ); return; }

    const savedUserName = localStorage.getItem('lastUserName') || '';
    if (!savedUserName) {
        showCopyToast('⚠️ الرجاء تسجيل اسمك أولاً');
        return;
    }

    getUserPrediction(savedUserName, matchId).then(existing => {
        if (!existing) {
            showCopyToast('⚠️ لا يوجد توقع سابق لهذه المباراة');
            return;
        }

        isEditing = true;
        currentMatchId = matchId;
        currentTeam1 = team1;
        currentTeam2 = team2;
        currentTimeISO = timeISO;
        currentUserName = savedUserName;

        document.getElementById('modalTitle').textContent = '✏️ تعديل توقع المباراة';
        document.getElementById('greetingName').textContent = savedUserName;
        document.getElementById('modalUserGreeting').style.display = 'block';
        document.getElementById('modalTeam1').textContent = team1;
        document.getElementById('modalTeam2').textContent = team2;
        document.getElementById('optTeam1').textContent = team1;
        document.getElementById('optTeam2').textContent = team2;
        document.getElementById('modalFlag1').textContent = getFlag(team1);
        document.getElementById('modalFlag2').textContent = getFlag(team2);
        document.getElementById('modalDateTime').textContent = `📅 ${getDateTimeDisplay(timeISO)} (بتوقيتك المحلي)`;

        const currentPrediction = existing.prediction;
        document.querySelectorAll('input[name="prediction"]').forEach(el => {
            const val = el.value;
            if (val === 'HOME' && currentPrediction === team1) el.checked = true;
            else if (val === 'AWAY' && currentPrediction === team2) el.checked = true;
            else if (val === 'DRAW' && currentPrediction === 'DRAW') el.checked = true;
        });

        const msgEl = document.getElementById('modalMessage');
        msgEl.textContent =
            `✏️ تعديل توقعك الحالي: ${currentPrediction === 'DRAW' ? 'تعادل' : currentPrediction}`;
        msgEl.className = 'modal-message info';

        document.getElementById('modalSubmitBtn').disabled = false;
        document.getElementById('modalSubmitBtn').textContent = '💾 تحديث التوقع';

        document.getElementById('predictionModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

async function openMatchPredictions(matchId, team1, team2, homeScore, awayScore) {
    if (!state.loaded) {
        await loadPreviousGames();
        await getAllPredictions();
    }
    document.getElementById('mpTeam1').textContent = team1;
    document.getElementById('mpTeam2').textContent = team2;
    document.getElementById('mpFlag1').textContent = getFlag(team1);
    document.getElementById('mpFlag2').textContent = getFlag(team2);
    let result = findMatchResult(team1, team2);
    if (result) {
        homeScore = result.homeScore;
        awayScore = result.awayScore;
        document.getElementById('mpResult').textContent = `النتيجة: ${homeScore} - ${awayScore}`;
    } else {
        document.getElementById('mpResult').textContent = `⚠️ لم يتم العثور على نتيجة هذه المباراة بعد`;
    }
    if (isAuthorized) { document.getElementById('modalCompactBtn').classList.add('visible'); } else { document
            .getElementById('modalCompactBtn').classList.remove('visible'); }
    if (isModalCompact) { isModalCompact = false;
        document.getElementById('matchPredictionsContent').classList.remove('compact-mode');
        document.getElementById('modalCompactBtn').textContent = '📐 تصغير'; }
    const scorersDiv = document.getElementById('mpScorersDetail');
    let scorersHtml = '';
    let matchOF = state.openfootballMatches.find(m => {
        const h = translateToArabic(m.team1 || '');
        const a = translateToArabic(m.team2 || '');
        return (h === team1 && a === team2) || (h === team2 && a === team1);
    });
    if (matchOF) {
        const goals = [...(matchOF.goals1 || []), ...(matchOF.goals2 || [])];
        if (goals.length) {
            scorersHtml += `<div style="margin:4px 0;"><strong>⚽ الأهداف:</strong></div>`;
            if (matchOF.goals1 && matchOF.goals1.length) {
                scorersHtml += `<div>${getFlag(team1)} <strong>${team1}</strong>: `;
                scorersHtml += matchOF.goals1.map(g => {
                    let minute = g.minute ? ` ${g.minute}'` : '';
                    let name = g.name || 'لاعب';
                    return `<span class="goal-item"><span class="minute">${minute}</span> ${name}</span>`;
                }).join(' ');
                scorersHtml += `</div>`;
            }
            if (matchOF.goals2 && matchOF.goals2.length) {
                scorersHtml += `<div>${getFlag(team2)} <strong>${team2}</strong>: `;
                scorersHtml += matchOF.goals2.map(g => {
                    let minute = g.minute ? ` ${g.minute}'` : '';
                    let name = g.name || 'لاعب';
                    return `<span class="goal-item"><span class="minute">${minute}</span> ${name}</span>`;
                }).join(' ');
                scorersHtml += `</div>`;
            }
        } else {
            scorersHtml = `<div style="color:var(--text-secondary);">⚽ لا توجد أهداف مسجلة</div>`;
        }
    } else {
        scorersHtml = `<div style="color:var(--text-secondary);">⚽ لا توجد تفاصيل للأهداف</div>`;
    }
    scorersDiv.innerHTML = scorersHtml;

    const correctSpan = document.getElementById('mpCorrectCount');
    const wrongSpan = document.getElementById('mpWrongCount');
    const totalSpan = document.getElementById('mpTotalCount');
    const tbody = document.getElementById('predictionsTableBody');
    tbody.innerHTML =
        `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary);">⏳ جاري التحميل...</td></tr>`;
    correctSpan.textContent = '...';
    wrongSpan.textContent = '...';
    totalSpan.textContent = '...';

    let predictions = state.predictions;
    if (!predictions || !predictions.length) {
        await getAllPredictions();
        predictions = state.predictions;
    }
    const matchPredictions = predictions
        .filter(p => p.match_id === matchId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    totalSpan.textContent = matchPredictions.length;
    if (matchPredictions.length === 0) {
        tbody.innerHTML =
            `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-secondary);">📭 لا توجد توقعات لهذه المباراة</td></tr>`;
        correctSpan.textContent = '0';
        wrongSpan.textContent = '0';
        document.getElementById('matchPredictionsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }
    let correctResult = "DRAW";
    if (result) {
        correctResult = result.homeScore > result.awayScore ? team1 : (result.awayScore > result.homeScore ? team2 :
            "DRAW");
    } else {
        let rows = '';
        matchPredictions.forEach((p, idx) => {
            let predictionText = p.prediction === 'DRAW' ? 'تعادل' : `فوز ${p.prediction}`;
            rows += `<tr>
                <td class="user-name" onclick="openPlayerPredictions('${p.user_name || ''}')">${p.user_name || 'مجهول'}</td>
                <td class="prediction-text">${predictionText}</td>
                <td class="status-pending">⏳ لم تحدد</td>
                <td class="time-cell">${p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف'}</td>
              </tr>`;
        });
        tbody.innerHTML = rows;
        correctSpan.textContent = '0';
        wrongSpan.textContent = '0';
        document.getElementById('matchPredictionsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }
    let correctCount = 0,
        wrongCount = 0;
    let rows = '';
    matchPredictions.forEach((p, idx) => {
        const isCorrect = p.prediction === correctResult;
        if (isCorrect) correctCount++;
        else wrongCount++;
        let predictionText = p.prediction === 'DRAW' ? 'تعادل' : `فوز ${p.prediction}`;
        const statusText = isCorrect ? 'صحيح' : 'خاطئ';
        const statusClass = isCorrect ? 'status-correct' : 'status-wrong';
        const predClass = isCorrect ? 'correct' : 'wrong';
        const timeStr = p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف';
        rows += `<tr>
              <td class="user-name" onclick="openPlayerPredictions('${p.user_name || ''}')">${p.user_name || 'مجهول'}</td>
              <td class="prediction-text ${predClass}">${predictionText}</td>
              <td class="${statusClass}">${statusText}</td>
              <td class="time-cell">${timeStr}</td>
            </tr>`;
    });
    correctSpan.textContent = correctCount;
    wrongSpan.textContent = wrongCount;
    tbody.innerHTML = rows;
    document.getElementById('matchPredictionsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function openPlayerPredictions(userName) {
    if (!userName) { showCopyToast('⚠️ اسم المستخدم غير معروف'); return; }
    document.getElementById('playerModalName').textContent = userName;
    const listContainer = document.getElementById('playerPredictionsList');
    const correctSpan = document.getElementById('playerCorrectCount');
    const wrongSpan = document.getElementById('playerWrongCount');
    const totalSpan = document.getElementById('playerTotalCount');
    listContainer.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> جاري التحميل...</div>`;
    correctSpan.textContent = '...';
    wrongSpan.textContent = '...';
    totalSpan.textContent = '...';

    const predictions = await getPredictionsForUserFull(userName);
    let correct = 0,
        wrong = 0;
    for (let p of predictions) {
        const status = getPredictionStatus(p);
        if (status.status === 'correct') correct++;
        else if (status.status === 'wrong') wrong++;
    }
    correctSpan.textContent = correct;
    wrongSpan.textContent = wrong;
    totalSpan.textContent = predictions.length;

    if (!predictions || predictions.length === 0) {
        listContainer.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات لهذا اللاعب</div>`;
        document.getElementById('playerPredictionsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        return;
    }

    predictions.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let html = '';
    predictions.forEach((p, idx) => {
        const parts = p.match_id.split('_');
        const team1 = parts[1] || '?';
        const team2 = parts[2] || '?';
        const predText = p.prediction === 'DRAW' ? 'تعادل' : `فوز ${p.prediction}`;
        const status = getPredictionStatus(p);
        let statusClass = 'pending';
        let statusText = '⏳ لم تحدد';
        if (status.status === 'correct') { statusClass = 'correct';
            statusText = '✅ صحيح'; } else if (status.status === 'wrong') { statusClass = 'wrong';
            statusText = '❌ خاطئ'; } else { statusClass = 'pending';
            statusText = '⏳ قيد الانتظار'; }

        html += `
              <div class="player-prediction-item">
                <div class="num">#${idx + 1}</div>
                <div class="match-info">
                  <div class="teams">
                    <span class="flag">${getFlag(team1)}</span> ${team1} 🆚 <span class="flag">${getFlag(team2)}</span> ${team2}
                  </div>
                  <div class="pred">🔮 ${predText}</div>
                  <span class="status ${statusClass}">${statusText}</span>
                </div>
                <div class="time">🕒 ${p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف'}</div>
              </div>
            `;
    });

    listContainer.innerHTML = html;
    document.getElementById('playerPredictionsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function openViewPredictionsModal(matchId, team1, team2) {
    document.getElementById('viewTeam1').textContent = team1;
    document.getElementById('viewTeam2').textContent = team2;
    document.getElementById('viewFlag1').textContent = getFlag(team1);
    document.getElementById('viewFlag2').textContent = getFlag(team2);
    document.getElementById('probTeam1').textContent = team1;
    document.getElementById('probTeam2').textContent = team2;
    const listContainer = document.getElementById('viewPredictionsList');
    const countSpan = document.getElementById('viewPredictionsCount');
    listContainer.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> جاري التحميل...</div>`;
    countSpan.textContent = '...';

    const predictions = await getPredictionsForMatchFull(matchId);
    countSpan.textContent = predictions.length;

    let homeCount = 0,
        awayCount = 0,
        drawCount = 0;
    for (let p of predictions) {
        if (p.prediction === team1) homeCount++;
        else if (p.prediction === team2) awayCount++;
        else if (p.prediction === 'DRAW') drawCount++;
    }
    const totalPreds = predictions.length;
    const homePercent = totalPreds > 0 ? (homeCount / totalPreds) * 100 : 0;
    const awayPercent = totalPreds > 0 ? (awayCount / totalPreds) * 100 : 0;
    const drawPercent = totalPreds > 0 ? (drawCount / totalPreds) * 100 : 0;

    document.getElementById('probHomePercent').textContent = homePercent.toFixed(1) + '%';
    document.getElementById('probAwayPercent').textContent = awayPercent.toFixed(1) + '%';
    document.getElementById('probDrawPercent').textContent = drawPercent.toFixed(1) + '%';

    document.querySelector('#probBar .segment.home').style.width = homePercent + '%';
    document.querySelector('#probBar .segment.home').textContent = homePercent.toFixed(0) + '%';
    document.querySelector('#probBar .segment.draw').style.width = drawPercent + '%';
    document.querySelector('#probBar .segment.draw').textContent = drawPercent.toFixed(0) + '%';
    document.querySelector('#probBar .segment.away').style.width = awayPercent + '%';
    document.querySelector('#probBar .segment.away').textContent = awayPercent.toFixed(0) + '%';

    if (totalPreds === 0) {
        document.querySelector('#probBar .segment.home').style.width = '33.33%';
        document.querySelector('#probBar .segment.home').textContent = '0%';
        document.querySelector('#probBar .segment.draw').style.width = '33.33%';
        document.querySelector('#probBar .segment.draw').textContent = '0%';
        document.querySelector('#probBar .segment.away').style.width = '33.33%';
        document.querySelector('#probBar .segment.away').textContent = '0%';
    }

    if (!predictions || predictions.length === 0) {
        listContainer.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات لهذه المباراة</div>`;
    } else {
        let html = '';
        predictions.forEach((p, idx) => {
            let text = p.prediction === 'DRAW' ? '🤝 تعادل الفريقين' :
                `🏆 فوز ${getFlag(p.prediction)} ${p.prediction}`;
            const status = getPredictionStatus(p);
            let statusText = '⏳ قيد الانتظار';
            let statusClass = 'pending';
            if (status.status === 'correct') { statusText = '✅ صحيح';
                statusClass = 'correct'; } else if (status.status === 'wrong') { statusText = '❌ خاطئ';
                statusClass = 'wrong'; }
            html += `
                <div class="prediction-card ${statusClass}" onclick="openPlayerPredictions('${p.user_name || ''}')" style="cursor:pointer;">
                  <div class="user"><div class="avatar-p">${p.user_name ? p.user_name.charAt(0).toUpperCase() : '👤'}</div><span class="name-p">${p.user_name || 'مجهول'}</span></div>
                  <div class="prediction-text">🔮 ${text}</div>
                  <span class="status-badge ${statusClass}">${statusText}</span>
                  <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:4px;">🕒 ${p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف'}</div>
                </div>
              `;
        });
        listContainer.innerHTML = html;
    }
    document.getElementById('viewPredictionsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ------------------------------------------------------------
//  تحميل البيانات الخارجية
// ------------------------------------------------------------

async function loadPreviousGames() {
    try {
        const cached = getCache("games");
        if (cached) {
            state.previousGamesData = cached;
            renderPreviousGamesFiltered();
            calculateStandings();
            renderTeamStats();
            renderBracket();
            renderLeaderboard(currentLeaderboardPeriod);
            updateScorers();
            updateNewsTicker();
            return;
        }
        const response = await fetch('https://worldcup26.ir/get/games');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data?.games) throw new Error('تنسيق غير صحيح');
        state.allGames = data.games;
        const finished = state.allGames.filter(g => g.finished === "TRUE");
        const newData = finished.map(game => {
            const homeAr = translateToArabic(game.home_team_name_fa || game.home_team_name_en || '');
            const awayAr = translateToArabic(game.away_team_name_fa || game.away_team_name_en || '');
            const homeScore = parseInt(game.home_score, 10);
            const awayScore = parseInt(game.away_score, 10);
            const sortTimestamp = getSortTimestamp(game);
            let dayName = '',
                formattedDate = '',
                timeMatch = '';
            const dateStr = game.local_date || '';
            if (dateStr) {
                const parts = dateStr.split(' ');
                const dateParts = parts[0]?.split('/');
                if (dateParts && dateParts.length === 3) {
                    const d = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}T12:00:00`);
                    if (!isNaN(d)) {
                        dayName = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d
                        .getDay()];
                        formattedDate =
                            `${d.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()]} ${d.getFullYear()}`;
                    }
                }
                if (parts.length > 1 && parts[1]?.match(/\d{2}:\d{2}/)) {
                    timeMatch = parts[1];
                }
            }
            return { homeAr, awayAr, homeScore, awayScore, dayName, formattedDate, timeMatch, sortTimestamp };
        });
        state.previousGamesData = newData;
        setCache("games", newData);
        renderPreviousGamesFiltered();
        calculateStandings();
        renderTeamStats();
        renderBracket();
        renderLeaderboard(currentLeaderboardPeriod);
        updateScorers();
        updateNewsTicker();
    } catch (e) {
        console.error("❌ تحميل السابقة:", e);
        if (state.previousGamesData.length === 0) {
            document.getElementById('previousMatchesContainer').innerHTML =
                `<div class="empty-state"><span class="icon">⚠️</span> فشل التحميل <button onclick="loadPreviousGames()" style="display:block;margin:12px auto 0;background:var(--gold);border:none;padding:8px 24px;border-radius:40px;font-weight:700;color:#0a1628;cursor:pointer;font-family:inherit;">🔄 إعادة المحاولة</button></div>`;
        }
    }
}

async function fetchOpenfootballData() {
    const cached = getCache("openfootball");
    if (cached) {
        state.openfootballMatches = cached;
        updateScorers();
        renderBracket();
        return;
    }
    try {
        const res = await fetch("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json");
        const data = await res.json();
        state.openfootballMatches = data.matches || [];
        setCache("openfootball", state.openfootballMatches);
        updateScorers();
        renderBracket();
    } catch (e) {
        console.warn("⚠️ فشل تحميل بيانات openfootball:", e);
        state.openfootballMatches = [];
    }
}

// ------------------------------------------------------------
//  التهيئة والتحديث التلقائي
// ------------------------------------------------------------

async function init() {
    console.log("🚀 INIT START (محسن)");
    await Promise.all([
        loadPreviousGames(),
        fetchOpenfootballData(),
        getAllPredictions()
    ]);
    state.loaded = true;
    updateScorers();
    renderLeaderboard('all');
    renderUpcoming();
    calculateStandings();
    renderTeamStats();
    renderScorers();
    renderBracket();
    renderAllPredictions();
    initTabs();
    checkUrlForMatch();
    startAutoUpdate();
    updateNewsTicker();
    console.log("✅ INIT DONE (محسن)");
}

function startAutoUpdate() {
    setInterval(renderUpcoming, 1000);
    setInterval(async () => {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab === 'previous') loadPreviousGames();
        if (activeTab === 'standings' && state.previousGamesData.length) calculateStandings();
        if (activeTab === 'scorers') renderScorers();
        if (activeTab === 'stats') renderTeamStats();
        if (activeTab === 'bracket') renderBracket();
        if (activeTab === 'predictions') await renderAllPredictions();
        renderLeaderboard(currentLeaderboardPeriod);
        updateShareAllCount();
        updateNewsTicker();
    }, 30000);
}

// ------------------------------------------------------------
//  ربط الأحداث
// ------------------------------------------------------------

function bindEvents() {
    document.getElementById('footerTrigger').addEventListener('click', function(e) {
        e.preventDefault();
        if (isAuthorized) {
            document.getElementById('shareAllContainer').classList.toggle('visible');
            document.getElementById('adminControls').classList.toggle('visible');
            if (document.getElementById('shareAllContainer').classList.contains('visible')) {
                updateShareAllCount();
                showCopyToast('🔓 تم إظهار لوحة الإدارة');
            } else {
                showCopyToast('🔒 تم إخفاء لوحة الإدارة');
            }
        } else {
            showPasswordOverlay();
        }
    });
    document.getElementById('prevSearchInput')?.addEventListener('input', renderPreviousGamesFiltered);
    document.getElementById('groupFilter')?.addEventListener('change', renderUpcoming);
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDayFilter = this.dataset.day;
            renderUpcoming();
        });
    });

    document.getElementById('modalCloseBtn').addEventListener('click', closePredictionModal);
    document.getElementById('viewModalCloseBtn').addEventListener('click', closeViewPredictionsModal);
    document.getElementById('playerModalCloseBtn').addEventListener('click', closePlayerPredictionsModal);
    document.getElementById('matchPredictionsCloseBtn').addEventListener('click', closeMatchPredictionsModal);
    document.getElementById('predictionModal').addEventListener('click', function(e) { if (e.target === this)
            closePredictionModal(); });
    document.getElementById('viewPredictionsModal').addEventListener('click', function(e) { if (e.target === this)
            closeViewPredictionsModal(); });
    document.getElementById('playerPredictionsModal').addEventListener('click', function(e) { if (e.target === this)
            closePlayerPredictionsModal(); });
    document.getElementById('matchPredictionsModal').addEventListener('click', function(e) { if (e.target === this)
            closeMatchPredictionsModal(); });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePredictionModal();
            closeViewPredictionsModal();
            closePlayerPredictionsModal();
            closeMatchPredictionsModal();
        }
    });

    document.getElementById('passwordSubmitBtn').addEventListener('click', checkPassword);
    document.getElementById('passwordInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkPassword();
        if (e.key === 'Escape') hidePasswordOverlay();
    });
    document.getElementById('passwordCloseBtn').addEventListener('click', hidePasswordOverlay);
    document.getElementById('passwordOverlay').addEventListener('click', function(e) { if (e.target === this)
            hidePasswordOverlay(); });

    document.getElementById('nameCloseBtn').addEventListener('click', closeNameModal);
    document.getElementById('nameModal').addEventListener('click', function(e) { if (e.target === this)
            closeNameModal(); });
    document.getElementById('nameSubmitBtn').addEventListener('click', async function() {
        const name = document.getElementById('nameInput').value.trim();
        const errorEl = document.getElementById('nameError');
        const statusEl = document.getElementById('nameStatus');
        if (!name) { errorEl.textContent = '⚠️ الرجاء إدخال اسمك'; return; }
        if (!supabaseClient) { errorEl.textContent = '❌ خطأ في الاتصال بقاعدة البيانات'; return; }
        this.disabled = true;
        this.textContent = '⏳ جاري التحقق...';
        errorEl.textContent = '';
        statusEl.style.display = 'block';
        try {
            const { data, error } = await supabaseClient.from("predictions").select("user_name").eq(
                "user_name", name).limit(1);
            if (error) throw error;
            const isExisting = data && data.length > 0;
            if (isExisting) {
                statusEl.className = 'user-status existing';
                statusEl.textContent = `👤 مرحباً بعودتك "${name}"! سيتم إضافة التوقع إلى حسابك.`;
                localStorage.setItem('lastUserName', name);
                currentUserName = name;
                await loadUserPredictions(name);
                const existingPred = await getUserPrediction(name, nameModalMatchId);
                if (existingPred) {
                    errorEl.textContent =
                        `⚠️ لقد توقعت هذه المباراة مسبقاً: ${existingPred.prediction === 'DRAW' ? 'تعادل' : existingPred.prediction}`;
                    this.disabled = false;
                    this.textContent = 'متابعة →';
                    renderUpcoming();
                    return;
                }
                this.textContent = '✅ متابعة للتوقع';
                setTimeout(() => {
                    closeNameModal();
                    openPredictionModal(nameModalMatchId, nameModalTeam1, nameModalTeam2,
                        nameModalTimeISO, name);
                }, 600);
            } else {
                statusEl.className = 'user-status new';
                statusEl.textContent = `👤 مرحباً "${name}"! أنت لاعب جديد. سيتم تسجيل توقعاتك.`;
                localStorage.setItem('lastUserName', name);
                currentUserName = name;
                userPredictionsMap = {};
                this.textContent = '✅ متابعة للتوقع';
                setTimeout(() => {
                    closeNameModal();
                    openPredictionModal(nameModalMatchId, nameModalTeam1, nameModalTeam2,
                        nameModalTimeISO, name);
                }, 600);
            }
        } catch (e) {
            console.error("❌ التحقق من الاسم:", e);
            errorEl.textContent = '❌ حدث خطأ أثناء التحقق من الاسم';
            this.disabled = false;
            this.textContent = 'متابعة →';
            statusEl.style.display = 'none';
        }
    });
    document.getElementById('nameInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('nameSubmitBtn').click();
        }
        if (e.key === 'Escape') {
            closeNameModal();
        }
    });

    document.getElementById('modalSubmitBtn').addEventListener('click', async function() {
        const userName = currentUserName || localStorage.getItem('lastUserName') || '';
        const selected = document.querySelector('input[name="prediction"]:checked');
        const msgEl = document.getElementById('modalMessage');
        if (!userName) { msgEl.textContent = '⚠️ الرجاء إدخال اسمك';
            msgEl.className = 'modal-message warning'; return; }
        if (!selected) { msgEl.textContent = '⚠️ الرجاء اختيار توقع';
            msgEl.className = 'modal-message warning'; return; }
        let prediction = selected.value === 'HOME' ? currentTeam1 : (selected.value === 'AWAY' ? currentTeam2 :
            'DRAW');
        if (isMatchFinished(currentTimeISO)) { msgEl.textContent = '⛔ هذه المباراة انتهت، لا يمكن حفظ التوقع.';
            msgEl.className = 'modal-message error'; return; }
        if (isMatchLive(currentTimeISO)) { msgEl.textContent = '⛔ لا يمكن التوقع على مباراة جارية';
            msgEl.className = 'modal-message error'; return; }
        if (!canPredict(currentTimeISO)) { msgEl.textContent =
                '⛔ لا يمكن التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).';
            msgEl.className = 'modal-message error'; return; }
        if (!isEditing && isMatchSubmitted(currentMatchId)) {
            msgEl.textContent = '⚠️ لقد توقعت هذه المباراة مسبقاً';
            msgEl.className = 'modal-message warning';
            return;
        }
        this.disabled = true;
        msgEl.textContent = '⏳ جاري الحفظ...';
        msgEl.className = 'modal-message';
        const result = await savePrediction(userName, currentMatchId, prediction);
        if (result.success) {
            msgEl.textContent = result.updated ? '✅ تم تحديث التوقع بنجاح! 🎉' :
            '✅ تم حفظ التوقع بنجاح! 🎉';
            msgEl.className = 'modal-message success';
            this.disabled = false;
            if (userName) {
                await loadUserPredictions(userName);
            }
            await renderAllPredictions();
            renderLeaderboard(currentLeaderboardPeriod);
            renderUpcoming();
            updateNewsTicker();
            setTimeout(closePredictionModal, 1200);
        } else {
            msgEl.textContent = result.message || '❌ فشل الحفظ';
            msgEl.className = 'modal-message error';
            this.disabled = false;
        }
    });

    document.getElementById('compareModalCloseBtn').addEventListener('click', closeCompareModal);
    document.getElementById('compareModal').addEventListener('click', function(e) { if (e.target === this)
            closeCompareModal(); });

    document.getElementById('analyticsCloseBtn').addEventListener('click', function() {
        document.getElementById('analyticsModal').classList.remove('active');
        document.body.style.overflow = '';
    });
    document.getElementById('analyticsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            document.getElementById('analyticsModal').classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.getElementById('bracketModalCloseBtn').addEventListener('click', closeBracketModal);
    document.getElementById('bracketMatchModal').addEventListener('click', function(e) { if (e.target === this)
            closeBracketModal(); });

    document.getElementById('testResultsCloseBtn').addEventListener('click', function() {
        document.getElementById('testResultsModal').classList.remove('active');
        document.body.style.overflow = '';
    });
}

// ------------------------------------------------------------
//  بدء التطبيق
// ------------------------------------------------------------
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init().then(() => bindEvents());
    });
} else {
    init().then(() => bindEvents());
}
// نهاية ui.js