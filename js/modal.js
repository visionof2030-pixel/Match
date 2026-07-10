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
            status