// ============================================================
//  النوافذ المنبثقة - إدارة الأحداث
// ============================================================

// ============================================================
//  إغلاق النوافذ بالأزرار
// ============================================================
document.getElementById('modalCloseBtn').addEventListener('click', closePredictionModal);
document.getElementById('viewModalCloseBtn').addEventListener('click', closeViewPredictionsModal);
document.getElementById('playerModalCloseBtn').addEventListener('click', closePlayerPredictionsModal);
document.getElementById('matchPredictionsCloseBtn').addEventListener('click', closeMatchPredictionsModal);
document.getElementById('bracketModalCloseBtn').addEventListener('click', closeBracketModal);
document.getElementById('testResultsCloseBtn').addEventListener('click', function() {
    document.getElementById('testResultsModal').classList.remove('active');
    document.body.style.overflow = '';
});
document.getElementById('analyticsCloseBtn').addEventListener('click', function() {
    document.getElementById('analyticsModal').classList.remove('active');
    document.body.style.overflow = '';
});
document.getElementById('compareModalCloseBtn').addEventListener('click', closeCompareModal);
document.getElementById('teamStatsCloseBtn').addEventListener('click', function() {
    document.getElementById('teamStatsModal').classList.remove('active');
    document.body.style.overflow = '';
});
document.getElementById('nameCloseBtn').addEventListener('click', closeNameModal);
document.getElementById('passwordCloseBtn').addEventListener('click', hidePasswordOverlay);

// ============================================================
//  إغلاق النوافذ بالنقر خارج المحتوى
// ============================================================
document.getElementById('predictionModal').addEventListener('click', function(e) {
    if (e.target === this) closePredictionModal();
});
document.getElementById('viewPredictionsModal').addEventListener('click', function(e) {
    if (e.target === this) closeViewPredictionsModal();
});
document.getElementById('playerPredictionsModal').addEventListener('click', function(e) {
    if (e.target === this) closePlayerPredictionsModal();
});
document.getElementById('matchPredictionsModal').addEventListener('click', function(e) {
    if (e.target === this) closeMatchPredictionsModal();
});
document.getElementById('bracketMatchModal').addEventListener('click', function(e) {
    if (e.target === this) closeBracketModal();
});
document.getElementById('analyticsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        document.getElementById('analyticsModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});
document.getElementById('compareModal').addEventListener('click', function(e) {
    if (e.target === this) closeCompareModal();
});
document.getElementById('teamStatsModal').addEventListener('click', function(e) {
    if (e.target === this) {
        document.getElementById('teamStatsModal').classList.remove('active');
        document.body.style.overflow = '';
    }
});
document.getElementById('nameModal').addEventListener('click', function(e) {
    if (e.target === this) closeNameModal();
});
document.getElementById('passwordOverlay').addEventListener('click', function(e) {
    if (e.target === this) hidePasswordOverlay();
});

// ============================================================
//  إغلاق النوافذ بمفتاح Escape
// ============================================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePredictionModal();
        closeViewPredictionsModal();
        closePlayerPredictionsModal();
        closeMatchPredictionsModal();
        closeBracketModal();
        closeNameModal();
        hidePasswordOverlay();
        if (document.getElementById('analyticsModal').classList.contains('active')) {
            document.getElementById('analyticsModal').classList.remove('active');
            document.body.style.overflow = '';
        }
        if (document.getElementById('compareModal').classList.contains('active')) {
            closeCompareModal();
        }
        if (document.getElementById('teamStatsModal').classList.contains('active')) {
            document.getElementById('teamStatsModal').classList.remove('active');
            document.body.style.overflow = '';
        }
        if (document.getElementById('testResultsModal').classList.contains('active')) {
            document.getElementById('testResultsModal').classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ============================================================
//  أحداث نموذج اسم المستخدم
// ============================================================
document.getElementById('nameSubmitBtn').addEventListener('click', async function() {
    const name = document.getElementById('nameInput').value.trim();
    const errorEl = document.getElementById('nameError');
    const statusEl = document.getElementById('nameStatus');

    if (!name) { errorEl.textContent = '⚠️ الرجاء إدخال اسمك';
        return; }

    if (!supabaseClient) {
        errorEl.textContent = '❌ خطأ في الاتصال بقاعدة البيانات';
        return;
    }

    this.disabled = true;
    this.textContent = '⏳ جاري التحقق...';
    errorEl.textContent = '';
    statusEl.style.display = 'block';

    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("user_name")
            .eq("user_name", name)
            .limit(1);

        if (error) throw error;

        const isExisting = data && data.length > 0;

        if (isExisting) {
            statusEl.className = 'user-status existing';
            statusEl.textContent = `👤 مرحباً بعودتك "${name}"! سيتم إضافة التوقع إلى حسابك.`;
            localStorage.setItem('lastUserName', name);
            currentUserName = name;
            isNameVerified = true;

            await loadUserPredictions(name);

            const existingPred = await getUserPrediction(name, nameModalMatchId);
            if (existingPred) {
                errorEl.textContent = `⚠️ لقد توقعت هذه المباراة مسبقاً: ${existingPred.prediction === 'DRAW' ? 'تعادل' : existingPred.prediction}`;
                this.disabled = false;
                this.textContent = 'متابعة →';
                renderUpcoming();
                return;
            }

            this.textContent = '✅ متابعة للتوقع';
            setTimeout(() => {
                closeNameModal();
                openPredictionModal(nameModalMatchId, nameModalTeam1, nameModalTeam2, nameModalTimeISO,
                    name);
            }, 600);
        } else {
            statusEl.className = 'user-status new';
            statusEl.textContent = `👤 مرحباً "${name}"! أنت لاعب جديد. سيتم تسجيل توقعاتك.`;
            localStorage.setItem('lastUserName', name);
            currentUserName = name;
            isNameVerified = true;
            userPredictionsMap = {};

            this.textContent = '✅ متابعة للتوقع';
            setTimeout(() => {
                closeNameModal();
                openPredictionModal(nameModalMatchId, nameModalTeam1, nameModalTeam2, nameModalTimeISO,
                    name);
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

// ============================================================
//  أحداث نموذج كلمة السر
// ============================================================
document.getElementById('passwordSubmitBtn').addEventListener('click', checkPassword);
document.getElementById('passwordInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') checkPassword();
    if (e.key === 'Escape') hidePasswordOverlay();
});

// ============================================================
//  أحداث نموذج التوقع
// ============================================================
document.getElementById('modalSubmitBtn').addEventListener('click', async function() {
    const userName = currentUserName || localStorage.getItem('lastUserName') || '';
    const selected = document.querySelector('input[name="prediction"]:checked');
    const msgEl = document.getElementById('modalMessage');

    if (!userName) { msgEl.textContent = '⚠️ الرجاء إدخال اسمك';
        msgEl.className = 'modal-message warning'; return; }

    if (!selected) { msgEl.textContent = '⚠️ الرجاء اختيار توقع';
        msgEl.className = 'modal-message warning'; return; }

    let prediction = selected.value;

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
        msgEl.textContent = result.updated ? '✅ تم تحديث التوقع بنجاح! 🎉' : '✅ تم حفظ التوقع بنجاح! 🎉';
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