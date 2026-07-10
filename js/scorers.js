// ============================================================
//  الهدافين
// ============================================================

let scorersDict = {};
let playerTeamMap = {};

function updateScorers() {
    scorersDict = {};
    playerTeamMap = {};
    for (let match of state.openfootballMatches) {
        const homeTeam = translateToArabic(match.team1 || '');
        const awayTeam = translateToArabic(match.team2 || '');
        const goals = [...(match.goals1 || []), ...(match.goals2 || [])];
        for (let g of goals) {
            if (!g.name) continue;
            let normalizedName = normalizeName(g.name);
            if (!scorersDict[normalizedName]) scorersDict[normalizedName] = 0;
            scorersDict[normalizedName]++;
            let team = '';
            if (match.goals1 && match.goals1.some(gg => gg.name === g.name)) team = homeTeam;
            else if (match.goals2 && match.goals2.some(gg => gg.name === g.name)) team = awayTeam;
            if (team && !playerTeamMap[normalizedName]) playerTeamMap[normalizedName] = team;
        }
    }
    for (let game of state.allGames) {
        if (game.finished === "TRUE" && game.scorers) {
            try {
                const scorersData = game.scorers;
                const homeTeam = translateToArabic(game.home_team_name_fa || game.home_team_name_en || '');
                const awayTeam = translateToArabic(game.away_team_name_fa || game.away_team_name_en || '');
                const scorerMatches = scorersData.match(/([^\d,]+?)\s*(\d+['’]?)/g);
                if (scorerMatches) {
                    for (let sm of scorerMatches) {
                        const parts = sm.match(/^(.+?)\s*(\d+['’]?)$/);
                        if (parts) {
                            let name = parts[1].trim();
                            let normalizedName = normalizeName(name);
                            if (!scorersDict[normalizedName]) scorersDict[normalizedName] = 0;
                            scorersDict[normalizedName]++;
                            if (!playerTeamMap[normalizedName]) {
                                if (game.home_team_name_en && name.includes(game.home_team_name_en))
                                    playerTeamMap[normalizedName] = homeTeam;
                                else if (game.away_team_name_en && name.includes(game.away_team_name_en))
                                    playerTeamMap[normalizedName] = awayTeam;
                                else if (game.home_team_name_fa && name.includes(game.home_team_name_fa))
                                    playerTeamMap[normalizedName] = homeTeam;
                                else if (game.away_team_name_fa && name.includes(game.away_team_name_fa))
                                    playerTeamMap[normalizedName] = awayTeam;
                            }
                        }
                    }
                }
            } catch (e) { /* تجاهل */ }
        }
    }
    renderScorers();
}

function renderScorers() {
    const container = document.getElementById('scorersContainer');
    const countSpan = document.getElementById('scorersCount');
    const scorersArray = Object.entries(scorersDict).map(([name, goals]) => ({ name, goals }));
    scorersArray.sort((a, b) => b.goals - a.goals);
    countSpan.textContent = scorersArray.length;
    if (!scorersArray.length) { container.innerHTML =
            `<div class="empty-state"><span class="icon">📭</span> لا توجد أهداف مسجلة بعد</div>`; return; }
    let html =
        `<table class="scorers-table"><thead><tr><th>#</th><th>اللاعب</th><th>الفريق</th><th>الأهداف</th></tr></thead><tbody>`;
    scorersArray.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
        const team = playerTeamMap[s.name] || '';
        const flag = getFlag(team);
        html += `<tr><td class="medal">${medal}</td><td class="player-name">${s.name}</td><td>${flag} ${team}</td><td class="goals">${s.goals}</td></tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}