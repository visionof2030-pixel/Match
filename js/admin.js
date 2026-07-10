// ============================================================
//  لوحة الإدارة
// ============================================================

let isAuthorized = false;
let isCompactMode = false;
let isModalCompact = false;
let isEditing = false;

const SECRET_CODE = "1406";

// ============================================================
//  نظام كلمة السر
// ============================================================
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
        if (document.getElementById('matchPredictionsModal').classList.contains('active')) { document
                .getElementById('modalCompactBtn').classList.add('visible'); }
        updateShareAllCount();
        document.querySelectorAll('.edit-btn').forEach(el => el.classList.add('visible'));
        showCopyToast('✅ تم تفعيل لوحة الإدارة');
    } else {
        errorEl.textContent = '❌ رمز غير صحيح';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
    }
}

// ============================================================
//  وضع التصغير للتصوير
// ============================================================
function toggleCompactMode() {
    const container = document.getElementById('leaderboardContainer');
    const playersList = container.querySelector('.players-list');
    const championCard = container.querySelector('.champion-card');
    if (playersList) {
        isCompactMode = !isCompactMode;
        playersList.classList.toggle('compact-mode');
        if (championCard) { championCard.style.transform = isCompactMode ? 'scale(0.85)' : 'scale(1)';
            championCard.style.transformOrigin = 'center center';
            championCard.style.margin = isCompactMode ? '-10px 0' : '0'; }
        const btn = document.getElementById('toggleCompactBtn');
        if (isCompactMode) { btn.innerHTML = '📐 وضع التصوير (مفعل)';
            btn.style.background = 'linear-gradient(135deg, var(--success), #27ae60)';
            showCopyToast('📐 تم تفعيل وضع التصغير للقطة الشاشة'); } else { btn.innerHTML = '📐 تصغير للتصوير';
            btn.style.background = 'var(--gold-gradient)';
            showCopyToast('📐 تم إلغاء وضع التصغير'); }
    } else { showCopyToast('⚠️ انتظر حتى تحميل البيانات'); }
}

function resetCompactMode() {
    const container = document.getElementById('leaderboardContainer');
    const playersList = container.querySelector('.players-list');
    const championCard = container.querySelector('.champion-card');
    if (playersList) {
        isCompactMode = false;
        playersList.classList.remove('compact-mode');
        if (championCard) { championCard.style.transform = 'scale(1)';
            championCard.style.margin = '0'; }
        const btn = document.getElementById('toggleCompactBtn');
        btn.innerHTML = '📐 تصغير للتصوير';
        btn.style.background = 'var(--gold-gradient)';
        showCopyToast('🔄 تم إعادة الحجم الطبيعي');
    }
}

function toggleModalCompact() {
    const modalContent = document.getElementById('matchPredictionsContent');
    const btn = document.getElementById('modalCompactBtn');
    isModalCompact = !isModalCompact;
    modalContent.classList.toggle('compact-mode');
    if (isModalCompact) { btn.textContent = '📐 تكبير';
        showCopyToast('📐 تم تصغير جدول التوقعات للتصوير'); } else { btn.textContent = '📐 تصغير';
        showCopyToast('📐 تم تكبير جدول التوقعات'); }
}

// ============================================================
//  إحصائيات الفريقين (نافذة منبثقة)
// ============================================================
function openTeamStatsModal(team1, team2) {
    const modal = document.getElementById('teamStatsModal');
    const content = document.getElementById('teamStatsContent');
    
    // جلب الإحصائيات الكاملة لكل فريق
    const stats1 = getTeamStatsFull(team1);
    const stats2 = getTeamStatsFull(team2);
    
    // تحديد الفائز في المباريات السابقة (للسلسلة)
    const getResultSymbol = (teamName, game) => {
        const result = findMatchResult(game.homeAr, game.awayAr);
        if (!result) return '⏳';
        const winner = determineWinner(result);
        if (winner === teamName) return '✅';
        else if (winner === null || winner === 'DRAW') return '➖';
        else return '❌';
    };
    
    // بناء سلسلة النتائج
    const getStreakHtml = (teamName, games) => {
        const teamGames = games.filter(g => g.homeAr === teamName || g.awayAr === teamName);
        const recentGames = teamGames.slice(-10);
        return recentGames.map(g => getResultSymbol(teamName, g)).join(' ');
    };
    
    // بناء قائمة الهدافين (مع تصفية الأهداف العكسية)
    const getScorersHtml = (teamName) => {
        const scorers = getTeamScorers(teamName);
        if (scorers.length === 0) return '<span style="color:var(--text-secondary);font-size:0.6rem;">لا توجد أهداف مسجلة</span>';
        return scorers.map(s => 
            `<span class="scorer" style="display:inline-block;background:var(--gold-glow);padding:1px 8px;border-radius:20px;border:1px solid var(--border-gold);margin:2px;font-size:0.6rem;">⚽ ${s.name} <span class="goals" style="color:var(--gold-light);font-weight:700;">${s.goals}</span></span>`
        ).join('');
    };
    
    // الحصول على جميع مباريات الفريقين
    const allGames = state.previousGamesData || [];
    
    // إحصائيات الفريق الأول
    const streak1 = getStreakHtml(team1, allGames);
    const goalsFor1 = stats1.goalsFor || 0;
    const goalsAgainst1 = stats1.goalsAgainst || 0;
    const wins1 = stats1.wins || 0;
    const losses1 = stats1.losses || 0;
    const draws1 = stats1.draws || 0;
    const total1 = stats1.total || 0;
    
    // إحصائيات الفريق الثاني
    const streak2 = getStreakHtml(team2, allGames);
    const goalsFor2 = stats2.goalsFor || 0;
    const goalsAgainst2 = stats2.goalsAgainst || 0;
    const wins2 = stats2.wins || 0;
    const losses2 = stats2.losses || 0;
    const draws2 = stats2.draws || 0;
    const total2 = stats2.total || 0;
    
    // الهدافين (مع تصفية الأهداف العكسية)
    const scorers1 = getScorersHtml(team1);
    const scorers2 = getScorersHtml(team2);
    
    // بناء HTML للنافذة (بدون نسبة الفوز)
    content.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px;">
            <!-- الفريق الأول -->
            <div style="background:rgba(255,255,255,0.02);border-radius:var(--radius-md);padding:16px;border:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;border-bottom:1px solid var(--border-gold);padding-bottom:8px;">
                    <span style="font-size:1.5rem;">${getFlag(team1)}</span>
                    <span style="font-weight:800;font-size:1rem;color:var(--gold-light);">${team1}</span>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.7rem;margin-bottom:8px;">
                    <div><span style="color:var(--text-secondary);">🏆 فوز:</span> <strong style="color:var(--success);">${wins1}</strong></div>
                    <div><span style="color:var(--text-secondary);">❌ خسارة:</span> <strong style="color:var(--danger);">${losses1}</strong></div>
                    <div><span style="color:var(--text-secondary);">➖ تعادل:</span> <strong style="color:var(--gold-light);">${draws1}</strong></div>
                    <div><span style="color:var(--text-secondary);">📊 مباريات:</span> <strong>${total1}</strong></div>
                    <div><span style="color:var(--text-secondary);">⚽ أهداف له:</span> <strong style="color:var(--gold-light);">${goalsFor1}</strong></div>
                    <div><span style="color:var(--text-secondary);">⚽ أهداف عليه:</span> <strong style="color:var(--danger);">${goalsAgainst1}</strong></div>
                </div>
                
                <div style="margin-top:8px;border-top:1px solid var(--border-subtle);padding-top:8px;">
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-bottom:4px;">📈 سلسلة النتائج (آخر 10 مباريات):</div>
                    <div style="font-size:1rem;letter-spacing:2px;word-break:break-all;">${streak1 || 'لا توجد مباريات سابقة'}</div>
                </div>
                
                <div style="margin-top:8px;border-top:1px solid var(--border-subtle);padding-top:8px;">
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-bottom:4px;">⚽ الهدافون:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">${scorers1}</div>
                </div>
            </div>
            
            <!-- الفريق الثاني -->
            <div style="background:rgba(255,255,255,0.02);border-radius:var(--radius-md);padding:16px;border:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;border-bottom:1px solid var(--border-gold);padding-bottom:8px;">
                    <span style="font-size:1.5rem;">${getFlag(team2)}</span>
                    <span style="font-weight:800;font-size:1rem;color:var(--gold-light);">${team2}</span>
                </div>
                
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.7rem;margin-bottom:8px;">
                    <div><span style="color:var(--text-secondary);">🏆 فوز:</span> <strong style="color:var(--success);">${wins2}</strong></div>
                    <div><span style="color:var(--text-secondary);">❌ خسارة:</span> <strong style="color:var(--danger);">${losses2}</strong></div>
                    <div><span style="color:var(--text-secondary);">➖ تعادل:</span> <strong style="color:var(--gold-light);">${draws2}</strong></div>
                    <div><span style="color:var(--text-secondary);">📊 مباريات:</span> <strong>${total2}</strong></div>
                    <div><span style="color:var(--text-secondary);">⚽ أهداف له:</span> <strong style="color:var(--gold-light);">${goalsFor2}</strong></div>
                    <div><span style="color:var(--text-secondary);">⚽ أهداف عليه:</span> <strong style="color:var(--danger);">${goalsAgainst2}</strong></div>
                </div>
                
                <div style="margin-top:8px;border-top:1px solid var(--border-subtle);padding-top:8px;">
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-bottom:4px;">📈 سلسلة النتائج (آخر 10 مباريات):</div>
                    <div style="font-size:1rem;letter-spacing:2px;word-break:break-all;">${streak2 || 'لا توجد مباريات سابقة'}</div>
                </div>
                
                <div style="margin-top:8px;border-top:1px solid var(--border-subtle);padding-top:8px;">
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-bottom:4px;">⚽ الهدافون:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">${scorers2}</div>
                </div>
            </div>
        </div>
        <div style="text-align:center;margin-top:16px;">
            <button class="tab-btn" onclick="document.getElementById('teamStatsModal').classList.remove('active');document.body.style.overflow='';" style="background:var(--gold-glow);border-color:var(--border-gold);color:var(--gold-light);">إغلاق</button>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================================
//  إحصائيات الفريق الكاملة (مع ركلات الترجيح)
// ============================================================
function getTeamStatsFull(teamName) {
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

    // أفضل الهدافين من openfootball
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
        .slice(0, 5)
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
        results,
        topScorers
    };
}

// ============================================================
//  الحصول على قائمة الهدافين لفريق معين (مع تصفية الأهداف العكسية)
// ============================================================
function getTeamScorers(teamName) {
    const scorers = {};
    
    // قائمة اللاعبين الذين سجلوا في مرمى فرقهم (أهداف عكسية)
    const ownGoalBlacklist = [
        'Damian Bobadilla', 'بوباديا', 'داميان بوباديا',
        'Cameron Burgess', 'كاميرون بورغيس',
        'Elvis Muheim', 'إلفيس موهيم',
        'Mohamed Hany', 'محمد هاني',
        'Ellyes Skhiri', 'إلياس السخيري',
        'Hassan Al-Tambakti', 'حسن التمبكتي',
        'Yazan Al-Arab', 'يزن العرب',
        'Aymen Hussein', 'أيمن حسين',
        'Mohamed Manai', 'محمد المناعي',
        'Abduvohid Nematov', 'عبد الواحد نيماتوف',
        'Yassine Bounou', 'ياسين بونو'
    ];
    
    // دالة للتحقق من أن اللاعب ليس في القائمة السوداء
    const isOwnGoalScorer = (playerName) => {
        if (!playerName) return false;
        const nameLower = playerName.toLowerCase();
        return ownGoalBlacklist.some(name => 
            nameLower.includes(name.toLowerCase()) ||
            name.toLowerCase().includes(nameLower)
        );
    };
    
    if (state.openfootballMatches) {
        for (let match of state.openfootballMatches) {
            const homeTeam = translateToArabic(match.team1 || '');
            const awayTeam = translateToArabic(match.team2 || '');
            if (homeTeam !== teamName && awayTeam !== teamName) continue;
            
            const goals = [...(match.goals1 || []), ...(match.goals2 || [])];
            for (let g of goals) {
                if (!g.name) continue;
                let playerName = g.name;
                // تخطي الأهداف العكسية
                if (isOwnGoalScorer(playerName)) continue;
                // التحقق من أن اللاعب ليس في الفريق الخصم (هدف عكسي)
                const isHomePlayer = match.goals1 && match.goals1.some(gg => gg.name === g.name);
                const isAwayPlayer = match.goals2 && match.goals2.some(gg => gg.name === g.name);
                if (isHomePlayer && homeTeam !== teamName) continue;
                if (isAwayPlayer && awayTeam !== teamName) continue;
                if (!scorers[playerName]) scorers[playerName] = 0;
                scorers[playerName]++;
            }
        }
    }
    return Object.entries(scorers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, goals]) => ({ name, goals }));
}