// Jika sudah login, langsung lempar ke dashboard
if (localStorage.getItem("isLoggedIn") === "true") {
  window.location.href = "index.html";
}

// Cek apakah sistem sudah memiliki akun terdaftar
function ambilDaftarAkun() {
  const data = localStorage.getItem("akunPengguna");
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function simpanAkun(username, password) {
  const akun = { username: username.toLowerCase().trim(), password };
  localStorage.setItem("akunPengguna", JSON.stringify(akun));
  // Sinkronisasi untuk kompatibilitas jika ada fitur ganti password lama
  localStorage.setItem("userPassword", password);
}

// Buka tampilan tertentu ('register', 'login', atau 'ubah-password')
function bukaBox(jenis) {
  const boxRegister = document.getElementById("box-register");
  const boxLogin = document.getElementById("box-login");
  const boxUbah = document.getElementById("box-ubah-password");

  // Sembunyikan semua pesan error & sukses
  const pesanList = ["reg-error", "reg-sukses", "login-error", "ubah-error", "ubah-sukses"];
  pesanList.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  boxRegister.style.display = jenis === "register" ? "block" : "none";
  boxLogin.style.display = jenis === "login" ? "block" : "none";
  boxUbah.style.display = jenis === "ubah-password" ? "block" : "none";

  if (jenis === "register") {
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-password").value = "";
    document.getElementById("reg-konfirmasi").value = "";
    document.getElementById("reg-username").focus();
  } else if (jenis === "login") {
    document.getElementById("login-username").focus();
  } else if (jenis === "ubah-password") {
    document.getElementById("ubah-username").value = "";
    document.getElementById("ubah-pass-lama").value = "";
    document.getElementById("ubah-pass-baru").value = "";
    document.getElementById("ubah-pass-konfirmasi").value = "";
    document.getElementById("ubah-username").focus();
  }
}

// Proses Pendaftaran Akun Baru
function prosesDaftar() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  const konfirmasi = document.getElementById("reg-konfirmasi").value;
  const errorEl = document.getElementById("reg-error");
  const suksesEl = document.getElementById("reg-sukses");

  errorEl.style.display = "none";
  suksesEl.style.display = "none";

  if (!username) {
    errorEl.innerText = "❌ Username tidak boleh kosong!";
    errorEl.style.display = "block";
    return;
  }

  if (password.length < 4) {
    errorEl.innerText = "❌ Password minimal 4 karakter!";
    errorEl.style.display = "block";
    return;
  }

  if (password !== konfirmasi) {
    errorEl.innerText = "❌ Konfirmasi password tidak cocok!";
    errorEl.style.display = "block";
    return;
  }

  // Simpan akun baru dan langsung login otomatis
  simpanAkun(username, password);
  suksesEl.innerText = "✅ Akun berhasil dibuat! Mengalihkan ke dashboard...";
  suksesEl.style.display = "block";

  localStorage.setItem("isLoggedIn", "true");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Proses Login
function prosesLogin() {
  const user = document.getElementById("login-username").value.toLowerCase().trim();
  const pass = document.getElementById("login-password").value;
  const errorMsg = document.getElementById("login-error");

  const akunTersimpan = ambilDaftarAkun();

  let loginBerhasil = false;

  if (akunTersimpan) {
    if (akunTersimpan.username === user && akunTersimpan.password === pass) {
      loginBerhasil = true;
    }
  } else {
    // Akun bawaan default jika pengguna belum pernah registrasi mandiri
    const defaultUser = "dimas";
    const defaultPass = localStorage.getItem("userPassword") || "alfianto";
    if (user === defaultUser && pass === defaultPass) {
      loginBerhasil = true;
    }
  }

  if (loginBerhasil) {
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "index.html";
  } else {
    errorMsg.style.display = "block";
    const box = document.querySelector(".login-box:not([style*='display: none'])");
    if (box) {
      box.style.transform = "translateX(-10px)";
      setTimeout(() => (box.style.transform = "translateX(10px)"), 100);
      setTimeout(() => (box.style.transform = "translateX(0)"), 200);
    }
  }
}

// Proses Ubah Password
function prosesUbahPassword() {
  const username = document.getElementById("ubah-username").value.toLowerCase().trim();
  const passLama = document.getElementById("ubah-pass-lama").value;
  const passBaru = document.getElementById("ubah-pass-baru").value;
  const passKonfirmasi = document.getElementById("ubah-pass-konfirmasi").value;
  const errorEl = document.getElementById("ubah-error");
  const suksesEl = document.getElementById("ubah-sukses");

  errorEl.style.display = "none";
  suksesEl.style.display = "none";

  const akunTersimpan = ambilDaftarAkun();
  const validUser = akunTersimpan ? akunTersimpan.username : "dimas";
  const validPass = akunTersimpan ? akunTersimpan.password : (localStorage.getItem("userPassword") || "alfianto");

  if (username !== validUser) {
    errorEl.innerText = "❌ Username salah!";
    errorEl.style.display = "block";
    return;
  }

  if (passLama !== validPass) {
    errorEl.innerText = "❌ Password lama tidak sesuai!";
    errorEl.style.display = "block";
    return;
  }

  if (!passBaru || passBaru.length < 4) {
    errorEl.innerText = "❌ Password baru minimal 4 karakter!";
    errorEl.style.display = "block";
    return;
  }

  if (passBaru !== passKonfirmasi) {
    errorEl.innerText = "❌ Konfirmasi password tidak cocok!";
    errorEl.style.display = "block";
    return;
  }

  simpanAkun(username, passBaru);
  suksesEl.innerText = "✅ Password berhasil diubah! Silakan login.";
  suksesEl.style.display = "block";

  setTimeout(() => {
    bukaBox("login");
    document.getElementById("login-username").value = username;
    document.getElementById("login-password").value = "";
    document.getElementById("login-password").focus();
  }, 1200);
}

// Inisialisasi: Jika belum ada akun tersimpan sama sekali di browser, arahkan langsung ke formulir Buat Akun Baru
document.addEventListener("DOMContentLoaded", () => {
  const akun = ambilDaftarAkun();
  if (!akun && !localStorage.getItem("userPassword")) {
    // Pengguna pertama kali
    bukaBox("register");
  } else {
    bukaBox("login");
  }
});
