// ============================================================
//  التحكم في الوضع المظلم والفاتح
// ============================================================

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme === 'light' ? 'light' : '');
    localStorage.setItem('theme', newTheme);
    document.getElementById('themeToggleBtn').textContent = newTheme === 'light' ? '☀️ الوضع الفاتح' :
        '🌙 الوضع المظلم';
}

// ============================================================
//  تهيئة الوضع بناءً على التفضيلات المحفوظة
// ============================================================
function initTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeToggleBtn').textContent = '☀️ الوضع الفاتح';
    }
}