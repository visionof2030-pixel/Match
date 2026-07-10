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
        showCopyToast('📐 تم تكبير