// ============================================================
//  كشف التوقعات المكررة
// ============================================================

async function loadDuplicates() {
    const section = document.getElementById('duplicatesSection');
    const container = document.getElementById('duplicatesContainer');
    const badge = document.getElementById('dupCountBadge');

    if (section.classList.contains('visible')) {
        section.classList.remove('visible');
        return;
    }

    section.classList.add('visible');
    container.innerHTML = `<div class="duplicates-empty">⏳ جاري البحث عن التكرارات...</div>`;

    if (!supabaseClient) {
        container.innerHTML = `<div class="duplicates-empty">❌ Supabase غير متصل</div>`;
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("user_name, match_id, prediction, created_at")
            .order("created_at", { ascending: false })
            .limit(500);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="duplicates-empty">📭 لا توجد توقعات مسجلة</div>`;
            badge.textContent = '0';
            return;
        }

        const groups = {};
        for (let p of data) {
            const key = `${p.user_name}|${p.match_id}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(p);
        }

        const duplicates = {};
        for (let [key, items] of Object.entries(groups)) {
            if (items.length > 1) {
                const [userName, matchId] = key.split('|');
                duplicates[key] = {
                    user_name: userName,
                    match_id: matchId,
                    count: items.length,
                    predictions: items.map(p => p.prediction),
                    created_at: items[0].created_at
                };
            }
        }

        const dupKeys = Object.keys(duplicates);
        badge.textContent = dupKeys.length;

        if (dupKeys.length === 0) {
            container.innerHTML = `<div class="duplicates-empty">✅ لا توجد توقعات مكررة</div>`;
            return;
        }

        let html =
            `<table class="duplicates-table"><thead><tr><th>المستخدم</th><th>المباراة</th><th>التكرار</th><th>التوقعات</th></tr></thead><tbody>`;
        for (let key of dupKeys) {
            const d = duplicates[key];
            const parts = d.match_id ? d.match_id.split('_') : [];
            const team1 = parts.length > 1 ? parts[1] : '?';
            const team2 = parts.length > 2 ? parts[2] : '?';
            const preds = d.predictions.map(p => p === 'DRAW' ? 'تعادل' : p).join(' / ');
            html += `<tr>
                <td class="dup-user">${d.user_name}</td>
                <td class="dup-match">${getFlag(team1)} ${team1} 🆚 ${getFlag(team2)} ${team2}</td>
                <td class="dup-count">${d.count}</td>
                <td class="dup-preds">${preds}</td>
            </tr>`;
        }
        html += `</tbody></table>`;
        container.innerHTML = html;

    } catch (e) {
        console.error("❌ جلب التكرارات:", e);
        container.innerHTML = `<div class="duplicates-empty">❌ حدث خطأ: ${e.message}</div>`;
    }
}