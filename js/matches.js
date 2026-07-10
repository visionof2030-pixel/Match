// ============================================================
//  عرض المباريات
// ============================================================

// ============================================================
//  الحصول على الملعب
// ============================================================
function getGroundForMatch(team1, team2, timeISO) {
    const directMatch = matchesData.find(m => (m.team1 === team1 && m.team2 === team2) || (m.team1 === team2 && m
        .team2 === team1));
    if (directMatch && directMatch.stadium) return directMatch.stadium;

    if (!state.openfootballMatches || !state.openfootballMatches.length) return null;
    const t1 = translateToArabic(team1);
    const t2 = translateToArabic(team2);
    let match = state.openfootballMatches.find(m => {
        const h = translateToArabic(m.team1 || '');
        const a = translateToArabic(m.team2 || '');
        return (h === t1 && a === t2) || (h === t2 && a === t1);
    });
    if (match && match.ground) return match.ground;
    if (timeISO) {
        const dateStr = getDateFmt(timeISO);
        match = state.openfootballMatches.find(m => {
            if (!m.date) return false;
            return m.date.includes(dateStr) || dateStr.includes(m.date);
        });
        if (match && match.ground) return match.ground;
    }
    return null;
}

// ============================================================
//  عرض بطاقة المباراة
// ============================================================
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
    let penaltyHtml = '';

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
            if (result.hadPenalties && result.homePenalty !== null && result.awayPenalty !== null) {
                penaltyHtml = `<span class="score-penalty-badge">⚽ ركلات ترجيح: ${result.homePenalty} — ${result.awayPenalty}</span>`;
            }
        } else {
            scoreDisplay = '✅';
            scoreClass = 'finished';
            matchClass = 'finished-match';
        }
    }

    // جلب إحصائيات الفرق لحساب النسبة الذكية
    const team1Stats = getTeamStats(m.team1);
    const team2Stats = getTeamStats(m.team2);

    let smartWinRate1 = 50;
    let smartWinRate2 = 50;
    if (team1Stats.total > 0 && team2Stats.total > 0) {
        const totalGoals1 = team1Stats.goalsFor + team1Stats.goalsAgainst;
        const totalGoals2 = team2Stats.goalsFor + team2Stats.goalsAgainst;
        if (totalGoals1 > 0 && totalGoals2 > 0) {
            const attack1 = team1Stats.goalsFor / team1Stats.total;
            const defense1 = team1Stats.goalsAgainst / team1Stats.total;
            const attack2 = team2Stats.goalsFor / team2Stats.total;
            const defense2 = team2Stats.goalsAgainst / team2Stats.total;
            
            const strength1 = (attack1 * 1.5) + (1 / (defense1 + 0.5));
            const strength2 = (attack2 * 1.5) + (1 / (defense2 + 0.5));
            const total = strength1 + strength2;
            smartWinRate1 = total > 0 ? (strength1 / total) * 100 : 50;
            smartWinRate2 = 100 - smartWinRate1;
        }
    } else if (team1Stats.total > 0) {
        smartWinRate1 = Math.min(100, Math.max(0, team1Stats.winRate));
        smartWinRate2 = 100 - smartWinRate1;
    } else if (team2Stats.total > 0) {
        smartWinRate2 = Math.min(100, Math.max(0, team2Stats.winRate));
        smartWinRate1 = 100 - smartWinRate2;
    }

    let predictBtnHtml = 'توقع الآن';
    let predictDisabled = false;
    let predictBtnClass = 'predict-btn';
    let predictBtnExtra = '';

    let editBtnHtml = 'تعديل';
    let editDisabled = true;
    let editBtnExtra = '';
    let editBtnClass = 'edit-btn';

    if (userHasPrediction) {
        predictDisabled = true;
        predictBtnHtml = '✅ تم التوقع';
        predictBtnClass += ' submitted';
        predictBtnExtra = 'disabled';

        if (canPredictNow && isAuthorized) {
            editDisabled = false;
            editBtnExtra = `onclick="openEditPredictionModal('${matchId}','${m.team1}','${m.team2}','${m.timeISO}')"`;
            editBtnClass += ' visible';
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
            if (isAuthorized) editBtnClass += ' visible';
        }
    } else if (submitted) {
        predictDisabled = true;
        predictBtnHtml = 'تم التوقع ✅';
        predictBtnClass += ' submitted';
        predictBtnExtra = 'disabled';

        if (canPredictNow && isAuthorized) {
            editDisabled = false;
            editBtnExtra = `onclick="openEditPredictionModal('${matchId}','${m.team1}','${m.team2}','${m.timeISO}')"`;
            editBtnClass += ' visible';
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
            if (isAuthorized) editBtnClass += ' visible';
        }
    } else if (!canPredictNow) {
        predictDisabled = true;
        if (isFinished) {
            predictBtnHtml = '📋 عرض التوقعات';
            predictBtnClass += ' view-btn';
            predictBtnExtra = 'onclick="openMatchPredictions(\'' + matchId + '\', \'' + m.team1 + '\', \'' + m
                .team2 + '\', ' + homeScore + ', ' + awayScore + ')"';
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

    const showEdit = (userHasPrediction || submitted) && canPredictNow && isAuthorized;

    return `
        <div class="match-card ${matchClass}" ${onclickAttr}>
          <div class="match-teams">
            <div class="match-team"><span class="flag">${getFlag(m.team1)}</span> ${m.team1}</div>
            <div class="match-score ${scoreClass}">${scoreDisplay} ${penaltyHtml}</div>
            <div class="match-team"><span class="flag">${getFlag(m.team2)}</span> ${m.team2}</div>
          </div>
          
          <!-- بار نسبة الفوز -->
          <div class="win-probability" style="margin:8px 0 6px 0;padding:6px 12px;">
            <div class="prob-title" style="font-size:0.6rem;">📊 نسبة الفوز المتوقعة وفقاً لتحليل الذكاء الاصطناعي</div>
            <div class="prob-bar" style="height:18px;">
              <div class="segment home" style="width:${Math.round(smartWinRate1)}%;background:${smartWinRate1 >= 50 ? 'var(--success)' : 'var(--danger)'};">${Math.round(smartWinRate1)}%</div>
              <div class="segment away" style="width:${Math.round(smartWinRate2)}%;background:${smartWinRate2 >= 50 ? 'var(--success)' : 'var(--danger)'};">${Math.round(smartWinRate2)}%</div>
            </div>
            <div class="prob-labels" style="font-size:0.5rem;">
              <span class="label"><span class="dot home" style="background:${smartWinRate1 >= 50 ? 'var(--success)' : 'var(--danger)'};"></span> ${m.team1}</span>
              <span class="label"><span class="dot away" style="background:${smartWinRate2 >= 50 ? 'var(--success)' : 'var(--danger)'};"></span> ${m.team2}</span>
            </div>
          </div>
          
          <!-- زر عرض إحصائيات الفريقين -->
          <div style="display:flex;justify-content:center;margin:6px 0 8px 0;">
            <button class="admin-btn secondary" onclick="event.stopPropagation();openTeamStatsModal('${m.team1}','${m.team2}')" style="padding:4px 16px;font-size:0.6rem;background:var(--info-bg);border:1px solid rgba(74,158,255,0.15);color:var(--info);">
              📊 عرض إحصائيات الفريقين
            </button>
          </div>
          
          <div class="match-meta">
            <span class="tag">🏅 ${m.roundLabel}</span>
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
                ${showEdit ? `<button class="${editBtnClass}" ${editBtnExtra} data-matchid="${matchId}">✏️ ${editBtnHtml}</button>` : (isAuthorized ? `<button class="${editBtnClass}" ${editBtnExtra} data-matchid="${matchId}" style="display:none;">✏️ ${editBtnHtml}</button>` : '')}
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

// ============================================================
//  عرض المباريات القادمة
// ============================================================
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
        }
        
        // ترتيب المباريات حسب التاريخ (الأقرب أولاً)
        active.sort((a, b) => matchTime(a.timeISO) - matchTime(b.timeISO));
        
        // تطبيق فلاتر اليوم/غداً/الأسبوع
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
            container.innerHTML = `<div class="empty-state"><span class="icon">📭</span> لا توجد مباريات تطابق الفلاتر</div>`;
            return;
        }
        
        container.innerHTML = active.map(m => {
            const isUpcoming = (matchTime(m.timeISO) + MATCH_DURATION) > now();
            return renderMatchCard(m, isUpcoming);
        }).join('');
        
        updateShareAllCount();
    } catch (e) {
        console.error("renderUpcoming:", e);
        document.getElementById('matchesContainer').innerHTML = `<div class="empty-state"><span class="icon">⚠️</span> حدث خطأ</div>`;
    }
}