const USERNAME_BENAR = "dimas";

// Jika sudah login, langsung lempar ke dashboard
if (localStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "index.html";
}

function prosesLogin() {
  const user = document.getElementById("login-username").value.trim();
  const pass = document.getElementById("login-password").value;
  const errorMsg = document.getElementById("login-error");
  const passwordTersimpan = localStorage.getItem("userPassword") || "alfianto";

  if (user === USERNAME_BENAR && pass === passwordTersimpan) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "index.html";
  } else {
    errorMsg.style.display = "block";
    const box = document.querySelector(".login-box");
    box.style.transform = "translateX(-10px)";
    setTimeout(() => (box.style.transform = "translateX(10px)"), 100);
    setTimeout(() => (box.style.transform = "translateX(0)"), 200);
  }
}
