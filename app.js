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

// ✅ تسجيل الدخول بـ Google
loginBtn.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
});

// ✅ مراقبة حالة المستخدم
auth.onAuthStateChanged(user => {
    if (user) {
        loginBtn.style.display = "none";
        form.style.display = "block";

        userAvatar.src = user.photoURL;
        userName.textContent = user.displayName;
    } else {
        loginBtn.style.display = "block";
        form.style.display = "none";
    }
});

// ✅ إضافة تعليق
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const text = textarea.value.trim();
    if (text === "") return;

    await db.collection("comments").add({
        text: text,
        name: user.displayName,
        photo: user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    textarea.value = "";
});

// ✅ عرض التعليقات لايف
db.collection("comments")
.orderBy("createdAt", "desc")
.onSnapshot(snapshot => {
    commentsList.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();

        const comment = document.createElement("div");
        comment.style.background = "#1e293b";
        comment.style.padding = "10px";
        comment.style.marginBottom = "10px";
        comment.style.borderRadius = "10px";
        comment.style.display = "flex";
        comment.style.gap = "10px";

        comment.innerHTML = `
            <img src="${data.photo}" style="width:40px;height:40px;border-radius:50%">
            <div>
                <strong style="color:#22d3ee">${data.name}</strong>
                <p style="margin:5px 0;color:white">${data.text}</p>
            </div>
        `;

        commentsList.appendChild(comment);
    });
});

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /comments/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
