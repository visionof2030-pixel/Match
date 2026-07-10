// ============================================================
//  الملف الرئيسي - تشغيل التطبيق
// ============================================================

// ============================================================
//  الحالة العامة للتطبيق (تعريف قبل الاستخدام)
// ============================================================
const state = {
    previousGamesData: [],
    allGames: [],
    openfootballMatches: [],
    predictions: [],
    loaded: false
};

let currentDayFilter = 'all';
let isLoadingPrevious = false;

// ============================================================
//  دوال تحميل البيانات
// ============================================================
async function loadPreviousGamesFull() {
    if (isLoadingPrevious) return;
    isLoadingPrevious = true;
    try {
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
            let dateStr = game.local_date || '';
            let dayName = '',
                formattedDate = '',
                timeMatch = '';
            let sortTimestamp = 0;
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
                        sortTimestamp = d.getTime();
                    }
                }
                if (parts.length > 1 && parts[1]?.match(/\d{2}:\d{2}/)) {
                    timeMatch = parts[1];
                    const timeParts = parts[1].split(':');
                    if (timeParts.length === 2) {
                        sortTimestamp += parseInt(timeParts[0]) * 3600000 + parseInt(timeParts[1]) * 60000;
                    }
                }
            }
            const penaltyData = extractPenaltyData(game);
            let homePenalty = null,
                awayPenalty = null,
                hadPenalties = false;
            if (penaltyData) {
                homePenalty = parseInt(penaltyData.home);
                awayPenalty = parseInt(penaltyData.away);
                hadPenalties = true;
            }
            return { homeAr, awayAr, homeScore, awayScore, dayName, formattedDate, timeMatch, sortTimestamp,
                homePenalty, awayPenalty, hadPenalties };
        });
        state.previousGamesData = newData;
        setCache("games", newData);
        renderPreviousGamesFiltered();
        calculateStandings();
        renderTeamStats();
        renderBracket();
        renderLeaderboard(currentLeaderboardPeriod || 'all');
        updateScorers();
        updateNewsTicker();
    } catch (e) {
        console.error("❌ تحميل السابقة:", e);
        if (state.previousGamesData.length === 0) {
            document.getElementById('previousMatchesContainer').innerHTML =
                `<div class="empty-state"><span class="icon">⚠️</span> فشل التحميل <button onclick="loadPreviousGamesFull()" style="display:block;margin:12px auto 0;background:var(--gold-gradient);border:none;padding:8px 24px;border-radius:40px;font-weight:700;color:#0a0e1a;cursor:pointer;font-family:inherit;">🔄 إعادة المحاولة</button></div>`;
        }
    } finally { isLoadingPrevious = false; }
}

async function fetchOpenfootballData() {
    const cached = getCache("openfootball");
    if (cached) {
        state.openfootballMatches = cached;
        return;
    }
    try {
        const res = await fetch("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json");
        const data = await res.json();
        state.openfootballMatches = data.matches || [];
        setCache("openfootball", state.openfootballMatches);
    } catch (e) {
        console.warn("⚠️ فشل تحميل بيانات openfootball:", e);
        state.openfootballMatches = [];
    }
}

// ============================================================
//  دوال عرض المباريات السابقة
// ============================================================
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
        let penaltyHtml = '';
        if (g.hadPenalties && g.homePenalty !== null && g.awayPenalty !== null) {
            penaltyHtml =
                `<span class="score-penalty-badge">⚽ ركلات ترجيح: ${g.homePenalty} — ${g.awayPenalty}</span>`;
        }
        let winnerText = '';
        let result = { homeScore: g.homeScore, awayScore: g.awayScore, homeAr: g.homeAr, awayAr: g.awayAr,
            homePenalty: g.homePenalty, awayPenalty: g.awayPenalty, hadPenalties: g.hadPenalties };
        let winner = determineWinner(result);
        if (winner) {
            winnerText = `🏆 ${winner}`;
        }

        return `
            <div class="match-card finished-match" onclick="openPreviousMatchPredictions('${g.homeAr}', '${g.awayAr}', ${g.homeScore}, ${g.awayScore})">
                <div class="match-teams">
                    <div class="match-team"><span class="flag">${getFlag(g.homeAr)}</span> ${g.homeAr}</div>
                    <div class="match-score finished">${g.homeScore} - ${g.awayScore} ${penaltyHtml}</div>
                    <div class="match-team"><span class="flag">${getFlag(g.awayAr)}</span> ${g.awayAr}</div>
                </div>
                <div class="match-meta">
                    <span class="tag">${g.dayName || 'تاريخ'}</span>
                    <span class="tag">${g.formattedDate || ''} ${g.timeMatch || ''}</span>
                    <span class="tag finished-tag">✅ انتهت - اضغط لعرض التوقعات</span>
                    ${ground ? `<span class="tag stadium-tag">🏟️ ${ground}</span>` : ''}
                    ${winnerText ? `<span class="tag" style="color:var(--gold-light);">${winnerText}</span>` : ''}
                </div>
                <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="view-btn" onclick="event.stopPropagation();openPreviousMatchPredictions('${g.homeAr}','${g.awayAr}',${g.homeScore},${g.awayScore})" style="padding:6px 14px;border-radius:40px;font-size:0.6rem;font-weight:600;background:var(--info-bg);border:1px solid rgba(74,158,255,0.10);color:var(--info);cursor:pointer;font-family:inherit;">📋 عرض التوقعات</button>
                    <button class="share-link-btn" onclick="event.stopPropagation();copyMatchLink('${g.homeAr}_${g.awayAr}','${g.homeAr}','${g.awayAr}')" style="padding:4px 12px;border-radius:40px;font-size:0.55rem;font-weight:600;background:var(--info-bg);border:1px solid rgba(74,158,255,0.10);color:var(--info);cursor:pointer;font-family:inherit;">🔗 مشاركة</button>
                </div>
            </div>
        `;
    }).join('');
}

function openPreviousMatchPredictions(team1, team2, homeScore, awayScore) {
    const match = matchesData.find(m => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m.team2 ===
        team1));
    if (match) { const matchId = `${match.timeISO}_${match.team1}_${match.team2}`;
        openMatchPredictions(matchId, team1, team2, homeScore, awayScore); } else { showCopyToast(
            '⚠️ لا توجد توقعات لهذه المباراة'); }
}

// ============================================================
//  دوال إحصائيات الفرق
// ============================================================
function renderTeamStats() {
    const container = document.getElementById('teamStatsContainer');
    if (!state.previousGamesData.length) {
        container.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> لا توجد نتائج كافية</div>`;
        return;
    }
    const stats = {};
    state.previousGamesData.forEach(g => {
        const { homeAr, awayAr, homeScore, awayScore } = g;
        let result = { homeScore, awayScore, homeAr, awayAr, homePenalty: g.homePenalty, awayPenalty: g
                .awayPenalty, hadPenalties: g.hadPenalties };
        let winner = determineWinner(result);

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

        if (winner === homeAr) { stats[homeAr].wins++;
            stats[awayAr].losses++; } else if (winner === awayAr) { stats[awayAr].wins++;
            stats[homeAr].losses++; } else { stats[homeAr].draws++;
            stats[awayAr].draws++; }
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

function getTeamStats(teamName) {
    const games = state.previousGamesData || [];
    let wins = 0,
        losses = 0,
        draws = 0,
        goalsFor = 0,
        goalsAgainst = 0;
    const results = [];
    const scorers = {};

    for (let game of games) {
        let isHome = game.homeAr === teamName;
        let isAway = game.awayAr === teamName;
        if (!isHome && !isAway) continue;

        const homeScore = game.homeScore || 0;
        const awayScore = game.awayScore || 0;
        const result = { homeScore, awayScore, homeAr: game.homeAr, awayAr: game.awayAr, 
                         homePenalty: game.homePenalty, awayPenalty: game.awayPenalty, 
                         hadPenalties: game.hadPenalties };
        const winner = determineWinner(result);

        if (isHome) {
            goalsFor += homeScore;
            goalsAgainst += awayScore;
            if (winner === teamName) { wins++; results.push('W'); }
            else if (winner === game.awayAr) { losses++; results.push('L'); }
            else { draws++; results.push('D'); }
        } else {
            goalsFor += awayScore;
            goalsAgainst += homeScore;
            if (winner === teamName) { wins++; results.push('W'); }
            else if (winner === game.homeAr) { losses++; results.push('L'); }
            else { draws++; results.push('D'); }
        }
    }

    const total = wins + losses + draws;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    const goalDiff = goalsFor - goalsAgainst;

    // سلسلة النتائج (آخر 5 مباريات)
    const recentResults = results.slice(-5);
    const streak = recentResults.map(r => r === 'W' ? '✅' : r === 'L' ? '❌' : '➖').join('');

    // أفضل الهدافين
    if (state.openfootballMatches) {
        for (let match of state.openfootballMatches) {
            const homeTeam = translateToArabic(match.team1 || '');
            const awayTeam = translateToArabic(match.team2 || '');
            if (homeTeam !== teamName && awayTeam !== teamName) continue;
            
            const goals = [...(match.goals1 || []), ...(match.goals2 || [])];
            for (let g of goals) {
                if (!g.name) continue;
                let playerName = g.name;
                if (!scorers[playerName]) scorers[playerName] = 0;
                scorers[playerName]++;
            }
        }
    }

    // ترتيب الهدافين
    const topScorers = Object.entries(scorers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([name, goals]) => ({ name, goals }));

    return {
        wins,
        losses,
        draws,
        total,
        winRate,
        goalsFor,
        goalsAgainst,
        goalDiff,
        streak: streak || 'لا مباريات سابقة',
        results,
        topScorers
    };
}

// ============================================================
//  دوال التبويبات
// ============================================================
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
            if (id === 'previous' && !state.previousGamesData.length) loadPreviousGamesFull();
            if (id === 'standings' && state.previousGamesData.length) calculateStandings();
            if (id === 'scorers') renderScorers();
            if (id === 'stats') renderTeamStats();
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

// ============================================================
//  شريط الأخبار
// ============================================================
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
        const stats1 = getTeamStats(m.team1);
        const stats2 = getTeamStats(m.team2);
        const winRate1 = stats1.total > 0 ? Math.round(stats1.winRate) : 0;
        const winRate2 = stats2.total > 0 ? Math.round(stats2.winRate) : 0;
        return `${flag1} ${m.team1} (نسبة الفوز ${winRate1}%) 🆚 ${flag2} ${m.team2} (نسبة الفوز ${winRate2}%) (${timeStr})`;
    });
    text += matchTexts.join(' | ');

    // عرض التسلسل الزمني للمباريات اليوم
    text += ' | 🔄 التسلسل الزمني: ';
    const sortedTodayMatches = [...todayMatches].sort((a, b) => matchTime(a.timeISO) - matchTime(b.timeISO));
    const sequenceTexts = sortedTodayMatches.map((m, index) => {
        const timeStr = getTimeFromISO(m.timeISO);
        return `${index+1}. ${m.team1} 🆚 ${m.team2} (${timeStr})`;
    });
    text += sequenceTexts.join(' → ');

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
                text += ` | 🔥 أكثر متوقع اليوم: ${topUser[0]} (${predCount} توقع${predCount > 1 ? 'ات' : ''})`;
            }
        }
    }

    tickerEl.textContent = text;
}

// ============================================================
//  التحقق من رابط المباراة في URL
// ============================================================
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

// ============================================================
//  التحديث التلقائي
// ============================================================
function startAutoUpdate() {
    setInterval(renderUpcoming, 1000);
    setInterval(async () => {
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        if (activeTab === 'previous') loadPreviousGamesFull();
        if (activeTab === 'standings' && state.previousGamesData.length) calculateStandings();
        if (activeTab === 'scorers') renderScorers();
        if (activeTab === 'stats') renderTeamStats();
        if (activeTab === 'predictions') await renderAllPredictions();
        renderLeaderboard(currentLeaderboardPeriod || 'all');
        updateShareAllCount();
        updateNewsTicker();
    }, 30000);
}

// ============================================================
//  الاختبارات
// ============================================================
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
                ${results.map(r => `<div style="padding:4px 8px;border-bottom:1px solid var(--border-subtle);font-size:0.8rem;">${r}</div>`).join('')}
            </div>
            <div style="text-align:center;margin-top:16px;">
                <button class="tab-btn" onclick="document.getElementById('testResultsModal').classList.remove('active');document.body.style.overflow='';" style="background:var(--gold-glow);border-color:var(--border-gold);color:var(--gold-light);">إغلاق</button>
            </div>
        `;
    }, 500);
}

// ============================================================
//  دوال عرض جميع التوقعات
// ============================================================
async function renderAllPredictions() {
    const container = document.getElementById('allPredictions');
    const countSpan = document.getElementById('predictionsCount');
    
    // جلب أحدث التوقعات من Supabase
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from("predictions")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(200);
            if (!error && data) {
                state.predictions = data;
                setCache("predictions", data);
            }
        } catch (e) {
            console.warn("⚠️ فشل جلب أحدث التوقعات:", e);
        }
    }
    
    let predictions = state.predictions || [];
    countSpan.textContent = predictions.length;
    
    if (!predictions || predictions.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات بعد</div>`;
        return;
    }
    
    // ترتيب التوقعات من الأحدث إلى الأقدم
    const sorted = [...predictions].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
    });
    
    // عرض أول 100 توقع
    const displayPredictions = sorted.slice(0, 100);
    
    container.innerHTML = displayPredictions.map(p => {
        const parts = p.match_id ? p.match_id.split('_') : [];
        const team1 = parts.length > 1 ? parts[1] : '?';
        const team2 = parts.length > 2 ? parts[2] : '?';
        
        let predictionText = '';
        if (p.prediction === 'DRAW') {
            predictionText = `🤝 تعادل`;
        } else if (p.prediction === team1) {
            predictionText = `🏆 فوز ${getFlag(team1)} ${team1}`;
        } else if (p.prediction === team2) {
            predictionText = `🏆 فوز ${getFlag(team2)} ${team2}`;
        } else {
            predictionText = `🔮 ${p.prediction}`;
        }
        
        const status = getPredictionStatus(p);
        let cardClass = 'pending';
        let badgeClass = 'pending';
        if (status.status === 'correct') {
            cardClass = 'correct';
            badgeClass = 'correct';
        } else if (status.status === 'wrong') {
            cardClass = 'wrong';
            badgeClass = 'wrong';
        }
        
        const timeStr = p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف';
        
        return `<div class="prediction-card ${cardClass}" onclick="openPlayerPredictions('${p.user_name || ''}')" style="cursor:pointer;">
                    <div class="user">
                        <div class="avatar-p">${p.user_name ? p.user_name.charAt(0).toUpperCase() : '👤'}</div>
                        <span class="name-p">${p.user_name || 'مجهول'}</span>
                    </div>
                    <div class="prediction-text">${getFlag(team1)} ${team1} 🆚 ${getFlag(team2)} ${team2}</div>
                    <div class="prediction-text" style="color:var(--gold-light);">🔮 ${predictionText}</div>
                    <span class="status-badge ${badgeClass}">${status.text}</span>
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-top:4px;">🕒 ${timeStr}</div>
                </div>`;
    }).join('');
}

// ============================================================
//  التهيئة الرئيسية
// ============================================================
async function init() {
    console.log("🚀 INIT START");

    // 1. تهيئة الوضع
    initTheme();

    // 2. تحميل البيانات
    await Promise.all([
        loadPreviousGamesFull(),
        fetchOpenfootballData(),
        getAllPredictions()
    ]);

    state.loaded = true;

    // 3. تحديث جميع المكونات
    await renderAllPredictions();
    updateScorers();
    renderLeaderboard('all');
    renderUpcoming();
    calculateStandings();
    renderTeamStats();
    renderScorers();
    renderBracket();
    initTabs();
    checkUrlForMatch();
    startAutoUpdate();
    updateNewsTicker();

    // 4. إضافة أحداث المستمعين
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

    // 5. زر الفوتر
    document.getElementById('footerTrigger').addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof isAuthorized !== 'undefined' && isAuthorized) {
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

    console.log("✅ INIT DONE");
}

// ============================================================
//  تصدير الدوال إلى النافذة العامة
// ============================================================
window.openViewPredictionsModal = openViewPredictionsModal;
window.openPlayerPredictions = openPlayerPredictions;
window.loadPreviousGames = loadPreviousGamesFull;
window.toggleTheme = toggleTheme;
window.shareResults = shareResults;
window.copyMatchLink = copyMatchLink;
window.shareAllTodayTomorrow = shareAllTodayTomorrow;
window.openMatchPredictions = openMatchPredictions;
window.openPreviousMatchPredictions = openPreviousMatchPredictions;
window.toggleCompactMode = toggleCompactMode;
window.resetCompactMode = resetCompactMode;
window.toggleModalCompact = toggleModalCompact;
window.openBracketMatchDetail = openBracketMatchDetail;
window.closeBracketModal = closeBracketModal;
window.showCopyToast = showCopyToast;
window.loadDuplicates = loadDuplicates;
window.openEditPredictionModal = openEditPredictionModal;
window.runTests = runTests;
window.openAnalytics = openAnalytics;
window.toggleArchive = toggleArchive;
window.openNameModal = openNameModal;
window.closeNameModal = closeNameModal;
window.setLeaderboardPeriod = setLeaderboardPeriod;
window.openCompareModal = openCompareModal;
window.closeCompareModal = closeCompareModal;
window.renderCompare = renderCompare;
window.updatePlayerAnalytics = updatePlayerAnalytics;
window.populatePlayerAnalyticsSelect = populatePlayerAnalyticsSelect;
window.renderMatchAnalytics = renderMatchAnalytics;
window.toggleBracketAdmin = toggleBracketAdmin;
window.openTeamStatsModal = openTeamStatsModal;

// ============================================================
//  تشغيل التطبيق
// ============================================================
document.addEventListener('DOMContentLoaded', init);