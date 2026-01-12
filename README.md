<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>أداة متابعة الفرق الرياضية - AI Sports Tracker</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #1a73e8;
            --primary-dark: #0d47a1;
            --secondary: #34a853;
            --danger: #ea4335;
            --warning: #fbbc04;
            --light: #f8f9fa;
            --dark: #202124;
            --gray: #5f6368;
            --gray-light: #dadce0;
            --card-bg: #ffffff;
            --body-bg: #f5f7fa;
            --border-radius: 16px;
            --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Cairo', sans-serif;
            background-color: var(--body-bg);
            color: var(--dark);
            line-height: 1.6;
            max-width: 100%;
            overflow-x: hidden;
            padding-bottom: 80px;
        }

        .container {
            width: 100%;
            padding: 0 16px;
            margin: 0 auto;
        }

        /* Header */
        header {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: white;
            padding: 20px 16px;
            border-radius: 0 0 24px 24px;
            box-shadow: var(--shadow);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo i {
            font-size: 24px;
        }

        .logo h1 {
            font-size: 20px;
            font-weight: 700;
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .header-actions button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--transition);
        }

        .header-actions button:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* API Input Section in Header */
        .api-input-section {
            margin-top: 16px;
            background: rgba(255, 255, 255, 0.1);
            padding: 12px;
            border-radius: var(--border-radius);
            display: none;
        }

        .api-input-section.active {
            display: block;
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .api-input-group {
            display: flex;
            gap: 8px;
        }

        .api-input-group input {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 14px;
            background: rgba(255, 255, 255, 0.9);
        }

        .api-input-group input:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .api-input-group button {
            padding: 12px 16px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .api-input-group .btn-save {
            background: var(--secondary);
            color: white;
        }

        .api-input-group .btn-delete {
            background: var(--danger);
            color: white;
        }

        .api-input-group button:hover {
            opacity: 0.9;
        }

        .api-info {
            margin-top: 8px;
            font-size: 12px;
            opacity: 0.9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .api-info a {
            color: white;
            text-decoration: none;
            border-bottom: 1px dashed white;
        }

        .api-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
        }

        .api-status i {
            font-size: 12px;
        }

        .api-status.connected {
            color: #4caf50;
        }

        .api-status.disconnected {
            color: #ff9800;
        }

        /* Main Content */
        .main-content {
            padding: 20px 0;
        }

        /* Tab Navigation */
        .tabs {
            display: flex;
            background: var(--card-bg);
            border-radius: var(--border-radius);
            overflow: hidden;
            margin-bottom: 24px;
            box-shadow: var(--shadow);
        }

        .tab {
            flex: 1;
            padding: 16px;
            text-align: center;
            background: none;
            border: none;
            font-family: 'Cairo', sans-serif;
            font-weight: 600;
            font-size: 15px;
            color: var(--gray);
            cursor: pointer;
            transition: var(--transition);
            position: relative;
        }

        .tab.active {
            color: var(--primary);
        }

        .tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 20%;
            right: 20%;
            height: 3px;
            background-color: var(--primary);
            border-radius: 2px;
        }

        /* Tab Content */
        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Cards */
        .card {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .card-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--dark);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card-title i {
            color: var(--primary);
        }

        .card-badge {
            background: var(--primary);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }

        /* Team Info */
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .team-card {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 16px;
            text-align: center;
            box-shadow: var(--shadow);
            transition: var(--transition);
            border: 2px solid transparent;
        }

        .team-card:hover {
            border-color: var(--primary);
            transform: scale(1.03);
        }

        .team-card.selected {
            border-color: var(--primary);
            background: rgba(26, 115, 232, 0.05);
        }

        .team-logo {
            width: 70px;
            height: 70px;
            margin: 0 auto 12px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: white;
        }

        .team-name {
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 4px;
        }

        .team-league {
            font-size: 13px;
            color: var(--gray);
        }

        /* Match List */
        .match-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .match-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: var(--light);
            border-radius: 12px;
            border-left: 4px solid var(--primary);
        }

        .match-teams {
            flex: 1;
        }

        .match-teams div {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 6px;
        }

        .match-date {
            font-size: 13px;
            color: var(--gray);
            text-align: center;
            min-width: 120px;
        }

        /* AI Chat Section */
        .ai-chat-section {
            margin-top: 20px;
        }

        .ai-chat-container {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 20px;
            box-shadow: var(--shadow);
        }

        .ai-chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .ai-chat-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 700;
        }

        .ai-chat-title i {
            color: var(--warning);
        }

        .ai-prompt {
            margin-bottom: 16px;
        }

        .ai-prompt textarea {
            width: 100%;
            padding: 14px;
            border: 2px solid var(--gray-light);
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-size: 15px;
            resize: vertical;
            min-height: 100px;
            transition: var(--transition);
        }

        .ai-prompt textarea:focus {
            outline: none;
            border-color: var(--primary);
        }

        .ai-response {
            background: var(--light);
            border-radius: var(--border-radius);
            padding: 16px;
            margin-top: 16px;
            min-height: 100px;
            display: none;
        }

        .ai-response.active {
            display: block;
        }

        .ai-response h4 {
            margin-bottom: 10px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ai-response-content {
            line-height: 1.8;
        }

        .ai-response-content.loading {
            color: var(--gray);
            font-style: italic;
        }

        /* News List */
        .news-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .news-item {
            padding: 16px;
            background: var(--light);
            border-radius: 12px;
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }

        .news-icon {
            width: 50px;
            height: 50px;
            background: var(--primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }

        .news-content h4 {
            margin-bottom: 6px;
            font-weight: 700;
        }

        .news-content p {
            color: var(--gray);
            font-size: 14px;
            margin-bottom: 8px;
        }

        .news-time {
            font-size: 12px;
            color: var(--gray);
        }

        /* Standings */
        .standings-table {
            width: 100%;
            border-collapse: collapse;
        }

        .standings-table th {
            background: var(--primary);
            color: white;
            padding: 14px;
            text-align: right;
            font-weight: 600;
        }

        .standings-table td {
            padding: 14px;
            border-bottom: 1px solid var(--gray-light);
        }

        .standings-table tr:hover {
            background: rgba(26, 115, 232, 0.05);
        }

        .team-standing {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .team-standing span {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            color: white;
        }

        .pos-1 {
            background: gold;
        }
        .pos-2 {
            background: silver;
        }
        .pos-3 {
            background: #cd7f32;
        }
        .pos-4-6 {
            background: var(--primary);
        }
        .pos-other {
            background: var(--gray);
        }

        /* Buttons */
        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: var(--border-radius);
            font-family: 'Cairo', sans-serif;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--primary-dark);
        }

        .btn-secondary {
            background: var(--gray-light);
            color: var(--dark);
        }

        .btn-secondary:hover {
            background: #c9ccd1;
        }

        .btn-warning {
            background: var(--warning);
            color: white;
        }

        .btn-warning:hover {
            background: #f9a825;
        }

        /* Loading */
        .loading {
            text-align: center;
            padding: 40px;
            color: var(--gray);
        }

        .loading i {
            font-size: 40px;
            margin-bottom: 16px;
            color: var(--primary);
        }

        /* Footer */
        .footer-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--card-bg);
            display: flex;
            justify-content: space-around;
            padding: 12px 0;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
            z-index: 100;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: var(--gray);
            text-decoration: none;
            font-size: 12px;
            transition: var(--transition);
        }

        .nav-item i {
            font-size: 20px;
            margin-bottom: 4px;
        }

        .nav-item.active {
            color: var(--primary);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .team-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .match-item {
                flex-direction: column;
                gap: 12px;
                align-items: flex-start;
            }
            
            .match-date {
                text-align: right;
                align-self: flex-end;
            }
            
            .api-input-group {
                flex-direction: column;
            }
        }

        @media (max-width: 480px) {
            .header-content {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }
            
            .header-actions {
                align-self: flex-end;
            }
            
            .team-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- Header with API Input -->
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-robot"></i>
                    <h1>متابعة الفرق بالذكاء الاصطناعي</h1>
                </div>
                <div class="header-actions">
                    <button id="refreshBtn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button id="apiToggleBtn">
                        <i class="fas fa-key"></i>
                    </button>
                </div>
            </div>
            
            <!-- API Input Section -->
            <div class="api-input-section" id="apiInputSection">
                <div class="api-input-group">
                    <input type="text" id="apiKeyInput" 
                           placeholder="أدخل رابط Gemini API الخاص بك هنا...">
                    <button class="btn-save" id="saveApiBtn">
                        <i class="fas fa-save"></i> حفظ
                    </button>
                    <button class="btn-delete" id="deleteApiBtn">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
                <div class="api-info">
                    <div class="api-status" id="apiStatus">
                        <i class="fas fa-circle"></i>
                        <span>API غير متصل</span>
                    </div>
                    <a href="https://aistudio.google.com/apikey" target="_blank">
                        <i class="fas fa-external-link-alt"></i> احصل على API مجاناً
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container main-content">
        <!-- Tabs -->
        <div class="tabs">
            <button class="tab active" data-tab="teams">الفرق</button>
            <button class="tab" data-tab="matches">المباريات</button>
            <button class="tab" data-tab="standings">الترتيب</button>
            <button class="tab" data-tab="ai">الذكاء الاصطناعي</button>
        </div>

        <!-- Teams Tab -->
        <div id="teams" class="tab-content active">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-users"></i> الفرق المفضلة</h2>
                    <span class="card-badge">4 فرق</span>
                </div>
                <p style="color: var(--gray); margin-bottom: 20px;">اختر فريقاً لمشاهدة تفاصيله وأخباره</p>
                
                <div class="team-grid" id="teamsGrid">
                    <!-- سيتم إضافة الفرق ديناميكياً -->
                </div>
            </div>
            
            <!-- Team Details will be loaded here -->
            <div id="teamDetails"></div>
        </div>

        <!-- Matches Tab -->
        <div id="matches" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-calendar-alt"></i> مواعيد المباريات</h2>
                    <span class="card-badge" id="matchesCount">جار التحميل...</span>
                </div>
                <p style="color: var(--gray); margin-bottom: 20px;">مباريات الأسبوع الحالي لجميع الفرق</p>
                
                <div class="match-list" id="matchesList">
                    <!-- سيتم إضافة المباريات ديناميكياً -->
                </div>
            </div>
        </div>

        <!-- Standings Tab -->
        <div id="standings" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-trophy"></i> ترتيب الفرق في البطولات</h2>
                    <span class="card-badge" id="standingsUpdate">محدث</span>
                </div>
                
                <div id="standingsContainer">
                    <!-- سيتم إضافة الترتيب ديناميكياً -->
                </div>
            </div>
        </div>

        <!-- AI Chat Tab -->
        <div id="ai" class="tab-content">
            <div class="card ai-chat-container">
                <div class="ai-chat-header">
                    <div class="ai-chat-title">
                        <i class="fas fa-robot"></i>
                        <span>مساعد الذكاء الاصطناعي</span>
                    </div>
                    <div class="api-status" id="aiApiStatus">
                        <i class="fas fa-circle"></i>
                        <span>API غير متصل</span>
                    </div>
                </div>
                
                <p style="color: var(--gray); margin-bottom: 20px;">
                    اسأل عن أي معلومات تريدها حول الفرق، المباريات، الترتيب، أو الأخبار
                </p>
                
                <div class="ai-prompt">
                    <textarea id="aiQuestion" 
                              placeholder="اكتب سؤالك هنا... مثال: ما هو ترتيب النصر في الدوري السعودي؟ أو متى ستكون المباراة القادمة لريال مدريد؟"></textarea>
                </div>
                
                <button class="btn btn-warning" id="askAIBtn" style="width: 100%;">
                    <i class="fas fa-paper-plane"></i> اسأل الذكاء الاصطناعي
                </button>
                
                <div class="ai-response" id="aiResponse">
                    <h4><i class="fas fa-robot"></i> رد الذكاء الاصطناعي:</h4>
                    <div class="ai-response-content" id="aiResponseContent">
                        <!-- سيتم عرض الرد هنا -->
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h2 class="card-title"><i class="fas fa-lightbulb"></i> أمثلة للأسئلة</h2>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: var(--light); padding: 12px; border-radius: 8px;">
                        <strong>عن الفرق:</strong> "ما هو تشكيلة النصر الأساسية؟"
                    </div>
                    <div style="background: var(--light); padding: 12px; border-radius: 8px;">
                        <strong>عن المباريات:</strong> "ما هي مباريات هذا الأسبوع لبرشلونة؟"
                    </div>
                    <div style="background: var(--light); padding: 12px; border-radius: 8px;">
                        <strong>عن الترتيب:</strong> "من هو المتصدر في الدوري الإنجليزي؟"
                    </div>
                    <div style="background: var(--light); padding: 12px; border-radius: 8px;">
                        <strong>عن الأخبار:</strong> "ما هي آخر أخبار انتقالات مانشستر سيتي؟"
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="footer-nav">
        <a href="#" class="nav-item active" data-tab="teams">
            <i class="fas fa-users"></i>
            <span>الفرق</span>
        </a>
        <a href="#" class="nav-item" data-tab="matches">
            <i class="fas fa-calendar-alt"></i>
            <span>المباريات</span>
        </a>
        <a href="#" class="nav-item" data-tab="standings">
            <i class="fas fa-trophy"></i>
            <span>الترتيب</span>
        </a>
        <a href="#" class="nav-item" data-tab="ai">
            <i class="fas fa-robot"></i>
            <span>الذكاء</span>
        </a>
    </div>

    <script>
        // بيانات الفرق
        const teams = [
            {
                id: 1,
                name: "النصر",
                league: "الدوري السعودي",
                color: "#0d724a",
                icon: "fas fa-shield-alt",
                matches: [
                    { opponent: "الهلال", date: "2024-08-15", time: "20:00", competition: "كأس الملك" },
                    { opponent: "الاتحاد", date: "2024-08-20", time: "21:00", competition: "الدوري السعودي" },
                    { opponent: "الشباب", date: "2024-08-25", time: "19:30", competition: "الدوري السعودي" }
                ],
                standings: { position: 2, points: 65, played: 30, wins: 20, draws: 5, losses: 5 },
                news: [
                    { title: "النصر يتأهل لدور الـ16 من دوري أبطال آسيا", time: "قبل ساعتين", content: "تأهل فريق النصر إلى دور الـ16 من دوري أبطال آسيا بعد فوزه على نظيره..." },
                    { title: "إصابة لاعب النصر في التدريبات", time: "قبل يوم", content: "تعرض لاعب خط وسط النصر لإصابة طفيفة خلال التدريبات اليومية..." }
                ]
            },
            {
                id: 2,
                name: "ريال مدريد",
                league: "الدوري الإسباني",
                color: "#00529f",
                icon: "fas fa-crown",
                matches: [
                    { opponent: "برشلونة", date: "2024-08-18", time: "22:00", competition: "الكأس" },
                    { opponent: "أتلتيكو مدريد", date: "2024-08-22", time: "21:00", competition: "الدوري الإسباني" },
                    { opponent: "بايرن ميونخ", date: "2024-08-28", time: "20:45", competition: "دوري الأبطال" }
                ],
                standings: { position: 1, points: 78, played: 32, wins: 24, draws: 6, losses: 2 },
                news: [
                    { title: "ريال مدريد يفوز بالدوري الإسباني", time: "قبل يومين", content: "توج ريال مدريد بلقب الدوري الإسباني للمرة الـ36 في تاريخه..." },
                    { title: "هداف ريال مدريد يتصدر قائمة الهدافين", time: "قبل 5 أيام", content: "نجح لاعب ريال مدريد في تصدر قائمة هدافي الدوري الإسباني..." }
                ]
            },
            {
                id: 3,
                name: "برشلونة",
                league: "الدوري الإسباني",
                color: "#a50044",
                icon: "fas fa-shield-alt",
                matches: [
                    { opponent: "ريال مدريد", date: "2024-08-18", time: "22:00", competition: "الكأس" },
                    { opponent: "فالنسيا", date: "2024-08-24", time: "20:00", competition: "الدوري الإسباني" },
                    { opponent: "يوفنتوس", date: "2024-08-30", time: "21:00", competition: "دوري الأبطال" }
                ],
                standings: { position: 3, points: 70, played: 32, wins: 21, draws: 7, losses: 4 },
                news: [
                    { title: "برشلونة يعلن عن تعاقد جديد", time: "قبل 3 أيام", content: "أعلن نادي برشلونة عن تعاقده مع لاعب وسط جديد لمدة 4 سنوات..." },
                    { title: "مدرب برشلونة: نسعى لاستعادة المجد", time: "قبل أسبوع", content: "صرح مدرب برشلونة بأن الفريق يسعى لاستعادة مجده في الموسم القادم..." }
                ]
            },
            {
                id: 4,
                name: "مانشستر سيتي",
                league: "الدوري الإنجليزي",
                color: "#6caee0",
                icon: "fas fa-city",
                matches: [
                    { opponent: "مانشستر يونايتد", date: "2024-08-17", time: "16:30", competition: "الدوري الإنجليزي" },
                    { opponent: "ليفربول", date: "2024-08-23", time: "18:00", competition: "الدوري الإنجليزي" },
                    { opponent: "ريال مدريد", date: "2024-09-05", time: "21:00", competition: "دوري الأبطال" }
                ],
                standings: { position: 2, points: 82, played: 35, wins: 26, draws: 4, losses: 5 },
                news: [
                    { title: "مانشستر سيتي يحقق ثلاثية تاريخية", time: "قبل 4 أيام", content: "حقق مانشستر سيتي ثلاثية تاريخية بعد فوزه بالدوري المحلي..." },
                    { title: "لاعب سيتي يفوز بجائزة أفضل لاعب", time: "قبل أسبوع", content: "فاز لاعب خط وسط مانشستر سيتي بجائزة أفضل لاعب في الدوري الإنجليزي..." }
                ]
            }
        ];

        // حالة التطبيق
        let currentTeam = teams[0];
        let apiKey = localStorage.getItem('gemini_api_key') || '';
        let apiConnected = false;

        // تهيئة التطبيق
        document.addEventListener('DOMContentLoaded', function() {
            initTeams();
            initTabs();
            initNavigation();
            initApiSection();
            loadData();
            
            // إعداد زر التحديث
            document.getElementById('refreshBtn').addEventListener('click', function() {
                refreshData();
            });
            
            // إعداد زر الذكاء الاصطناعي
            document.getElementById('askAIBtn').addEventListener('click', function() {
                askAIQuestion();
            });
            
            // السماح بالضغط على Enter في حقل الأسئلة
            document.getElementById('aiQuestion').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAIQuestion();
                }
            });
        });

        // تهيئة قسم API
        function initApiSection() {
            const apiToggleBtn = document.getElementById('apiToggleBtn');
            const apiInputSection = document.getElementById('apiInputSection');
            const saveApiBtn = document.getElementById('saveApiBtn');
            const deleteApiBtn = document.getElementById('deleteApiBtn');
            const apiKeyInput = document.getElementById('apiKeyInput');
            
            // تحميل API المحفوظ
            if (apiKey) {
                apiKeyInput.value = apiKey;
                updateApiStatus(true);
            }
            
            // تبديل عرض قسم API
            apiToggleBtn.addEventListener('click', function() {
                apiInputSection.classList.toggle('active');
            });
            
            // حفظ API
            saveApiBtn.addEventListener('click', function() {
                const key = apiKeyInput.value.trim();
                
                if (!key) {
                    showNotification('الرجاء إدخال رابط API', 'warning');
                    return;
                }
                
                // التحقق من صيغة API
                if (!isValidApiKey(key)) {
                    showNotification('رابط API غير صالح', 'danger');
                    return;
                }
                
                // حفظ في localStorage
                localStorage.setItem('gemini_api_key', key);
                apiKey = key;
                
                // تحديث الحالة
                updateApiStatus(true);
                
                // اختبار الاتصال
                testApiConnection();
                
                showNotification('تم حفظ رابط API بنجاح', 'success');
            });
            
            // حذف API
            deleteApiBtn.addEventListener('click', function() {
                if (confirm('هل أنت متأكد من حذف رابط API؟')) {
                    localStorage.removeItem('gemini_api_key');
                    apiKey = '';
                    apiKeyInput.value = '';
                    updateApiStatus(false);
                    showNotification('تم حذف رابط API', 'info');
                }
            });
        }

        // التحقق من صيغة API
        function isValidApiKey(key) {
            // يمكنك إضافة المزيد من التحقق هنا
            return key.length > 30 && key.includes('AIza');
        }

        // تحديث حالة API
        function updateApiStatus(connected) {
            const apiStatus = document.getElementById('apiStatus');
            const aiApiStatus = document.getElementById('aiApiStatus');
            apiConnected = connected;
            
            if (connected) {
                apiStatus.className = 'api-status connected';
                apiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>API متصل</span>';
                
                aiApiStatus.className = 'api-status connected';
                aiApiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>API متصل</span>';
            } else {
                apiStatus.className = 'api-status disconnected';
                apiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>API غير متصل</span>';
                
                aiApiStatus.className = 'api-status disconnected';
                aiApiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>API غير متصل</span>';
            }
        }

        // اختبار اتصال API
        async function testApiConnection() {
            if (!apiKey) return false;
            
            try {
                // محاكاة اختبار اتصال
                await new Promise(resolve => setTimeout(resolve, 500));
                return true;
            } catch (error) {
                console.error('API connection error:', error);
                return false;
            }
        }

        // تهيئة الفرق
        function initTeams() {
            const teamsGrid = document.getElementById('teamsGrid');
            teamsGrid.innerHTML = '';
            
            teams.forEach(team => {
                const teamCard = document.createElement('div');
                teamCard.className = `team-card ${team.id === currentTeam.id ? 'selected' : ''}`;
                teamCard.innerHTML = `
                    <div class="team-logo" style="background-color: ${team.color};">
                        <i class="${team.icon}"></i>
                    </div>
                    <div class="team-name">${team.name}</div>
                    <div class="team-league">${team.league}</div>
                `;
                
                teamCard.addEventListener('click', () => {
                    // إزالة التحديد من جميع البطاقات
                    document.querySelectorAll('.team-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                    
                    // إضافة التحديد للبطاقة المختارة
                    teamCard.classList.add('selected');
                    
                    // تحديث الفريق الحالي
                    currentTeam = team;
                    
                    // عرض تفاصيل الفريق
                    showTeamDetails(team);
                    
                    // تحديث البيانات
                    loadMatches();
                });
                
                teamsGrid.appendChild(teamCard);
            });
            
            // عرض تفاصيل الفريق الأول
            showTeamDetails(currentTeam);
        }

        // عرض تفاصيل الفريق
        function showTeamDetails(team) {
            const teamDetails = document.getElementById('teamDetails');
            teamDetails.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title"><i class="${team.icon}" style="color: ${team.color};"></i> ${team.name}</h2>
                        <span class="card-badge" style="background-color: ${team.color};">${team.league}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                            <div style="text-align: center;">
                                <div style="font-size: 14px; color: var(--gray);">المركز</div>
                                <div style="font-size: 32px; font-weight: 700; color: ${team.color};">${team.standings.position}</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 14px; color: var(--gray);">النقاط</div>
                                <div style="font-size: 32px; font-weight: 700;">${team.standings.points}</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 14px; color: var(--gray);">المباريات</div>
                                <div style="font-size: 32px; font-weight: 700;">${team.standings.played}</div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="font-size: 14px; color: var(--gray); margin-bottom: 8px;">المباراة القادمة</div>
                            <div style="background: rgba(0, 0, 0, 0.03); padding: 16px; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                    <div>
                                        <div style="font-weight: 700; font-size: 18px;">${team.name} vs ${team.matches[0].opponent}</div>
                                        <div style="font-size: 14px; color: var(--gray);">
                                            <i class="fas fa-trophy"></i> ${team.matches[0].competition}
                                        </div>
                                    </div>
                                    <div style="text-align: left;">
                                        <div style="font-weight: 700; font-size: 18px;">${team.matches[0].date}</div>
                                        <div style="font-size: 14px; color: var(--gray);">
                                            <i class="far fa-clock"></i> ${team.matches[0].time}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div style="font-size: 14px; color: var(--gray); margin-bottom: 8px;">آخر الأخبار</div>
                            <div style="background: rgba(0, 0, 0, 0.03); padding: 16px; border-radius: 12px;">
                                <div style="font-weight: 700; margin-bottom: 8px;">${team.news[0].title}</div>
                                <div style="font-size: 14px; color: var(--gray); margin-bottom: 8px;">${team.news[0].content}</div>
                                <div style="font-size: 12px; color: var(--gray);">
                                    <i class="far fa-clock"></i> ${team.news[0].time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // تهيئة التبويبات
        function initTabs() {
            const tabs = document.querySelectorAll('.tab');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.getAttribute('data-tab');
                    
                    // إزالة النشاط من جميع التبويبات
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(tc => tc.classList.remove('active'));
                    
                    // إضافة النشاط للتبويب المختار
                    tab.classList.add('active');
                    document.getElementById(tabId).classList.add('active');
                    
                    // تحديث التنقل
                    document.querySelectorAll('.nav-item').forEach(nav => {
                        nav.classList.remove('active');
                        if (nav.getAttribute('data-tab') === tabId) {
                            nav.classList.add('active');
                        }
                    });
                    
                    // إخفاء قسم API
                    document.getElementById('apiInputSection').classList.remove('active');
                });
            });
        }

        // تهيئة التنقل السفلي
        function initNavigation() {
            const navItems = document.querySelectorAll('.nav-item');
            
            navItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = item.getAttribute('data-tab');
                    
                    // إزالة النشاط من جميع عناصر التنقل
                    navItems.forEach(nav => nav.classList.remove('active'));
                    
                    // إضافة النشاط للعنصر المختار
                    item.classList.add('active');
                    
                    // التبديل للتبويب المقابل
                    document.querySelectorAll('.tab').forEach(tab => {
                        tab.classList.remove('active');
                        if (tab.getAttribute('data-tab') === tabId) {
                            tab.classList.add('active');
                        }
                    });
                    
                    document.querySelectorAll('.tab-content').forEach(tc => {
                        tc.classList.remove('active');
                        if (tc.id === tabId) {
                            tc.classList.add('active');
                        }
                    });
                    
                    // إخفاء قسم API
                    document.getElementById('apiInputSection').classList.remove('active');
                });
            });
        }

        // تحميل البيانات
        function loadData() {
            loadMatches();
            loadStandings();
        }

        // تحميل المباريات
        function loadMatches() {
            const matchesList = document.getElementById('matchesList');
            const matchesCount = document.getElementById('matchesCount');
            
            if (!matchesList) return;
            
            // عرض التحميل
            matchesList.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل المباريات...</p>
                </div>
            `;
            
            // محاكاة تأخير API
            setTimeout(() => {
                let allMatches = [];
                teams.forEach(team => {
                    team.matches.forEach(match => {
                        allMatches.push({
                            ...match,
                            teamName: team.name,
                            teamColor: team.color
                        });
                    });
                });
                
                // ترتيب حسب التاريخ
                allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
                
                // عرض المباريات
                matchesList.innerHTML = '';
                allMatches.forEach(match => {
                    const matchElement = document.createElement('div');
                    matchElement.className = 'match-item';
                    matchElement.innerHTML = `
                        <div class="match-teams">
                            <div>
                                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${match.teamColor};"></div>
                                <strong>${match.teamName}</strong> vs ${match.opponent}
                            </div>
                            <div style="font-size: 13px; color: var(--gray);">
                                <i class="fas fa-trophy"></i> ${match.competition}
                            </div>
                        </div>
                        <div class="match-date">
                            <div>${match.date}</div>
                            <div style="font-weight: 700;">${match.time}</div>
                        </div>
                    `;
                    matchesList.appendChild(matchElement);
                });
                
                // تحديث عدد المباريات
                matchesCount.textContent = `${allMatches.length} مباراة`;
            }, 800);
        }

        // تحميل الترتيب
        function loadStandings() {
            const standingsContainer = document.getElementById('standingsContainer');
            
            if (!standingsContainer) return;
            
            // عرض التحميل
            standingsContainer.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل الترتيب...</p>
                </div>
            `;
            
            // محاكاة تأخير API
            setTimeout(() => {
                standingsContainer.innerHTML = '';
                
                // إنشاء الترتيب لكل دوري
                const leagues = [
                    { name: "الدوري السعودي", teams: [teams[0]] },
                    { name: "الدوري الإسباني", teams: [teams[1], teams[2]] },
                    { name: "الدوري الإنجليزي", teams: [teams[3]] }
                ];
                
                leagues.forEach(league => {
                    if (league.teams.length > 0) {
                        const leagueCard = document.createElement('div');
                        leagueCard.className = 'card';
                        leagueCard.style.marginBottom = '20px';
                        
                        let tableRows = '';
                        league.teams.forEach(team => {
                            let posClass = '';
                            if (team.standings.position === 1) posClass = 'pos-1';
                            else if (team.standings.position === 2) posClass = 'pos-2';
                            else if (team.standings.position === 3) posClass = 'pos-3';
                            else if (team.standings.position <= 6) posClass = 'pos-4-6';
                            else posClass = 'pos-other';
                            
                            tableRows += `
                                <tr>
                                    <td>
                                        <div class="team-standing">
                                            <span class="${posClass}">${team.standings.position}</span>
                                            <div>
                                                <div style="font-weight: 700;">${team.name}</div>
                                                <div style="font-size: 12px; color: var(--gray);">${team.league}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${team.standings.played}</td>
                                    <td>${team.standings.wins}</td>
                                    <td>${team.standings.draws}</td>
                                    <td>${team.standings.losses}</td>
                                    <td><strong>${team.standings.points}</strong></td>
                                </tr>
                            `;
                        });
                        
                        leagueCard.innerHTML = `
                            <div class="card-header">
                                <h3 class="card-title"><i class="fas fa-trophy"></i> ${league.name}</h3>
                            </div>
                            <div style="overflow-x: auto;">
                                <table class="standings-table">
                                    <thead>
                                        <tr>
                                            <th>الفريق</th>
                                            <th>لعب</th>
                                            <th>فوز</th>
                                            <th>تعادل</th>
                                            <th>خسارة</th>
                                            <th>نقاط</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableRows}
                                    </tbody>
                                </table>
                            </div>
                        `;
                        
                        standingsContainer.appendChild(leagueCard);
                    }
                });
            }, 800);
        }

        // طرح سؤال على الذكاء الاصطناعي
        async function askAIQuestion() {
            const question = document.getElementById('aiQuestion').value.trim();
            const aiResponse = document.getElementById('aiResponse');
            const aiResponseContent = document.getElementById('aiResponseContent');
            
            if (!question) {
                showNotification('الرجاء إدخال سؤال', 'warning');
                return;
            }
            
            if (!apiConnected) {
                showNotification('الرجاء إدخال وتوصيل رابط API أولاً', 'danger');
                // فتح قسم API
                document.getElementById('apiInputSection').classList.add('active');
                return;
            }
            
            // عرض التحميل
            aiResponse.classList.add('active');
            aiResponseContent.innerHTML = `
                <div class="loading" style="padding: 20px;">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري معالجة سؤالك...</p>
                </div>
            `;
            
            // تحريك العرض لأسفل
            aiResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            try {
                // محاكاة استدعاء API للذكاء الاصطناعي
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // إنشاء رد بناءً على السؤال
                const response = generateAIResponse(question);
                
                // عرض الرد
                aiResponseContent.innerHTML = response;
                
                // إضافة سؤال التاريخ
                addToQuestionHistory(question);
                
            } catch (error) {
                console.error('AI Error:', error);
                aiResponseContent.innerHTML = `
                    <div style="color: var(--danger);">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>حدث خطأ:</strong> تعذر الاتصال بخدمة الذكاء الاصطناعي. 
                        يرجى التحقق من اتصال API والمحاولة مرة أخرى.
                    </div>
                `;
            }
        }

        // توليد رد الذكاء الاصطناعي
        function generateAIResponse(question) {
            const questionLower = question.toLowerCase();
            
            // التحقق من الأسئلة المتعلقة بالنصر
            if (questionLower.includes('نصر') || questionLower.includes('النصر')) {
                return `
                    <p><strong>معلومات عن نادي النصر:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>الدوري: الدوري السعودي للمحترفين</li>
                        <li>المركز الحالي: الثاني</li>
                        <li>النقاط: 65 نقطة</li>
                        <li>المباريات الملعوبة: 30 مباراة</li>
                        <li>الفوز: 20 مباراة | التعادل: 5 | الخسارة: 5</li>
                        <li>المباراة القادمة: ضد الهلال في 2024-08-15 الساعة 20:00</li>
                        <li>البطولة: كأس الملك</li>
                    </ul>
                    <p style="margin-top: 10px;">فريق النصر يقدم أداءً قوياً هذا الموسم ويتنافس على لقب الدوري.</p>
                `;
            }
            
            // التحقق من الأسئلة المتعلقة بريال مدريد
            else if (questionLower.includes('ريال') || questionLower.includes('مدريد')) {
                return `
                    <p><strong>معلومات عن ريال مدريد:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>الدوري: الدوري الإسباني (لا ليغا)</li>
                        <li>المركز الحالي: الأول</li>
                        <li>النقاط: 78 نقطة</li>
                        <li>المباريات الملعوبة: 32 مباراة</li>
                        <li>الفوز: 24 مباراة | التعادل: 6 | الخسارة: 2</li>
                        <li>المباراة القادمة: ضد برشلونة في 2024-08-18 الساعة 22:00</li>
                        <li>البطولة: كأس ملك إسبانيا</li>
                    </ul>
                    <p style="margin-top: 10px;">ريال مدريد هو حامل لقب الدوري الإسباني ويقدم أداءً استثنائياً هذا الموسم.</p>
                `;
            }
            
            // التحقق من الأسئلة المتعلقة ببرشلونة
            else if (questionLower.includes('برشلونة') || questionLower.includes('برشلونه')) {
                return `
                    <p><strong>معلومات عن برشلونة:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>الدوري: الدوري الإسباني (لا ليغا)</li>
                        <li>المركز الحالي: الثالث</li>
                        <li>النقاط: 70 نقطة</li>
                        <li>المباريات الملعوبة: 32 مباراة</li>
                        <li>الفوز: 21 مباراة | التعادل: 7 | الخسارة: 4</li>
                        <li>المباراة القادمة: ضد ريال مدريد في 2024-08-18 الساعة 22:00</li>
                        <li>البطولة: كأس ملك إسبانيا (كلاسيكو)</li>
                    </ul>
                    <p style="margin-top: 10px;">برشلونة يحاول استعادة الصدارة في الدوري الإسباني هذا الموسم.</p>
                `;
            }
            
            // التحقق من الأسئلة المتعلقة بمانشستر سيتي
            else if (questionLower.includes('سيتي') || questionLower.includes('مانشستر')) {
                return `
                    <p><strong>معلومات عن مانشستر سيتي:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>الدوري: الدوري الإنجليزي الممتاز</li>
                        <li>المركز الحالي: الثاني</li>
                        <li>النقاط: 82 نقطة</li>
                        <li>المباريات الملعوبة: 35 مباراة</li>
                        <li>الفوز: 26 مباراة | التعادل: 4 | الخسارة: 5</li>
                        <li>المباراة القادمة: ضد مانشستر يونايتد في 2024-08-17 الساعة 16:30</li>
                        <li>البطولة: الدوري الإنجليزي الممتاز (ديربي مانشستر)</li>
                    </ul>
                    <p style="margin-top: 10px;">مانشستر سيتي حقق ثلاثية تاريخية في الموسم الماضي ويتنافس على لقب الدوري هذا الموسم.</p>
                `;
            }
            
            // التحقق من الأسئلة العامة
            else if (questionLower.includes('متى') || questionLower.includes('موعد')) {
                return `
                    <p><strong>مواعيد المباريات القادمة:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>النصر vs الهلال: 2024-08-15 الساعة 20:00</li>
                        <li>مانشستر سيتي vs مانشستر يونايتد: 2024-08-17 الساعة 16:30</li>
                        <li>ريال مدريد vs برشلونة: 2024-08-18 الساعة 22:00</li>
                        <li>النصر vs الاتحاد: 2024-08-20 الساعة 21:00</li>
                        <li>ريال مدريد vs أتلتيكو مدريد: 2024-08-22 الساعة 21:00</li>
                    </ul>
                    <p style="margin-top: 10px;">يمكنك عرض جميع المباريات في تبويب "المباريات".</p>
                `;
            }
            
            else if (questionLower.includes('ترتيب') || questionLower.includes('مركز')) {
                return `
                    <p><strong>ترتيب الفرق في دورياتهم:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>النصر: المركز الثاني في الدوري السعودي</li>
                        <li>ريال مدريد: المركز الأول في الدوري الإسباني</li>
                        <li>برشلونة: المركز الثالث في الدوري الإسباني</li>
                        <li>مانشستر سيتي: المركز الثاني في الدوري الإنجليزي</li>
                    </ul>
                    <p style="margin-top: 10px;">يمكنك عرض الترتيب المفصل في تبويب "الترتيب".</p>
                `;
            }
            
            else if (questionLower.includes('أخبار') || questionLower.includes('جديد')) {
                return `
                    <p><strong>آخر الأخبار:</strong></p>
                    <ul style="padding-right: 20px;">
                        <li>النصر: تأهل إلى دور الـ16 من دوري أبطال آسيا</li>
                        <li>ريال مدريد: توج بلقب الدوري الإسباني للمرة الـ36</li>
                        <li>برشلونة: أعلن عن تعاقد جديد مع لاعب وسط</li>
                        <li>مانشستر سيتي: حقق ثلاثية تاريخية</li>
                    </ul>
                    <p style="margin-top: 10px;">للحصول على تفاصيل أكثر، اختر الفريق من تبويب "الفرق".</p>
                `;
            }
            
            // رد عام
            else {
                return `
                    <p><strong>رد على سؤالك:</strong> "${question}"</p>
                    <p>يمكنني مساعدتك في:</p>
                    <ul style="padding-right: 20px;">
                        <li>معلومات عن الفريق: النصر، ريال مدريد، برشلونة، مانشستر سيتي</li>
                        <li>مواعيد المباريات القادمة</li>
                        <li>ترتيب الفرق في البطولات</li>
                        <li>آخر الأخبار والتحديثات</li>
                        <li>إحصائيات الفرق والأداء</li>
                    </ul>
                    <p style="margin-top: 10px;">جرب أن تسأل عن فريق معين أو عن مباراة محددة للحصول على معلومات دقيقة.</p>
                `;
            }
        }

        // إضافة السؤال للتاريخ
        function addToQuestionHistory(question) {
            let history = JSON.parse(localStorage.getItem('ai_question_history') || '[]');
            history.unshift({
                question: question,
                timestamp: new Date().toISOString()
            });
            
            // حفظ آخر 10 أسئلة فقط
            history = history.slice(0, 10);
            localStorage.setItem('ai_question_history', JSON.stringify(history));
        }

        // تحديث البيانات
        function refreshData() {
            const refreshBtn = document.getElementById('refreshBtn');
            const originalHTML = refreshBtn.innerHTML;
            
            // عرض التحميل
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // تحديث جميع البيانات
            loadData();
            showTeamDetails(currentTeam);
            
            // إعادة الزر للحالة الأصلية
            setTimeout(() => {
                refreshBtn.innerHTML = originalHTML;
                showNotification('تم تحديث البيانات بنجاح', 'success');
            }, 1000);
        }

        // عرض الإشعارات
        function showNotification(message, type = 'info') {
            // إنشاء عنصر الإشعار
            const notification = document.createElement('div');
            
            // تحديد اللون حسب النوع
            let bgColor = var(--primary);
            if (type === 'success') bgColor = '#34a853';
            if (type === 'warning') bgColor = '#fbbc04';
            if (type === 'danger') bgColor = '#ea4335';
            
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                left: 20px;
                background-color: ${bgColor};
                color: white;
                padding: 14px 18px;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow);
                z-index: 1000;
                text-align: center;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // إزالة بعد 3 ثوانٍ
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        // إضافة أنيميشن للإشعارات
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>
