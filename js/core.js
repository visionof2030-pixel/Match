// ============================================================
//  core.js - النواة والبيانات الثابتة والدوال المساعدة
// ============================================================

const SUPABASE_URL = "https://szjxwhsmefqpfcebtvei.supabase.co";
const SUPABASE_KEY = "sb_publishable_0um28lgPMHcjDOThT0UgDA_K-Y7Wmx3";
const SECRET_CODE = "1406";
const CACHE_KEY = "wc_cache_v2";
const CACHE_TIME = 5 * 60 * 1000;
const MATCH_DURATION = 105 * 60 * 1000;

let state = {
    previousGamesData: [],
    allGames: [],
    openfootballMatches: [],
    predictions: [],
    loaded: false
};

let userPredictionsMap = {};
let isAuthorized = false;
let isCompactMode = false;
let isModalCompact = false;
let currentDayFilter = 'all';
let currentLeaderboardPeriod = 'all';
let currentUserName = '';
let isEditing = false;
let chartInstancesLocal = {};
let supabaseClient = null;

try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Supabase init error", e);
}

// ------------------------------------------------------------
//  الترجمة والبيانات الثابتة
// ------------------------------------------------------------

const nameMapping = new Map([
    ["مکزیک", "المكسيك"],
    ["Mexico", "المكسيك"],
    ["مكسيك", "المكسيك"],
    ["آفریقای جنوبی", "جنوب أفريقيا"],
    ["South Africa", "جنوب أفريقيا"],
    ["افریقای جنوبی", "جنوب أفريقيا"],
    ["آرژانتین", "الأرجنتين"],
    ["Argentina", "الأرجنتين"],
    ["ارژانتین", "الأرجنتين"],
    ["الجزایر", "الجزائر"],
    ["Algeria", "الجزائر"],
    ["الجزائر", "الجزائر"],
    ["اتریش", "النمسا"],
    ["Austria", "النمسا"],
    ["اتریش", "النمسا"],
    ["اردن", "الأردن"],
    ["Jordan", "الأردن"],
    ["اردن", "الأردن"],
    ["پرتغال", "البرتغال"],
    ["پرتقال", "البرتغال"],
    ["Portugal", "البرتغال"],
    ["پرتغال", "البرتغال"],
    ["کنگو دمکراتیک", "الكونغو الديمقراطية"],
    ["جمهوری کنگو", "الكونغو الديمقراطية"],
    ["DR Congo", "الكونغو الديمقراطية"],
    ["کنگو", "الكونغو الديمقراطية"],
    ["کانگو", "الكونغو الديمقراطية"],
    ["دمکراتیک کنگو", "الكونغو الديمقراطية"],
    ["کره جنوبی", "كوريا الجنوبية"],
    ["South Korea", "كوريا الجنوبية"],
    ["کره جنوبي", "كوريا الجنوبية"],
    ["جمهوری چک", "التشيك"],
    ["Czech Republic", "التشيك"],
    ["چک", "التشيك"],
    ["کانادا", "كندا"],
    ["Canada", "كندا"],
    ["بوسنی و هرزگوین", "البوسنة والهرسك"],
    ["Bosnia and Herzegovina", "البوسنة والهرسك"],
    ["بوسنی", "البوسنة والهرسك"],
    ["آمریکا", "أمريكا"],
    ["United States", "أمريكا"],
    ["امریکا", "أمريكا"],
    ["US", "أمريكا"],
    ["عراق", "العراق"],
    ["Iraq", "العراق"],
    ["العراق", "العراق"],
    ["سوئیس", "سويسرا"],
    ["Switzerland", "سويسرا"],
    ["سویس", "سويسرا"],
    ["قطر", "قطر"],
    ["Qatar", "قطر"],
    ["برزیل", "البرازيل"],
    ["Brazil", "البرازيل"],
    ["برزیل", "البرازيل"],
    ["مراکش", "المغرب"],
    ["Morocco", "المغرب"],
    ["مراكش", "المغرب"],
    ["هائیتی", "هايتي"],
    ["Haiti", "هايتي"],
    ["هائیتی", "هايتي"],
    ["اسکاتلند", "إسكتلندا"],
    ["Scotland", "إسكتلندا"],
    ["اسكاتلند", "إسكتلندا"],
    ["استرالیا", "أستراليا"],
    ["Australia", "أستراليا"],
    ["استراليا", "أستراليا"],
    ["ترکیه", "تركيا"],
    ["Turkey", "تركيا"],
    ["ترکیه", "تركيا"],
    ["آلمان", "ألمانيا"],
    ["Germany", "ألمانيا"],
    ["المان", "ألمانيا"],
    ["کوراساو", "كوراساو"],
    ["Curaçao", "كوراساو"],
    ["کوراسائو", "كوراساو"],
    ["کوراساو", "كوراساو"],
    ["ژاپن", "اليابان"],
    ["Japan", "اليابان"],
    ["ژاپن", "اليابان"],
    ["هلند", "هولندا"],
    ["Netherlands", "هولندا"],
    ["هولندا", "هولندا"],
    ["اکوادور", "الإكوادور"],
    ["Ecuador", "الإكوادور"],
    ["اكوادور", "الإكوادور"],
    ["ساحل عاج", "ساحل العاج"],
    ["Ivory Coast", "ساحل العاج"],
    ["ساحل عاج", "ساحل العاج"],
    ["سوئد", "السويد"],
    ["Sweden", "السويد"],
    ["سويد", "السويد"],
    ["تونس", "تونس"],
    ["Tunisia", "تونس"],
    ["اسپانیا", "إسبانيا"],
    ["Spain", "إسبانيا"],
    ["اسبانيا", "إسبانيا"],
    ["کیپ ورد", "الرأس الأخضر"],
    ["Cape Verde", "الرأس الأخضر"],
    ["کیپ ورد", "الرأس الأخضر"],
    ["مصر", "مصر"],
    ["Egypt", "مصر"],
    ["بلژیک", "بلجيكا"],
    ["Belgium", "بلجيكا"],
    ["بلژیک", "بلجيكا"],
    ["عربستان سعودی", "السعودية"],
    ["سعودی", "السعودية"],
    ["Saudi Arabia", "السعودية"],
    ["السعودية", "السعودية"],
    ["اروگوئه", "أوروغواي"],
    ["اروگویه", "أوروغواي"],
    ["Uruguay", "أوروغواي"],
    ["اروگوئه", "أوروغواي"],
    ["ایران", "إيران"],
    ["Iran", "إيران"],
    ["نیوزیلند", "نيوزيلندا"],
    ["New Zealand", "نيوزيلندا"],
    ["نیوزیلند", "نيوزيلندا"],
    ["سنگال", "السنغال"],
    ["Senegal", "السنغال"],
    ["سنگال", "السنغال"],
    ["فرانسه", "فرنسا"],
    ["France", "فرنسا"],
    ["فرانسه", "فرنسا"],
    ["نروژ", "النرويج"],
    ["Norway", "النرويج"],
    ["نروژ", "النرويج"],
    ["انگلستان", "إنجلترا"],
    ["England", "إنجلترا"],
    ["انگلستان", "إنجلترا"],
    ["کرواسی", "كرواتيا"],
    ["Croatia", "كرواتيا"],
    ["کرواسی", "كرواتيا"],
    ["پاناما", "بنما"],
    ["Panama", "بنما"],
    ["پاناما", "بنما"],
    ["کلمبیا", "كولومبيا"],
    ["Colombia", "كولومبيا"],
    ["کلمبیا", "كولومبيا"],
    ["ازبکستان", "أوزبكستان"],
    ["Uzbekistan", "أوزبكستان"],
    ["ازبکستان", "أوزبكستان"],
    ["غنا", "غانا"],
    ["Ghana", "غانا"],
    ["پاراگوئه", "باراغواي"],
    ["Paraguay", "باراغواي"],
    ["پاراگوئه", "باراغواي"],
    ["کرواتیا", "كرواتيا"],
    ["کرواسی", "كرواتيا"],
    ["غانا", "غانا"],
    ["گینه", "غينيا"],
    ["بنما", "بنما"],
    ["پاناما", "بنما"],
    ["کلمبیا", "كولومبيا"],
    ["کلمبیا", "كولومبيا"],
    ["ازبکستان", "أوزبكستان"],
    ["ازبکستان", "أوزبكستان"],
    ["دموکراتیک کنگو", "الكونغو الديمقراطية"],
    ["جمهوری کنگو", "الكونغو الديمقراطية"],
    ["کنگو دمکراتیک", "الكونغو الديمقراطية"],
    ["کره جنوبی", "كوريا الجنوبية"],
    ["کره", "كوريا الجنوبية"],
    ["چک", "التشيك"],
    ["تشیک", "التشيك"],
    ["بوسنی", "البوسنة والهرسك"],
    ["بوسني", "البوسنة والهرسك"],
    ["هرزگوین", "البوسنة والهرسك"],
    ["آمریکا", "أمريكا"],
    ["امریکا", "أمريكا"],
    ["عراق", "العراق"],
    ["Iraq", "العراق"],
    ["سوئیس", "سويسرا"],
    ["سویس", "سويسرا"],
    ["برزیل", "البرازيل"],
    ["مراکش", "المغرب"],
    ["مغرب", "المغرب"],
    ["هایتی", "هايتي"],
    ["هائیتی", "هايتي"],
    ["اسکاتلند", "إسكتلندا"],
    ["اسكاتلند", "إسكتلندا"],
    ["استرالیا", "أستراليا"],
    ["استراليا", "أستراليا"],
    ["ترکیه", "تركيا"],
    ["ترکیه", "تركيا"],
    ["آلمان", "ألمانيا"],
    ["کوراساو", "كوراساو"],
    ["کوراسائو", "كوراساو"],
    ["ژاپن", "اليابان"],
    ["هلند", "هولندا"],
    ["اکوادور", "الإكوادور"],
    ["اكوادور", "الإكوادور"],
    ["ساحل عاج", "ساحل العاج"],
    ["سوئد", "السويد"],
    ["تونس", "تونس"],
    ["اسپانیا", "إسبانيا"],
    ["اسبانيا", "إسبانيا"],
    ["کیپ ورد", "الرأس الأخضر"],
    ["مصر", "مصر"],
    ["بلژیک", "بلجيكا"],
    ["عربستان سعودی", "السعودية"],
    ["سعودی", "السعودية"],
    ["اروگوئه", "أوروغواي"],
    ["اروگویه", "أوروغواي"],
    ["ایران", "إيران"],
    ["نیوزیلند", "نيوزيلندا"],
    ["سنگال", "السنغال"],
    ["فرانسه", "فرنسا"],
    ["نروژ", "النرويج"],
    ["انگلستان", "إنجلترا"],
    ["انگلیس", "إنجلترا"],
    ["پرتغال", "البرتغال"],
    ["قطر", "قطر"],
    ["کرواسی", "كرواتيا"],
    ["گینه", "غينيا"],
    ["مکزیک", "المكسيك"],
    ["جنوب آفریقا", "جنوب أفريقيا"],
    ["آفریقای جنوبی", "جنوب أفريقيا"],
    ["الجزایر", "الجزائر"],
    ["النمسا", "النمسا"],
    ["الأردن", "الأردن"],
    ["البرتغال", "البرتغال"],
    ["الكونغو", "الكونغو الديمقراطية"],
    ["كوريا", "كوريا الجنوبية"],
    ["التشيك", "التشيك"],
    ["كندا", "كندا"],
    ["البوسنة", "البوسنة والهرسك"],
    ["الهرسك", "البوسنة والهرسك"],
    ["أمريكا", "أمريكا"],
    ["العراق", "العراق"],
    ["سويسرا", "سويسرا"],
    ["البرازيل", "البرازيل"],
    ["المغرب", "المغرب"],
    ["هايتي", "هايتي"],
    ["إسكتلندا", "إسكتلندا"],
    ["أستراليا", "أستراليا"],
    ["تركيا", "تركيا"],
    ["ألمانيا", "ألمانيا"],
    ["كوراساو", "كوراساو"],
    ["اليابان", "اليابان"],
    ["هولندا", "هولندا"],
    ["الإكوادور", "الإكوادور"],
    ["ساحل العاج", "ساحل العاج"],
    ["السويد", "السويد"],
    ["تونس", "تونس"],
    ["إسبانيا", "إسبانيا"],
    ["الرأس الأخضر", "الرأس الأخضر"],
    ["مصر", "مصر"],
    ["بلجيكا", "بلجيكا"],
    ["السعودية", "السعودية"],
    ["أوروغواي", "أوروغواي"],
    ["إيران", "إيران"],
    ["نيوزيلندا", "نيوزيلندا"],
    ["السنغال", "السنغال"],
    ["فرنسا", "فرنسا"],
    ["النرويج", "النرويج"],
    ["إنجلترا", "إنجلترا"],
    ["كرواتيا", "كرواتيا"],
    ["بنما", "بنما"],
    ["كولومبيا", "كولومبيا"],
    ["أوزبكستان", "أوزبكستان"],
    ["غانا", "غانا"],
    ["باراغواي", "باراغواي"]
]);

const groupLetters = {
    'A': 'أ', 'B': 'ب', 'C': 'ج', 'D': 'د', 'E': 'هـ', 'F': 'و',
    'G': 'ز', 'H': 'ح', 'I': 'ط', 'J': 'ي', 'K': 'ك', 'L': 'ل'
};

const stadiums = {
    "1": "ملعب آزتيكا (المكسيك)",
    "2": "ملعب سيول (كوريا)",
    "3": "ملعب تورنتو (كندا)",
    "4": "ملعب لندن (إنجلترا)",
    "5": "ملعب برلين (ألمانيا)",
    "6": "ملعب بوينس آيرس (الأرجنتين)",
    "7": "ملعب مدريد (إسبانيا)",
    "8": "ملعب الرياض (السعودية)",
    "9": "ملعب باريس (فرنسا)",
    "10": "ملعب أبيدجان (ساحل العاج)",
    "11": "ملعب الرباط (المغرب)",
    "12": "ملعب سيدني (أستراليا)",
    "13": "ملعب اسطنبول (تركيا)",
    "14": "ملعب بروكسل (بلجيكا)",
    "15": "ملعب الدوحة (قطر)",
    "16": "ملعب واشنطن (أمريكا)"
};

const rawMatches = [
    { id: 1, team1: "المكسيك", team2: "جنوب أفريقيا", time: "2026-06-11T22:00:00", round: "first" },
    { id: 2, team1: "الأرجنتين", team2: "الجزائر", time: "2026-06-11T04:00:00", round: "first" },
    { id: 3, team1: "النمسا", team2: "الأردن", time: "2026-06-11T07:00:00", round: "first" },
    { id: 4, team1: "البرتغال", team2: "الكونغو الديمقراطية", time: "2026-06-11T20:00:00", round: "first" },
    { id: 5, team1: "كوريا الجنوبية", team2: "التشيك", time: "2026-06-12T05:00:00", round: "first" },
    { id: 6, team1: "كندا", team2: "البوسنة والهرسك", time: "2026-06-12T22:00:00", round: "first" },
    { id: 7, team1: "أمريكا", team2: "العراق", time: "2026-06-13T04:00:00", round: "first" },
    { id: 8, team1: "سويسرا", team2: "قطر", time: "2026-06-13T22:00:00", round: "first" },
    { id: 9, team1: "البرازيل", team2: "المغرب", time: "2026-06-14T01:00:00", round: "first" },
    { id: 10, team1: "هايتي", team2: "إسكتلندا", time: "2026-06-14T04:00:00", round: "first" },
    { id: 11, team1: "أستراليا", team2: "تركيا", time: "2026-06-14T07:00:00", round: "first" },
    { id: 12, team1: "ألمانيا", team2: "كوراساو", time: "2026-06-14T20:00:00", round: "first" },
    { id: 13, team1: "اليابان", team2: "هولندا", time: "2026-06-14T23:00:00", round: "first" },
    { id: 14, team1: "الإكوادور", team2: "ساحل العاج", time: "2026-06-15T02:00:00", round: "first" },
    { id: 15, team1: "السويد", team2: "تونس", time: "2026-06-15T05:00:00", round: "first" },
    { id: 16, team1: "إسبانيا", team2: "الرأس الأخضر", time: "2026-06-15T19:00:00", round: "first" },
    { id: 17, team1: "مصر", team2: "بلجيكا", time: "2026-06-15T22:00:00", round: "first" },
    { id: 18, team1: "السعودية", team2: "أوروغواي", time: "2026-06-16T01:00:00", round: "first" },
    { id: 19, team1: "إيران", team2: "نيوزيلندا", time: "2026-06-16T04:00:00", round: "first" },
    { id: 20, team1: "السنغال", team2: "فرنسا", time: "2026-06-16T22:00:00", round: "first" },
    { id: 21, team1: "النرويج", team2: "العراق", time: "2026-06-17T01:00:00", round: "first" },
    { id: 22, team1: "الجزائر", team2: "الأرجنتين", time: "2026-06-17T04:00:00", round: "first" },
    { id: 23, team1: "الأردن", team2: "النمسا", time: "2026-06-17T07:00:00", round: "first" },
    { id: 24, team1: "البرتغال", team2: "كرواتيا", time: "2026-06-17T20:00:00", round: "first" },
    { id: 25, team1: "إنجلترا", team2: "كرواتيا", time: "2026-06-17T23:00:00", round: "first" },
    { id: 26, team1: "جنوب أفريقيا", team2: "التشيك", time: "2026-06-18T19:00:00", round: "second" },
    { id: 27, team1: "سويسرا", team2: "البوسنة والهرسك", time: "2026-06-18T22:00:00", round: "second" },
    { id: 28, team1: "قطر", team2: "كندا", time: "2026-06-19T01:00:00", round: "second" },
    { id: 29, team1: "المكسيك", team2: "كوريا الجنوبية", time: "2026-06-19T04:00:00", round: "second" },
    { id: 30, team1: "أستراليا", team2: "أمريكا", time: "2026-06-19T22:00:00", round: "second" },
    { id: 31, team1: "المغرب", team2: "إسكتلندا", time: "2026-06-20T01:00:00", round: "second" },
    { id: 32, team1: "البرازيل", team2: "هايتي", time: "2026-06-20T03:30:00", round: "second" },
    { id: 33, team1: "تركيا", team2: "باراغواي", time: "2026-06-20T06:00:00", round: "second" },
    { id: 34, team1: "السويد", team2: "هولندا", time: "2026-06-20T20:00:00", round: "second" },
    { id: 35, team1: "ساحل العاج", team2: "ألمانيا", time: "2026-06-20T23:00:00", round: "second" },
    { id: 36, team1: "الإكوادور", team2: "كوراساو", time: "2026-06-21T03:00:00", round: "second" },
    { id: 37, team1: "اليابان", team2: "تونس", time: "2026-06-21T07:00:00", round: "second" },
    { id: 38, team1: "إسبانيا", team2: "السعودية", time: "2026-06-21T19:00:00", round: "second" },
    { id: 39, team1: "بلجيكا", team2: "إيران", time: "2026-06-21T22:00:00", round: "second" },
    { id: 40, team1: "أوروغواي", team2: "الرأس الأخضر", time: "2026-06-22T01:00:00", round: "second" },
    { id: 41, team1: "مصر", team2: "نيوزيلندا", time: "2026-06-22T04:00:00", round: "second" },
    { id: 42, team1: "الأرجنتين", team2: "النمسا", time: "2026-06-22T20:00:00", round: "second" },
    { id: 43, team1: "العراق", team2: "فرنسا", time: "2026-06-23T00:00:00", round: "second" },
    { id: 44, team1: "النرويج", team2: "السنغال", time: "2026-06-23T03:00:00", round: "second" },
    { id: 45, team1: "الأردن", team2: "الجزائر", time: "2026-06-23T06:00:00", round: "second" },
    { id: 46, team1: "البرتغال", team2: "أوزبكستان", time: "2026-06-23T20:00:00", round: "second" },
    { id: 47, team1: "إنجلترا", team2: "غانا", time: "2026-06-23T23:00:00", round: "second" },
    { id: 48, team1: "بنما", team2: "كرواتيا", time: "2026-06-24T02:00:00", round: "second" },
    { id: 49, team1: "كولومبيا", team2: "الكونغو الديمقراطية", time: "2026-06-24T05:00:00", round: "second" },
    { id: 50, team1: "كندا", team2: "سويسرا", time: "2026-06-24T22:00:00", round: "third" },
    { id: 51, team1: "قطر", team2: "البوسنة والهرسك", time: "2026-06-24T22:00:00", round: "third" },
    { id: 52, team1: "المغرب", team2: "هايتي", time: "2026-06-25T01:00:00", round: "third" },
    { id: 53, team1: "إسكتلندا", team2: "البرازيل", time: "2026-06-25T01:00:00", round: "third" },
    { id: 54, team1: "جنوب أفريقيا", team2: "كوريا الجنوبية", time: "2026-06-25T04:00:00", round: "third" },
    { id: 55, team1: "المكسيك", team2: "التشيك", time: "2026-06-25T04:00:00", round: "third" },
    { id: 56, team1: "كوراساو", team2: "ساحل العاج", time: "2026-06-25T23:00:00", round: "third" },
    { id: 57, team1: "ألمانيا", team2: "الإكوادور", time: "2026-06-25T23:00:00", round: "third" },
    { id: 58, team1: "هولندا", team2: "تونس", time: "2026-06-26T02:00:00", round: "third" },
    { id: 59, team1: "اليابان", team2: "السويد", time: "2026-06-26T02:00:00", round: "third" },
    { id: 60, team1: "أمريكا", team2: "تركيا", time: "2026-06-26T05:00:00", round: "third" },
    { id: 61, team1: "أستراليا", team2: "باراغواي", time: "2026-06-26T05:00:00", round: "third" },
    { id: 62, team1: "فرنسا", team2: "النرويج", time: "2026-06-26T22:00:00", round: "third" },
    { id: 63, team1: "السنغال", team2: "العراق", time: "2026-06-26T22:00:00", round: "third" },
    { id: 64, team1: "السعودية", team2: "الرأس الأخضر", time: "2026-06-27T03:00:00", round: "third" },
    { id: 65, team1: "إسبانيا", team2: "أوروغواي", time: "2026-06-27T03:00:00", round: "third" },
    { id: 66, team1: "إيران", team2: "مصر", time: "2026-06-27T06:00:00", round: "third" },
    { id: 67, team1: "نيوزيلندا", team2: "بلجيكا", time: "2026-06-27T06:00:00", round: "third" },
    { id: 68, team1: "إنجلترا", team2: "بنما", time: "2026-06-28T00:00:00", round: "third" },
    { id: 69, team1: "كرواتيا", team2: "غانا", time: "2026-06-28T00:00:00", round: "third" },
    { id: 70, team1: "البرتغال", team2: "كولومبيا", time: "2026-06-28T02:30:00", round: "third" },
    { id: 71, team1: "الكونغو الديمقراطية", team2: "أوزبكستان", time: "2026-06-28T02:30:00", round: "third" },
    { id: 72, team1: "الجزائر", team2: "النمسا", time: "2026-06-28T05:00:00", round: "third" },
    { id: 73, team1: "الأردن", team2: "الأرجنتين", time: "2026-06-28T05:00:00", round: "third" }
];

const finalGroups = {
    "A": ["المكسيك", "جنوب أفريقيا", "كوريا الجنوبية", "التشيك"],
    "B": ["كندا", "البوسنة والهرسك", "قطر", "سويسرا"],
    "C": ["البرازيل", "المغرب", "هايتي", "إسكتلندا"],
    "D": ["أمريكا", "باراغواي", "أستراليا", "تركيا"],
    "E": ["ألمانيا", "كوراساو", "ساحل العاج", "الإكوادور"],
    "F": ["هولندا", "اليابان", "السويد", "تونس"],
    "G": ["بلجيكا", "مصر", "إيران", "نيوزيلندا"],
    "H": ["إسبانيا", "الرأس الأخضر", "السعودية", "أوروغواي"],
    "I": ["فرنسا", "السنغال", "النرويج", "العراق"],
    "J": ["الأرجنتين", "الجزائر", "النمسا", "الأردن"],
    "K": ["البرتغال", "الكونغو الديمقراطية", "أوزبكستان", "كولومبيا"],
    "L": ["إنجلترا", "كرواتيا", "غانا", "بنما"]
};

const matchesData = rawMatches.map(m => ({
    ...m,
    timeISO: m.time + "+03:00",
    roundLabel: m.round === 'first' ? 'الجولة الأولى' : (m.round === 'second' ? 'الجولة الثانية' : 'الجولة الثالثة')
}));

function getFlag(name) {
    const map = {
        "المكسيك": "🇲🇽",
        "جنوب أفريقيا": "🇿🇦",
        "الأرجنتين": "🇦🇷",
        "الجزائر": "🇩🇿",
        "النمسا": "🇦🇹",
        "الأردن": "🇯🇴",
        "البرتغال": "🇵🇹",
        "الكونغو الديمقراطية": "🇨🇩",
        "كوريا الجنوبية": "🇰🇷",
        "التشيك": "🇨🇿",
        "كندا": "🇨🇦",
        "البوسنة والهرسك": "🇧🇦",
        "أمريكا": "🇺🇸",
        "العراق": "🇮🇶",
        "سويسرا": "🇨🇭",
        "قطر": "🇶🇦",
        "البرازيل": "🇧🇷",
        "المغرب": "🇲🇦",
        "هايتي": "🇭🇹",
        "إسكتلندا": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "أستراليا": "🇦🇺",
        "تركيا": "🇹🇷",
        "ألمانيا": "🇩🇪",
        "كوراساو": "🇨🇼",
        "اليابان": "🇯🇵",
        "هولندا": "🇳🇱",
        "الإكوادور": "🇪🇨",
        "ساحل العاج": "🇨🇮",
        "السويد": "🇸🇪",
        "تونس": "🇹🇳",
        "إسبانيا": "🇪🇸",
        "الرأس الأخضر": "🇨🇻",
        "مصر": "🇪🇬",
        "بلجيكا": "🇧🇪",
        "السعودية": "🇸🇦",
        "أوروغواي": "🇺🇾",
        "إيران": "🇮🇷",
        "نيوزيلندا": "🇳🇿",
        "السنغال": "🇸🇳",
        "فرنسا": "🇫🇷",
        "النرويج": "🇳🇴",
        "إنجلترا": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "كرواتيا": "🇭🇷",
        "بنما": "🇵🇦",
        "كولومبيا": "🇨🇴",
        "أوزبكستان": "🇺🇿",
        "غانا": "🇬🇭",
        "باراغواي": "🇵🇾"
    };
    return map[name] || "🏁";
}

// ------------------------------------------------------------
//  دوال الترجمة والتطبيع
// ------------------------------------------------------------

function normalizeName(str) {
    if (!str) return "";
    str = str.normalize("NFD").replace(/[\u064B-\u065F]/g, "");
    str = str.replace(/[ى]/g, "ا").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/[ک]/g, "ك").replace(/[ی]/g, "ي").replace(/[ي]/g, "ي").replace(/[ئ]/g, "ي").replace(/[ؤ]/g, "و").replace(/[إ]/g, "ا").replace(/[آ]/g, "ا");
    return str.trim().replace(/\s+/g, ' ');
}

function translateToArabic(raw) {
    if (!raw) return "";
    let trimmed = raw.trim();
    if (nameMapping.has(trimmed)) return nameMapping.get(trimmed);
    let normalized = normalizeName(trimmed);
    for (let [key, value] of nameMapping) {
        if (normalizeName(key) === normalized) return value;
    }
    let lower = trimmed.toLowerCase();
    for (let [key, value] of nameMapping) {
        if (key.toLowerCase() === lower) return value;
    }
    for (let [key, value] of nameMapping) {
        if (normalized.includes(normalizeName(key)) || normalizeName(key).includes(normalized)) {
            return value;
        }
    }
    console.warn(`⚠️ لم يتم العثور على ترجمة لـ: "${raw}"`);
    return trimmed;
}

function translateBracketTeamName(name) {
    if (!name) return name;
    let match = name.match(/^Winner\s+Group\s+([A-L])$/i);
    if (match) {
        let groupLetter = match[1].toUpperCase();
        let arabicLetter = groupLetters[groupLetter] || groupLetter;
        return `متصدر المجموعة (${arabicLetter})`;
    }
    match = name.match(/^Runner-up\s+Group\s+([A-L])$/i);
    if (match) {
        let groupLetter = match[1].toUpperCase();
        let arabicLetter = groupLetters[groupLetter] || groupLetter;
        return `وصيف المجموعة (${arabicLetter})`;
    }
    match = name.match(/^3rd\s+Group\s+([A-L\/]+)$/i);
    if (match) {
        let groups = match[1].toUpperCase().split('/');
        let arabicGroups = groups.map(g => groupLetters[g] || g).join('/');
        return `ثالث المجموعة (${arabicGroups})`;
    }
    match = name.match(/^Group\s+([A-L])$/i);
    if (match) {
        let groupLetter = match[1].toUpperCase();
        let arabicLetter = groupLetters[groupLetter] || groupLetter;
        return `المجموعة (${arabicLetter})`;
    }
    return translateToArabic(name);
}

// ------------------------------------------------------------
//  دوال الوقت والتنسيق
// ------------------------------------------------------------

function toSaudiTime(isoString) { return new Date(isoString); }
function getSaudiNow() { return new Date(); }

function formatSaudiDate(isoString) {
    const d = toSaudiTime(isoString);
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatSaudiTime(isoString) {
    const d = toSaudiTime(isoString);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatSaudiDateTime(isoString) {
    return `${formatSaudiDate(isoString)} - ${formatSaudiTime(isoString)}`;
}

function isTodaySaudi(isoString) {
    const d = toSaudiTime(isoString);
    const now = getSaudiNow();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isTomorrowSaudi(isoString) {
    const d = toSaudiTime(isoString);
    const now = getSaudiNow();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();
}

function getSaudiDay(isoString) {
    const d = toSaudiTime(isoString);
    return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][d.getDay()];
}

function matchTime(timeISO) { return new Date(timeISO).getTime(); }
function now() { return Date.now(); }

function isMatchLive(timeISO) {
    const cur = now();
    const start = matchTime(timeISO);
    return cur >= start && cur <= start + MATCH_DURATION;
}

function isMatchFinished(timeISO) {
    return now() > matchTime(timeISO) + MATCH_DURATION;
}

function canPredict(timeISO) {
    const start = matchTime(timeISO);
    const nowTime = now();
    const fiveMinutes = 5 * 60 * 1000;
    return (start - nowTime) > fiveMinutes;
}

function getMatchStatus(m) {
    const start = matchTime(m.timeISO);
    const end = start + MATCH_DURATION;
    const cur = now();
    if (cur < start) {
        const diff = start - cur;
        const h = Math.floor(diff / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const fiveMin = 5 * 60 * 1000;
        const remainingText = diff < fiveMin ? '⏳ تنطلق خلال أقل من 5 دقائق' : `⏱️ ${h}h ${min}m ${s}s`;
        return { live: false, finished: false, text: remainingText };
    } else if (cur <= end) {
        return { live: true, finished: false, text: "🔴 تُلعب الآن" };
    }
    return { live: false, finished: true, text: "✅ انتهت" };
}

function upcomingMatches(arr) {
    return arr.filter(m => (matchTime(m.timeISO) + MATCH_DURATION) > now());
}

function isMatchTodayOrTomorrow(timeISO) {
    return isTodaySaudi(timeISO) || isTomorrowSaudi(timeISO);
}

function isMatchToday(timeISO) { return isTodaySaudi(timeISO); }
function getDay(t) { return getSaudiDay(t); }
function getDateFmt(t) { return formatSaudiDate(t); }
function getTimeFromISO(t) { return formatSaudiTime(t); }
function getDateTimeDisplay(t) { return formatSaudiDateTime(t); }

function formatDate(isoString) {
    if (!isoString) return 'تاريخ غير معروف';
    const d = toSaudiTime(isoString);
    return `${d.getDate()} ${['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()]} ${d.getFullYear()}، ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function getStadiumName(id) {
    return stadiums[id] || `ملعب رقم ${id}`;
}

function getGroundForMatch(team1, team2, timeISO) {
    if (!state.openfootballMatches) return null;
    const t1 = translateToArabic(team1);
    const t2 = translateToArabic(team2);
    let match = state.openfootballMatches.find(m => {
        const h = translateToArabic(m.team1 || '');
        const a = translateToArabic(m.team2 || '');
        return (h === t1 && a === t2) || (h === t2 && a === t1);
    });
    if (match && match.ground) return match.ground;
    if (timeISO) {
        const dateStr = getDateFmt(timeISO);
        match = state.openfootballMatches.find(m => {
            if (!m.date) return false;
            return m.date.includes(dateStr) || dateStr.includes(m.date);
        });
        if (match && match.ground) return match.ground;
    }
    return null;
}

function findMatchResult(team1, team2) {
    const games = state.previousGamesData || [];
    let match = games.find(m => (m.homeAr === team1 && m.awayAr === team2) || (m.homeAr === team2 && m.awayAr === team1));
    if (match) return { homeScore: match.homeScore, awayScore: match.awayScore, homeAr: match.homeAr, awayAr: match.awayAr };
    return null;
}

function parseScorersWithMinutes(scorerString) {
    if (!scorerString || scorerString === "null") return [];
    let cleaned = scorerString.trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) cleaned = cleaned.slice(1, -1);
    let parts = cleaned.split(',').map(s => s.trim());
    let result = [];
    for (let part of parts) {
        part = part.replace(/^["“”]|["“”]$/g, '').trim();
        let minuteMatch = part.match(/^(.+?)\s+(\d+['’]?)(?:\s*\(([^)]+)\))?$/);
        if (minuteMatch) {
            let name = minuteMatch[1].trim();
            let minute = minuteMatch[2].trim();
            let type = minuteMatch[3] ? minuteMatch[3].trim() : '';
            result.push({ name, minute, type });
        } else {
            result.push({ name: part, minute: '', type: '' });
        }
    }
    return result;
}

function getSortTimestamp(game) {
    let ts = 0;
    const dateStr = game.local_date || '';
    if (dateStr) {
        const parts = dateStr.split(' ');
        const dateParts = parts[0]?.split('/');
        if (dateParts && dateParts.length === 3) {
            const d = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}T12:00:00`);
            if (!isNaN(d)) {
                ts = d.getTime();
            }
        }
        if (parts.length > 1 && parts[1]?.match(/\d{2}:\d{2}/)) {
            const timeParts = parts[1].split(':');
            if (timeParts.length === 2) {
                ts += parseInt(timeParts[0]) * 3600000 + parseInt(timeParts[1]) * 60000;
            }
        }
    }
    return ts;
}

// ------------------------------------------------------------
//  دوال التخزين المحلي
// ------------------------------------------------------------

function getCache(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.time > CACHE_TIME) return null;
        return parsed.value;
    } catch { return null; }
}

function setCache(key, value) {
    localStorage.setItem(key, JSON.stringify({ value, time: Date.now() }));
}

function getSubmittedMatches() {
    try {
        const raw = localStorage.getItem('submitted_matches');
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function addSubmittedMatch(matchId) {
    const current = getSubmittedMatches();
    if (!current.includes(matchId)) {
        current.push(matchId);
        localStorage.setItem('submitted_matches', JSON.stringify(current));
    }
}

function removeSubmittedMatch(matchId) {
    const current = getSubmittedMatches();
    const filtered = current.filter(id => id !== matchId);
    localStorage.setItem('submitted_matches', JSON.stringify(filtered));
}

function isMatchSubmitted(matchId) {
    return getSubmittedMatches().includes(matchId);
}

function getLocalPredictions() {
    try { const data = localStorage.getItem('predictions'); return data ? JSON.parse(data) : {}; } catch (e) { return {}; }
}

function saveLocalPrediction(userName, matchId, prediction) {
    try {
        const predictions = getLocalPredictions();
        predictions[`${userName}_${matchId}`] = { userName, matchId, prediction, timestamp: new Date().toISOString() };
        localStorage.setItem('predictions', JSON.stringify(predictions));
        return true;
    } catch (e) { return false; }
}

function getUserPredictionFromLocal(userName, matchId) {
    if (!userName) return null;
    return getLocalPredictions()[`${userName}_${matchId}`] || null;
}
// نهاية core.js