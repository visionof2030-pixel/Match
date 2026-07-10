// ============================================================
//  المشاركة والروابط
// ============================================================

// ============================================================
//  مشاركة جميع روابط اليوم والغد
// ============================================================
function shareAllTodayTomorrow() {
    if (!isAuthorized) { showPasswordOverlay(); return; }
    const today = getSaudiNow();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activeMatches = matchesData.filter(m => (matchTime(m.timeISO) + MATCH_DURATION) > now());
    const todayTomorrowMatches = activeMatches.filter(m => {
        const d = toSaudiTime(m.timeISO);
        return (d.getDate() === today.getDate() && d.getMonth() === today.getMonth()) ||
            (d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth());
    });
    if (!todayTomorrowMatches.length) { showCopyToast('⚠️ لا توجد مباريات اليوم أو غداً'); return; }
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
    } else { fallbackCopy(shareText); }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy');
        showCopyToast('✅ تم نسخ جميع الروابط!'); } catch (e) { prompt('انسخ النص التالي للمشاركة:', text); }
    document.body.removeChild(textArea);
}

function updateShareAllCount() {
    if (!isAuthorized) { document.getElementById('shareAllCount').textContent = '🔒'; return; }
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

// ============================================================
//  نسخ رابط المباراة
// ============================================================
function copyMatchLink(matchId, team1, team2) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?m=${matchId}`;
    if (navigator.share) {
        navigator.share({ title: `🏆 توقع مباراة ${team1} 🆚 ${team2}`,
            text: `🔮 توقع نتيجة مباراة ${team1} 🆚 ${team2} في كأس العالم 2026\n\n🔗 ${shareUrl}`, url: shareUrl })
            .catch(() => {});
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

// ============================================================
//  مشاركة النتائج
// ============================================================
function shareResults() {
    const currentUser = localStorage.getItem('lastUserName') || 'لاعب';
    const userScore = document.querySelector('.champion-card .info .stats-row .item:first-child strong')
        ?.textContent || '0';
    const userRank = document.querySelector('.champion-card .rank-badge')?.textContent || '🥇';
    const totalPlayers = document.getElementById('lbTotalPlayers')?.textContent || '0';
    const shareText =
        `🏆 كأس العالم 2026\n\n👤 ${currentUser}\n📊 النقاط: ${userScore}\n🏅 الترتيب: ${userRank}\n👥 عدد اللاعبين: ${totalPlayers}\n\n✨ توقع · تنافس · اربح ✨\n#كأس_العالم_2026 #توقعات`;
    if (navigator.share) { navigator.share({ title: 'نتائجي في كأس العالم 2026', text: shareText }).catch(
            () => {}); } else { navigator.clipboard.writeText(shareText).then(() => showCopyToast(
                '✅ تم نسخ النتائج!')).catch(() => prompt('انسخ النص التالي للمشاركة:', shareText)); }
}

// ============================================================
//  عرض رسالة منبثقة
// ============================================================
function showCopyToast(msg) {
    const t = document.getElementById('copyToast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}