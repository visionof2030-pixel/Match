<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تجربة الذكاء الاصطناعي</title>
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Arial', sans-serif;
}

body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: white;
    border-radius: 20px;
    padding: 30px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h1 {
    color: #333;
    margin-bottom: 10px;
    font-size: 24px;
}

.header p {
    color: #666;
    font-size: 14px;
}

.test-area {
    margin-bottom: 20px;
}

.input-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: bold;
}

input, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s;
}

input:focus, textarea:focus {
    outline: none;
    border-color: #667eea;
}

textarea {
    min-height: 100px;
    resize: vertical;
}

.buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

button {
    flex: 1;
    padding: 14px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

#testBtn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

#aiBtn {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

button:active {
    transform: translateY(0);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

.result {
    margin-top: 30px;
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    border-left: 4px solid #667eea;
}

.result h3 {
    color: #333;
    margin-bottom: 10px;
}

#responseText {
    color: #333;
    line-height: 1.6;
    font-size: 15px;
}

.loading {
    display: none;
    text-align: center;
    color: #667eea;
    font-weight: bold;
    margin: 10px 0;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.status {
    text-align: center;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-weight: bold;
}

.status.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.info-box {
    background: #e8f4fc;
    border-radius: 10px;
    padding: 15px;
    margin-top: 20px;
    border-left: 4px solid #2196F3;
}

.info-box h4 {
    color: #1565C0;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-box p {
    color: #424242;
    font-size: 14px;
    line-height: 1.5;
}

.info-box code {
    background: #ffffff;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #d32f2f;
}
</style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>🔧 تجربة اتصال الذكاء الاصطناعي</h1>
        <p>اختبار اتصال Render Server والذكاء الاصطناعي</p>
    </div>

    <div id="serverStatus" class="status"></div>

    <div class="test-area">
        <div class="input-group">
            <label for="testPrompt">✍️ اكتب سؤالاً للاختبار:</label>
            <input type="text" id="testPrompt" placeholder="اكتب سؤالاً مثل: كيف أكتب تقريراً تربوياً؟" value="كيف أكتب تقريراً تربوياً مميزاً؟">
        </div>

        <div class="buttons">
            <button id="testBtn" onclick="testConnection()">
                <i class="fas fa-wifi"></i> اختبار الاتصال
            </button>
            <button id="aiBtn" onclick="testAI()">
                <i class="fas fa-robot"></i> تجربة الذكاء الاصطناعي
            </button>
        </div>
    </div>

    <div id="loading" class="loading">
        <div class="spinner"></div>
        جاري الاتصال بالخادم...
    </div>

    <div class="result">
        <h3>📋 نتيجة الاختبار:</h3>
        <div id="responseText">ستظهر النتيجة هنا...</div>
    </div>

    <div class="info-box">
        <h4><i class="fas fa-info-circle"></i> معلومات التقنية:</h4>
        <p>• الرابط المستخدم: <code>https://gemini-backend-x1r2.onrender.com/ask</code></p>
        <p>• النموذج: <code>gemini-2.0-flash-exp</code></p>
        <p>• الطريقة: <code>POST</code></p>
        <p>• نوع البيانات: <code>application/json</code></p>
    </div>
</div>

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<script>
// عناصر DOM
const serverStatus = document.getElementById('serverStatus');
const loading = document.getElementById('loading');
const responseText = document.getElementById('responseText');
const testPrompt = document.getElementById('testPrompt');
const testBtn = document.getElementById('testBtn');
const aiBtn = document.getElementById('aiBtn');

// URL الخاص بالخادم
const SERVER_URL = 'https://gemini-backend-x1r2.onrender.com';

// اختبار اتصال الخادم الأساسي
async function testConnection() {
    showLoading(true);
    clearStatus();
    
    try {
        // اختبار بسيط للخادم
        const response = await fetch(SERVER_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(10000) // 10 ثواني
        });
        
        if (response.ok) {
            showStatus('✅ اتصال ناجح! الخادم يعمل بشكل صحيح', 'success');
            responseText.innerHTML = `
                <p><strong>الحالة:</strong> ✅ النجاح</p>
                <p><strong>الرمز:</strong> ${response.status}</p>
                <p><strong>الحالة:</strong> ${response.statusText}</p>
                <p><strong>الرابط:</strong> ${SERVER_URL}</p>
            `;
        } else {
            throw new Error(`الخادم يعمل ولكن مع خطأ: ${response.status}`);
        }
        
    } catch (error) {
        console.error('خطأ في الاتصال:', error);
        showStatus(`❌ خطأ في الاتصال: ${error.message}`, 'error');
        responseText.innerHTML = `
            <p><strong>الحالة:</strong> ❌ فشل</p>
            <p><strong>الخطأ:</strong> ${error.message}</p>
            <p><strong>نصيحة:</strong> تأكد من اتصال الإنترنت ومن أن الخادم يعمل</p>
        `;
    } finally {
        showLoading(false);
    }
}

// اختبار الذكاء الاصطناعي
async function testAI() {
    const prompt = testPrompt.value.trim();
    if (!prompt) {
        alert('الرجاء إدخال سؤال للاختبار');
        return;
    }
    
    showLoading(true);
    clearStatus();
    
    try {
        // إعداد البيانات للإرسال
        const requestData = {
            prompt: prompt,
            model: "gemini-2.0-flash-exp"
        };
        
        console.log('جاري إرسال:', requestData);
        
        // إرسال الطلب إلى الذكاء الاصطناعي
        const response = await fetch(`${SERVER_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData),
            signal: AbortSignal.timeout(30000) // 30 ثانية
        });
        
        if (!response.ok) {
            throw new Error(`خطأ ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('الاستجابة:', data);
        
        if (data.response) {
            showStatus('✅ نجاح! تم الحصول على إجابة من الذكاء الاصطناعي', 'success');
            responseText.innerHTML = `
                <p><strong>✅ النجاح:</strong> تمت العملية بنجاح</p>
                <p><strong>📝 الإجابة:</strong></p>
                <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; margin-top: 10px; border-right: 3px solid #4CAF50;">
                    ${formatResponse(data.response)}
                </div>
                ${data.model ? `<p><strong>🤖 النموذج:</strong> ${data.model}</p>` : ''}
            `;
        } else {
            throw new Error('لا توجد إجابة في الاستجابة');
        }
        
    } catch (error) {
        console.error('خطأ في الذكاء الاصطناعي:', error);
        showStatus(`❌ خطأ: ${error.message}`, 'error');
        
        // عرض تفاصيل الخطأ
        responseText.innerHTML = `
            <p><strong>❌ فشل في الاتصال بالذكاء الاصطناعي</strong></p>
            <p><strong>الخطأ:</strong> ${error.message}</p>
            <p><strong>الأسباب المحتملة:</strong></p>
            <ul style="margin-right: 20px; margin-top: 10px;">
                <li>الخادم غير متوفر حالياً</li>
                <li>مشكلة في API Key</li>
                <li>الموديل غير متوفر</li>
                <li>مشكلة في الشبكة</li>
            </ul>
            <p style="margin-top: 10px;"><strong>حلول مقترحة:</strong></p>
            <ul style="margin-right: 20px;">
                <li>جرب مرة أخرى بعد قليل</li>
                <li>تحقق من اتصال الإنترنت</li>
                <li>اتصل بمطور الخادم</li>
            </ul>
        `;
    } finally {
        showLoading(false);
    }
}

// تنسيق الاستجابة
function formatResponse(text) {
    // تحويل الأسطر الجديدة إلى <br>
    return text.replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// إظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    testBtn.disabled = show;
    aiBtn.disabled = show;
}

// إظهار حالة الخادم
function showStatus(message, type) {
    serverStatus.textContent = message;
    serverStatus.className = `status ${type}`;
    serverStatus.style.display = 'block';
}

// مسح حالة الخادم
function clearStatus() {
    serverStatus.style.display = 'none';
    serverStatus.textContent = '';
}

// اختبار تلقائي عند تحميل الصفحة
window.addEventListener('load', function() {
    // اختبار سريع للاتصال
    setTimeout(async () => {
        try {
            const response = await fetch(SERVER_URL, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
                showStatus('🔄 جاهز - الخادم متصل', 'success');
            }
        } catch (error) {
            showStatus('⚠️ تحذير - لا يمكن الاتصال بالخادم', 'error');
        }
    }, 1000);
});

// تمكين الإرسال بـ Enter
testPrompt.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        testAI();
    }
});
</script>

</body>
</html>