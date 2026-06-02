
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();


const loginBtn = document.getElementById('google-login-btn');
const feedbackForm = document.querySelector('.feedback-form');
const userAvatar = document.getElementById('user-avatar');
const userDisplayName = document.getElementById('user-display-name');
const commentsList = document.querySelector('.comments-list');

let currentUser = null;


auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;

        loginBtn.style.display = 'none';
        feedbackForm.style.display = 'flex';

        userAvatar.src = user.photoURL;
        userDisplayName.textContent = user.displayName;

    } else {
        currentUser = null;

        loginBtn.style.display = 'flex';
        feedbackForm.style.display = 'none';
    }
});


let isSigningIn = false;

if (loginBtn) {
    loginBtn.onclick = async () => {
        if (isSigningIn) return;

        isSigningIn = true;

        try {
            const result = await auth.signInWithPopup(provider);
            console.log("Login success:", result.user.displayName);
        } catch (error) {
            console.error("Login error:", error.code);

            if (error.code !== 'auth/cancelled-popup-request') {
                alert(error.message);
            }
        }

        isSigningIn = false;
    };
}
        


feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    const textarea = document.getElementById('comment-input');
    const text = textarea.value.trim();

    if (!text) {
        alert("كتب شي تعليق 😉");
        return;
    }

    const btn = feedbackForm.querySelector("button");
    btn.textContent = "جاري الإرسال...";

    try {
        await db.collection('comments').add({
            username: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        textarea.value = "";
        btn.textContent = "إرسال 🚀";

    } catch (err) {
        alert("وقع مشكل ❌");
        btn.textContent = "إرسال 🚀";
    }
});


db.collection('comments')
.orderBy('createdAt', 'desc')
.onSnapshot(snapshot => {

    commentsList.innerHTML = "";

    snapshot.forEach(doc => {
        const c = doc.data();

        const isAdmin = (c.email === "outazroutothman@gmail.com");

        const date = c.createdAt?.toDate().toLocaleString() || "";

        commentsList.innerHTML += `
            <div class="comment-card ${isAdmin ? 'admin-card' : ''}">

                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${c.photoURL || 'https://i.pravatar.cc/150'}"
                         style="width:35px; height:35px; border-radius:50%;">

                    <h4>
                        ${escapeHTML(c.username)}
                        ${isAdmin ? '<span class="admin-badge">⚡ Admin</span>' : ''}
                    </h4>
                </div>

                <p>${escapeHTML(c.text)}</p>

                <small>${date}</small>
            </div>
        `;
    });
});

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
}
