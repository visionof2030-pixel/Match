// ============================================================
//  الدوال المساعدة العامة
// ============================================================

// ============================================================
//  دوال مساعدة للوقت
// ============================================================
function now() { return Date.now(); }

function matchTime(timeISO) { return new Date(timeISO).getTime(); }

const MATCH_DURATION = 105 * 60 * 1000;

function isMatchLive(timeISO) {
    const cur = now();
    const start = matchTime(timeISO);
    return cur >= start && cur <= start + MATCH_DURATION;
}

function isMatchFinished(timeISO) {
    return now() > matchTime(timeISO) + MATCH_DURATION;
}

function canPredict(timeISO) {
    const start = matchTime(timeISO);
    const nowTime = now();
    const fiveMinutes = 5 * 60 * 1000;
    return (start - nowTime) > fiveMinutes;
}

function getMatchStatus(m) {
    const start = matchTime(m.timeISO);
    const end = start + MATCH_DURATION;
    const cur = now();
    if (cur < start) {
        const diff = start - cur;
        const h = Math.floor(diff / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const fiveMin = 5 * 60 * 1000;
        const remainingText = diff < fiveMin ? '⏳ تنطلق خلال أقل من 5 دقائق' : `⏱️ ${h}h ${min}m ${s}s`;
        return { live: false, finished: false, text: remainingText };
    } else if (cur <= end) {
        return { live: true, finished: false, text: "🔴 تُلعب الآن" };
    }
    return { live: false, finished: true, text: "✅ انتهت" };
}

function upcomingMatches(arr) {
    return arr.filter(m => (matchTime(m.timeISO) + MATCH_DURATION) > now());
}

// ============================================================
//  دوال الوقت بتوقيت السعودية
// ============================================================
function toSaudiTime(isoString) {
    return new Date(isoString);
}

function getSaudiNow() {
    return new Date();
}

function formatSaudiDate(isoString) {
    const d = toSaudiTime(isoString);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatSaudiTime(isoString) {
    const d = toSaudiTime(isoString);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatSaudiDateTime(isoString) {
    return `${formatSaudiDate(isoString)} - ${formatSaudiTime(isoString)}`;
}

function isTodaySaudi(isoString) {
    const d = toSaudiTime(isoString);
    const now = getSaudiNow();
    return d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
}

function isTomorrowSaudi(isoString) {
    const d = toSaudiTime(isoString);
    const now = getSaudiNow();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getDate() === tomorrow.getDate();
}

function getSaudiDay(isoString) {
    const d = toSaudiTime(isoString);
    return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d.getDay()];
}

function formatDate(isoString) {
    if (!isoString) return 'تاريخ غير معروف';
    const d = toSaudiTime(isoString);
    return `${d.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()]} ${d.getFullYear()}، ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ============================================================
//  دالة استخراج بيانات ركلات الترجيح
// ============================================================
function extractPenaltyData(game) {
    let homePen = game.home_penalty_score;
    let awayPen = game.away_penalty_score;
    if (homePen !== undefined && homePen !== null && homePen !== 'null' && homePen !== '') {
        homePen = String(homePen);
    } else { homePen = null; }
    if (awayPen !== undefined && awayPen !== null && awayPen !== 'null' && awayPen !== '') {
        awayPen = String(awayPen);
    } else { awayPen = null; }
    if (homePen === null || awayPen === null) {
        if (game.penalties && typeof game.penalties === 'object') {
            homePen = game.penalties.home_score || game.penalties.home || null;
            awayPen = game.penalties.away_score || game.penalties.away || null;
            if (homePen) homePen = String(homePen);
            if (awayPen) awayPen = String(awayPen);
        }
    }
    if (homePen !== null && awayPen !== null) {
        return { home: homePen, away: awayPen };
    }
    return null;
}

// ============================================================
//  دالة تحديد الفائز (مع ركلات الترجيح)
// ============================================================
function determineWinner(matchResult) {
    if (!matchResult) return null;

    // إذا كانت هناك ركلات ترجيح وكانت النتيجة متعادلة
    if (matchResult.hadPenalties && matchResult.homePenalty !== null && matchResult.awayPenalty !== null) {
        if (parseInt(matchResult.homePenalty) > parseInt(matchResult.awayPenalty)) {
            return matchResult.homeAr;
        } else if (parseInt(matchResult.awayPenalty) > parseInt(matchResult.homePenalty)) {
            return matchResult.awayAr;
        }
        return null; // تعادل في ركلات الترجيح (نادر)
    }

    // إذا كانت النتيجة غير متعادلة
    if (matchResult.homeScore > matchResult.awayScore) {
        return matchResult.homeAr;
    } else if (matchResult.awayScore > matchResult.homeScore) {
        return matchResult.awayAr;
    }

    // نتيجة متعادلة (0-0، 1-1، إلخ)
    return null;
}

// ============================================================
//  دالة العثور على نتيجة المباراة (محسنة)
// ============================================================
function findMatchResult(team1, team2) {
    // البحث في البيانات المحملة
    let match = state.previousGamesData.find(m => (m.homeAr === team1 && m.awayAr === team2) || (m.homeAr === team2 &&
            m.awayAr === team1));
    if (match) {
        let result = {
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeAr: match.homeAr,
            awayAr: match.awayAr,
            homePenalty: match.homePenalty || null,
            awayPenalty: match.awayPenalty || null,
            hadPenalties: match.hadPenalties || false
        };
        result.winner = determineWinner(result);
        return result;
    }

    // البحث في allGames
    if (state.allGames && state.allGames.length) {
        let g = state.allGames.find(m => {
            const home = translateToArabic(m.home_team_name_fa || m.home_team_name_en || '');
            const away = translateToArabic(m.away_team_name_fa || m.away_team_name_en || '');
            return (home === team1 && away === team2) || (home === team2 && away === team1);
        });
        if (g && g.finished === "TRUE") {
            let homeScore = parseInt(g.home_score, 10);
            let awayScore = parseInt(g.away_score, 10);
            let homeAr = translateToArabic(g.home_team_name_fa || g.home_team_name_en || '');
            let awayAr = translateToArabic(g.away_team_name_fa || g.away_team_name_en || '');
            let penaltyData = extractPenaltyData(g);
            let result = { homeScore, awayScore, homeAr, awayAr, homePenalty: null, awayPenalty: null,
                hadPenalties: false };
            if (penaltyData) {
                result.homePenalty = parseInt(penaltyData.home);
                result.awayPenalty = parseInt(penaltyData.away);
                result.hadPenalties = true;
            }
            result.winner = determineWinner(result);
            return result;
        }
    }

    // البحث في openfootball
    if (state.openfootballMatches && state.openfootballMatches.length) {
        let m = state.openfootballMatches.find(m => {
            const h = translateToArabic(m.team1 || '');
            const a = translateToArabic(m.team2 || '');
            return (h === team1 && a === team2) || (h === team2 && a === team1);
        });
        if (m && (m.finished === true || m.finished === "TRUE" || m.status === 'finished')) {
            let homeScore = m.home_score || m.goals1?.length || 0;
            let awayScore = m.away_score || m.goals2?.length || 0;
            let homeAr = translateToArabic(m.team1 || '');
            let awayAr = translateToArabic(m.team2 || '');
            let result = { homeScore, awayScore, homeAr, awayAr, homePenalty: null, awayPenalty: null,
                hadPenalties: false };
            if (m.penalties && typeof m.penalties === 'object') {
                let hPen = m.penalties.home_score || m.penalties.home || null;
                let aPen = m.penalties.away_score || m.penalties.away || null;
                if (hPen !== null && aPen !== null) {
                    result.homePenalty = parseInt(hPen);
                    result.awayPenalty = parseInt(aPen);
                    result.hadPenalties = true;
                }
            }
            result.winner = determineWinner(result);
            return result;
        }
    }

    return null;
}

// ============================================================
//  دالة الحصول على المباراة بواسطة المعرف
// ============================================================
function getMatchById(matchId) {
    return matchesData.find(m => `${m.timeISO}_${m.team1}_${m.team2}` === matchId) || null;
}

// ============================================================
//  دالة تحديد نوع المباراة (دور مجموعات أم خروج مغلوب)
// ============================================================
function isKnockoutMatch(match) {
    if (!match) return false;
    const knockoutRounds = ['round32', 'round16', 'quarterfinal', 'semifinal', 'third', 'final'];
    return knockoutRounds.includes(match.round) || 
           match.roundLabel?.includes('دور') || 
           match.roundLabel?.includes('ربع') ||
           match.roundLabel?.includes('نصف') ||
           match.roundLabel?.includes('المركز') ||
           match.roundLabel?.includes('النهائي');
}

// ============================================================
//  دالة تحليل الأهداف مع الدقائق
// ============================================================
function parseScorersWithMinutes(scorerString) {
    if (!scorerString || scorerString === "null") return [];
    let cleaned = scorerString.trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) cleaned = cleaned.slice(1, -1);
    let parts = cleaned.split(',').map(s => s.trim());
    let result = [];
    for (let part of parts) {
        part = part.replace(/^["“”]|["“”]$/g, '').trim();
        let minuteMatch = part.match(/^(.+?)\s+(\d+['’]?)(?:\s*\(([^)]+)\))?$/);
        if (minuteMatch) {
            let name = minuteMatch[1].trim();
            let minute = minuteMatch[2].trim();
            let type = minuteMatch[3] ? minuteMatch[3].trim() : '';
            result.push({ name, minute, type });
        } else {
            result.push({ name: part, minute: '', type: '' });
        }
    }
    return result;
}