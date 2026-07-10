// ============================================================
//  المقارنة بين اللاعبين
// ============================================================

let comparePlayer1 = '';
let comparePlayer2 = '';

function openCompareModal(selectedPlayer) {
    const modal = document.getElementById('compareModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const players = Object.keys(getAllPlayersStats());
    const select1 = document.getElementById('compareSelect1');
    const select2 = document.getElementById('compareSelect2');

    select1.innerHTML = '<option value="">اختر لاعباً</option>';
    select2.innerHTML = '<option value="">اختر لاعباً</option>';
    players.forEach(p => {
        select1.innerHTML += `<option value="${p}">${p}</option>`;
        select2.innerHTML += `<option value="${p}">${p}</option>`;
    });

    if (selectedPlayer) {
        select1.value = selectedPlayer;
        const other = players.find(p => p !== selectedPlayer) || '';
        select2.value = other;
    }

    renderCompare();
}

function closeCompareModal() {
    document.getElementById('compareModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderCompare() {
    const p1 = document.getElementById('compareSelect1').value;
    const p2 = document.getElementById('compareSelect2').value;
    const stats = getAllPlayersStats();

    const div1 = document.getElementById('compareStats1');
    const name1 = document.getElementById('compareName1');
    if (p1 && stats[p1]) {
        const s = stats[p1];
        const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        name1.innerHTML = `👤 ${p1}`;
        div1.innerHTML = `
            <div class="stat-row"><span class="label">🏆 النقاط</span><span class="value gold">${s.points}</span></div>
            <div class="stat-row"><span class="label">✅ صحيحة</span><span class="value green">${s.correct}</span></div>
            <div class="stat-row"><span class="label">❌ خاطئة</span><span class="value red">${s.wrong}</span></div>
            <div class="stat-row"><span class="label">📊 عدد التوقعات الكلي</span><span class="value">${s.total}</span></div>
            <div class="stat-row"><span class="label">🎯 نسبة النجاح</span><span class="value gold">${acc}%</span></div>
        `;
    } else {
        name1.innerHTML = '👤 لاعب 1';
        div1.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> اختر لاعباً</div>`;
    }

    const div2 = document.getElementById('compareStats2');
    const name2 = document.getElementById('compareName2');
    if (p2 && stats[p2]) {
        const s = stats[p2];
        const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
        name2.innerHTML = `👤 ${p2}`;
        div2.innerHTML = `
            <div class="stat-row"><span class="label">🏆 النقاط</span><span class="value gold">${s.points}</span></div>
            <div class="stat-row"><span class="label">✅ صحيحة</span><span class="value green">${s.correct}</span></div>
            <div class="stat-row"><span class="label">❌ خاطئة</span><span class="value red">${s.wrong}</span></div>
            <div class="stat-row"><span class="label">📊 عدد التوقعات الكلي</span><span class="value">${s.total}</span></div>
            <div class="stat-row"><span class="label">🎯 نسبة النجاح</span><span class="value gold">${acc}%</span></div>
        `;
    } else {
        name2.innerHTML = '👤 لاعب 2';
        div2.innerHTML = `<div class="empty-state"><span class="icon">⏳</span> اختر لاعباً</div>`;
    }
}