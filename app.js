// 🔥 Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// عناصر HTML
const loginBtn = document.getElementById("google-login-btn");
const form = document.querySelector(".feedback-form");
const textarea = form.querySelector("textarea");
const commentsList = document.querySelector(".comments-list");

const userAvatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-display-name");

// ✅ تسجيل الدخول بـ Google (مطور بـ Redirect عشان ما يبقاش يختفي 🪄)
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider); // كيديك لصفحة غوغل فـ نفس النافذة بلا بلوكاج
});

// مراقبة النتيجة مورا ما كيرجع التلميذ من غوغل
auth.getRedirectResult().catch((error) => {
    console.error("خطأ في الاتصال بجوجل: ", error.message);
});

// ✅ مراقبة حالة المستخدم
auth.onAuthStateChanged(user => {
    if (user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (form) form.style.display = "flex"; // رجعناها flex باش تجي مقادة مع الستايل

        if (userAvatar) userAvatar.src = user.photoURL;
        if (userName) userName.textContent = user.displayName;
    } else {
        if (loginBtn) loginBtn.style.display = "block";
        if (form) form.style.display = "none";
    }
});

// ✅ إضافة تعليق (مع حفظ الإيميل للتحقق من الـ Admin 🔒)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const text = textarea.value.trim();
    if (text === "") return;

    await db.collection("comments").add({
        text: text,
        name: user.displayName,
        email: user.email, // 🔒 زدنا حفظ الإيميل هنا باش السيرفر يتعرف عليك كـ مصمم
        photo: user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    textarea.value = "";
});

// ✅ عرض التعليقات لايف (مع التوهج الأسطوري وشارة المصمم الخاصة بيك ⚡)
db.collection("comments")
.orderBy("createdAt", "desc")
.onSnapshot(snapshot => {
    commentsList.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();
        
        // 🔒 فحص أمني: التحقق بالإيميل الجديد ديالك واش نتا هو الـ Admin
        let isAdmin = (data.email === "outazroutsmail@gmail.com");

        const comment = document.createElement("div");
        comment.className = `comment-card ${isAdmin ? 'admin-card' : ''}`; // كياخد الستايل الفخم د الـ CSS
        comment.style.background = isAdmin ? "rgba(34, 211, 238, 0.05)" : "#1e293b";
        comment.style.padding = "15px";
        comment.style.marginBottom = "12px";
        comment.style.borderRadius = "12px";
        comment.style.display = "flex";
        comment.style.gap = "12px";
        comment.style.direction = "rtl"; /* ضبط الاتجاه للغة العربية */
        if (isAdmin) comment.style.borderRight = "4px solid #22d3ee";

        comment.innerHTML = `
            <img src="${data.photo || 'https://w3schools.com'}" style="width:40px;height:40px;border-radius:50%">
            <div style="text-align: right; width: 100%;">
                <strong style="color:#22d3ee; display: flex; align-items: center; gap: 8px;">
                    ${escapeHTML(data.name)} 
                    ${isAdmin ? '<span class="admin-badge" style="background:#22d3ee; color:#0f172a; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:bold;">⚡ مصمم الموقع</span>' : ''}
                </strong>
                <p style="margin:5px 0; color:rgba(248, 250, 252, 0.9); font-size:0.95rem; line-height:1.6;">${escapeHTML(data.text)}</p>
            </div>
        `;

        commentsList.appendChild(comment);
    });
});

// 🛡️ دالة الحماية د الـ Cybersecurity لمنع ثغرات الـ XSS في التعليقات
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
