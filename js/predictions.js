// ============================================================
//  التوقعات وحالة التوقعات
// ============================================================

let userPredictionsMap = {};
let currentMatchId = null,
    currentTeam1 = '',
    currentTeam2 = '',
    currentTimeISO = '';
let currentUserName = '';
let isEditing = false;

// ============================================================
//  دالة getPredictionStatus المحسنة - مع دعم التعادل
// ============================================================
function getPredictionStatus(prediction) {
    if (!prediction || !prediction.match_id) {
        return { status: 'pending', text: '⏳ مباراة غير معروفة', color: 'var(--gold-light)' };
    }
    
    const parts = prediction.match_id.split('_');
    if (parts.length < 3) {
        return { status: 'pending', text: '⏳ بيانات غير مكتملة', color: 'var(--gold-light)' };
    }
    
    const team1 = parts[1];
    const team2 = parts[2];
    
    // التحقق أولاً من وجود نتيجة للمباراة
    const result = findMatchResult(team1, team2);
    
    // إذا لم توجد نتيجة، تحقق مما إذا كانت المباراة قد انتهت
    if (!result) {
        // نبحث عن المباراة في البيانات
        const match = matchesData.find(m => 
            (m.team1 === team1 && m.team2 === team2) || 
            (m.team1 === team2 && m.team2 === team1)
        );
        
        if (match && isMatchFinished(match.timeISO)) {
            return { status: 'pending', text: '⏳ لم يتم تحديد النتيجة بعد', color: 'var(--gold-light)' };
        }
        return { status: 'pending', text: '⏳ المباراة لم تلعب بعد', color: 'var(--gold-light)' };
    }
    
    // تحديد الفائز
    const correctResult = determineWinner(result);
    
    // إذا لم يتم تحديد فائز (تعادل)
    if (!correctResult) {
        // التحقق مما إذا كان التوقع تعادلاً أم لا
        if (prediction.prediction === 'DRAW') {
            return { status: 'correct', text: '✅ توقع صحيح (تعادل)', color: 'var(--success)' };
        } else {
            return { status: 'wrong', text: `❌ خاطئ (النتيجة تعادل)`, color: 'var(--danger)' };
        }
    }
    
    // مقارنة توقع المستخدم مع النتيجة الصحيحة
    const isCorrect = prediction.prediction === correctResult;
    
    if (isCorrect) {
        return { status: 'correct', text: '✅ توقع صحيح', color: 'var(--success)' };
    } else {
        return { status: 'wrong', text: `❌ خاطئ (الفائز: ${correctResult})`, color: 'var(--danger)' };
    }
}

// ============================================================
//  تحميل توقعات المستخدم
// ============================================================
async function loadUserPredictions(userName) {
    if (!supabaseClient || !userName) return;
    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("match_id")
            .eq("user_name", userName);
        if (error) throw error;
        userPredictionsMap = {};
        if (data && data.length) {
            data.forEach(p => {
                userPredictionsMap[p.match_id] = true;
            });
        }
        renderUpcoming();
    } catch (e) {
        console.error("❌ جلب توقعات المستخدم:", e);
        userPredictionsMap = {};
    }
}

// ============================================================
//  نافذة إدخال الاسم (الخطوة الأولى)
// ============================================================
let nameModalMatchId = '',
    nameModalTeam1 = '',
    nameModalTeam2 = '',
    nameModalTimeISO = '';
let isNameVerified = false;

function openNameModal(matchId, team1, team2, timeISO) {
    if (isMatchFinished(timeISO)) { showCopyToast('⛔ هذه المباراة انتهت، لا يمكن التوقع.'); return; }
    if (!canPredict(timeISO)) { showCopyToast(
            '⛔ لا يمكن التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).'); return; }

    nameModalMatchId = matchId;
    nameModalTeam1 = team1;
    nameModalTeam2 = team2;
    nameModalTimeISO = timeISO;
    isNameVerified = false;

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
    isNameVerified = false;
}

// ============================================================
//  نافذة التوقع (الخطوة الثانية)
// ============================================================
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

    // تحديد نوع المباراة
    const match = getMatchById(matchId);
    const isKnockout = isKnockoutMatch(match);

    document.getElementById('modalTitle').textContent = '📝 توقع نتيجة المباراة';
    document.getElementById('greetingName').textContent = currentUserName;
    document.getElementById('modalUserGreeting').style.display = 'block';
    document.getElementById('modalTeam1').textContent = team1;
    document.getElementById('modalTeam2').textContent = team2;
    document.getElementById('optTeam1').textContent = team1;
    document.getElementById('optTeam2').textContent = team2;
    document.getElementById('modalFlag1').textContent = getFlag(team1);
    document.getElementById('modalFlag2').textContent = getFlag(team2);
    document.getElementById('modalDateTime').textContent = `📅 ${getDateTimeDisplay(timeISO)} (بتوقيت السعودية)`;

    // إظهار/إخفاء خيار التعادل
    const drawOption = document.getElementById('drawOption');
    if (isKnockout) {
        drawOption.style.display = 'none';
        // إلغاء تحديد التعادل إذا كان محدداً
        const drawRadio = document.querySelector('input[name="prediction"][value="DRAW"]');
        if (drawRadio) drawRadio.checked = false;
    } else {
        drawOption.style.display = 'block';
    }

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

function closePredictionModal() {
    document.getElementById('predictionModal').classList.remove('active');
    document.body.style.overflow = '';
    isEditing = false;
}

// ============================================================
//  نافذة تعديل التوقع
// ============================================================
async function openEditPredictionModal(matchId, team1, team2, timeISO) {
    if (isMatchFinished(timeISO)) { showCopyToast('⛔ هذه المباراة انتهت، لا يمكن تعديل التوقع.'); return; }
    if (!canPredict(timeISO)) { showCopyToast(
            '⛔ لا يمكن تعديل التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية).'
            ); return; }

    const savedUserName = localStorage.getItem('lastUserName') || '';
    if (!savedUserName) {
        showCopyToast('⚠️ الرجاء تسجيل اسمك أولاً');
        return;
    }

    const existing = await getUserPrediction(savedUserName, matchId);
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

    // تحديد نوع المباراة
    const match = getMatchById(matchId);
    const isKnockout = isKnockoutMatch(match);

    document.getElementById('modalTitle').textContent = '✏️ تعديل توقع المباراة';
    document.getElementById('greetingName').textContent = savedUserName;
    document.getElementById('modalUserGreeting').style.display = 'block';
    document.getElementById('modalTeam1').textContent = team1;
    document.getElementById('modalTeam2').textContent = team2;
    document.getElementById('optTeam1').textContent = team1;
    document.getElementById('optTeam2').textContent = team2;
    document.getElementById('modalFlag1').textContent = getFlag(team1);
    document.getElementById('modalFlag2').textContent = getFlag(team2);
    document.getElementById('modalDateTime').textContent = `📅 ${getDateTimeDisplay(timeISO)} (بتوقيت السعودية)`;

    // إظهار/إخفاء خيار التعادل
    const drawOption = document.getElementById('drawOption');
    if (isKnockout) {
        drawOption.style.display = 'none';
        const drawRadio = document.querySelector('input[name="prediction"][value="DRAW"]');
        if (drawRadio) drawRadio.checked = false;
    } else {
        drawOption.style.display = 'block';
    }

    const currentPrediction = existing.prediction;
    document.querySelectorAll('input[name="prediction"]').forEach(el => {
        const val = el.value;
        if (val === 'HOME' && currentPrediction === team1) el.checked = true;
        else if (val === 'AWAY' && currentPrediction === team2) el.checked = true;
        else if (val === 'DRAW' && currentPrediction === 'DRAW') el.checked = true;
    });

    const msgEl = document.getElementById('modalMessage');
    let predDisplay = currentPrediction === 'DRAW' ? 'تعادل' : currentPrediction;
    msgEl.textContent = `✏️ تعديل توقعك الحالي: ${predDisplay}`;
    msgEl.className = 'modal-message info';

    document.getElementById('modalSubmitBtn').disabled = false;
    document.getElementById('modalSubmitBtn').textContent = '💾 تحديث التوقع';

    document.getElementById('predictionModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================================
//  نافذة استعراض التوقعات (مع نسبة الفوز)
// ============================================================
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

    document.getElementById('probHomePercent').textContent = homePercent.toFixed(1) + '%';
    document.getElementById('probAwayPercent').textContent = awayPercent.toFixed(1) + '%';

    document.querySelector('#probBar .segment.home').style.width = homePercent + '%';
    document.querySelector('#probBar .segment.home').textContent = homePercent.toFixed(0) + '%';
    document.querySelector('#probBar .segment.away').style.width = awayPercent + '%';
    document.querySelector('#probBar .segment.away').textContent = awayPercent.toFixed(0) + '%';

    const drawSegment = document.querySelector('#probBar .segment.draw');
    if (drawSegment) drawSegment.style.display = 'none';

    if (totalPreds === 0) {
        document.querySelector('#probBar .segment.home').style.width = '50%';
        document.querySelector('#probBar .segment.home').textContent = '0%';
        document.querySelector('#probBar .segment.away').style.width = '50%';
        document.querySelector('#probBar .segment.away').textContent = '0%';
    }

    if (!predictions || predictions.length === 0) {
        listContainer.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد توقعات لهذه المباراة</div>`;
    } else {
        let html = '';
        predictions.forEach((p, idx) => {
            let text = '';
            if (p.prediction === 'DRAW') {
                text = '🤝 تعادل الفريقين';
            } else {
                text = `🏆 فوز ${getFlag(p.prediction)} ${p.prediction}`;
            }
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
                    <div style="font-size:0.6rem;color:var(--text-secondary);margin-top:4px;">🕒 ${p.created_at ? formatDate(p.created_at) : 'تاريخ غير معروف'}</div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    }
    document.getElementById('viewPredictionsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeViewPredictionsModal() {
    document.getElementById('viewPredictionsModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================================
//  نافذة توقعات المباراة (مع التفاصيل)
// ============================================================
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
    let penaltyText = '';
    if (result) {
        homeScore = result.homeScore;
        awayScore = result.awayScore;
        let displayScore = `${homeScore} - ${awayScore}`;
        if (result.hadPenalties && result.homePenalty !== null && result.awayPenalty !== null) {
            penaltyText = ` ⚽ ركلات ترجيح: ${result.homePenalty} — ${result.awayPenalty}`;
        }
        document.getElementById('mpResult').textContent = `النتيجة: ${displayScore}${penaltyText}`;
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
    let result2 = findMatchResult(team1, team2);
    let correctResult = null;
    if (result2) {
        correctResult = determineWinner(result2);
        if (!correctResult) correctResult = "DRAW";
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