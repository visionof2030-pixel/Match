// ============================================================
//  الاتصال بقاعدة البيانات (Supabase)
// ============================================================

const SUPABASE_URL = "https://szjxwhsmefqpfcebtvei.supabase.co";
const SUPABASE_KEY = "sb_publishable_0um28lgPMHcjDOThT0UgDA_K-Y7Wmx3";

let supabaseClient = null;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Supabase init error", e);
}

// ============================================================
//  جلب التوقعات من Supabase
// ============================================================
async function getAllPredictions() {
    const cached = getCache("predictions");
    if (cached) {
        state.predictions = cached;
        return;
    }
    if (!supabaseClient) { state.predictions = []; return; }
    try {
        const { data } = await supabaseClient
            .from("predictions")
            .select("*")
            .limit(500);
        state.predictions = data || [];
        setCache("predictions", state.predictions);
    } catch (e) {
        console.warn("⚠️ فشل تحميل التوقعات:", e);
        state.predictions = [];
    }
}

// ============================================================
//  جلب توقع المستخدم لمباراة معينة
// ============================================================
async function getUserPrediction(userName, matchId) {
    if (!supabaseClient || !userName || !matchId) return null;
    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("*")
            .eq("user_name", userName)
            .eq("match_id", matchId)
            .order("created_at", { ascending: false })
            .limit(1);
        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    } catch (e) {
        console.error("❌ جلب توقع المستخدم:", e);
        return null;
    }
}

// ============================================================
//  جلب جميع توقعات المستخدم
// ============================================================
async function getPredictionsForUserFull(userName) {
    if (!supabaseClient || !userName) return [];
    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("*")
            .eq("user_name", userName)
            .order("created_at", { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("❌ جلب توقعات اللاعب (جميعها):", e);
        return [];
    }
}

// ============================================================
//  جلب جميع توقعات مباراة معينة
// ============================================================
async function getPredictionsForMatchFull(matchId) {
    if (!supabaseClient || !matchId) return [];
    try {
        const { data, error } = await supabaseClient
            .from("predictions")
            .select("*")
            .eq("match_id", matchId)
            .order("created_at", { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("❌ جلب توقعات المباراة (جميعها):", e);
        return [];
    }
}

// ============================================================
//  حفظ التوقع في Supabase
// ============================================================
async function savePrediction(userName, matchId, prediction) {
    if (!supabaseClient) return { success: false, message: "Supabase غير متصل" };
    const match = matchesData.find(m => `${m.timeISO}_${m.team1}_${m.team2}` === matchId);
    if (match) {
        if (!canPredict(match.timeISO)) {
            return { success: false,
                message: "⛔ لا يمكن التوقع الآن، المباراة على وشك البدء أو بدأت بالفعل (يُسمح حتى 5 دقائق قبل البداية)." };
        }
    } else {
        return { success: false, message: "⛔ مباراة غير معروفة" };
    }

    async function isUserNameExists(userName) {
        if (!supabaseClient || !userName) return false;
        try {
            const { data, error } = await supabaseClient.from("predictions").select("user_name").eq("user_name",
                userName).limit(1);
            if (error) throw error;
            return data && data.length > 0;
        } catch (e) { console.error("❌ التحقق من الاسم:", e); return false; }
    }

    const existing = await getUserPrediction(userName, matchId);

    if (existing) {
        try {
            const { error } = await supabaseClient
                .from("predictions")
                .update({ prediction: prediction, updated_at: new Date().toISOString() })
                .eq("id", existing.id);
            if (error) throw error;
            saveLocalPrediction(userName, matchId, prediction);
            addSubmittedMatch(matchId);
            localStorage.removeItem("predictions");
            await getAllPredictions();
            return { success: true, updated: true };
        } catch (e) { return { success: false, message: e.message }; }
    } else {
        if (isMatchSubmitted(matchId)) {
            return { success: false, message: `⚠️ توقعت مسبقاً هذه المباراة`, duplicate: true };
        }

        const exists = await isUserNameExists(userName);
        if (exists) {
            const storedUserName = localStorage.getItem('lastUserName') || '';
            if (storedUserName !== userName) {
                return { success: false,
                    message: `⚠️ هذا الاسم "${userName}" مسجل لمستخدم آخر. الرجاء استخدام اسم مختلف أو تأكيد أنك أنت صاحب الاسم.` };
            }
        }

        try {
            const { error } = await supabaseClient.from("predictions").insert([{ user_name: userName,
                match_id: matchId, prediction }]);
            if (error) throw error;
            saveLocalPrediction(userName, matchId, prediction);
            addSubmittedMatch(matchId);
            localStorage.removeItem("predictions");
            await getAllPredictions();
            return { success: true, updated: false };
        } catch (e) { return { success: false, message: e.message }; }
    }
}