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
          <div class="win-probability" style="margin:8