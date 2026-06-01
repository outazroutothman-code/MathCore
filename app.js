// 1. تفعيل قاعدة البيانات والـ Auth (مأخوذة من الـ HTML)
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 2. ربط عناصر الواجهة
const loginBtn = document.getElementById('google-login-btn');
const feedbackForm = document.querySelector('.feedback-form');
const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');
const commentsList = document.querySelector('.comments-list');

let currentUser = null;

// 3. مراقبة حالة المستخدم (واش مسجل دخول ولا لا)
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        if (loginBtn) loginBtn.style.display = 'none';
        if (feedbackForm) feedbackForm.style.display = 'flex';
        if (userAvatar) userAvatar.src = user.photoURL;
        if (userDisplayName) userDisplayName.textContent = user.displayName;
    } else {
        currentUser = null;
        if (loginBtn) loginBtn.style.display = 'flex';
        if (feedbackForm) feedbackForm.style.display = 'none';
    }
});

// 4. تشغيل زر الدخول بحساب جوجل فاش كيكليكي عليه التلميذ (الـ Popup 🪄)
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        auth.signInWithPopup(provider)
        .then((result) => {
            console.log("تسجيل الدخول بنجاح:", result.user.displayName);
        })
        .catch((error) => {
            console.error("خطأ في تسجيل الدخول: ", error.message);
        });
    });
}

// 5. جلب وعرض التعليقات لايف من السيرفر وتمييز المصممين بالإيميل (حماية أمنية 🛡️)
if (commentsList) {
    db.collection('comments').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        commentsList.innerHTML = '';
        snapshot.forEach((doc) => {
            const comment = doc.data();
            let isAdmin = (comment.email === "outazroutothman@gmail.com"); 
            
            const commentCard = `
                <div class="comment-card ${isAdmin ? 'admin-card' : ''}">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; direction:rtl;">
                        <img src="${comment.photoURL || 'https://w3schools.com'}" style="width:30px; height:30px; border-radius:50%;">
                        <h4 class="${isAdmin ? 'admin-name' : ''}">
                            ${escapeHTML(comment.username)} ${isAdmin ? '<span class="admin-badge">⚡ مصمم الموقع</span>' : ''}
                        </h4>
                    </div>
                    <p style="padding-right: 38px; text-align:right; direction:rtl;">${escapeHTML(comment.text)}</p>
                </div>
            `;
            commentsList.innerHTML += commentCard;
        });
    });
}

// 6. إرسال تعليق جديد للسيرفر مع معلومات حساب جوجل
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const textarea = feedbackForm.querySelector('textarea');
        const textInput = textarea.value;

        db.collection('comments').add({
            username: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            text: textInput,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            textarea.value = ''; // تفريغ الخانة
        }).catch((error) => {
            console.error("Error adding comment: ", error);
        });
    });
}

// 🛡️ دالة الحماية لمنع ثغرات الـ XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
