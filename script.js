// ==========================================
// 1. SATPAM KEAMANAN & LOGOUT
// ==========================================
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

function logout() {
  if (confirm("Apakah kamu yakin ingin keluar?")) {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  }
}

// ==========================================
// 2. LOGIKA KEUANGAN
// ==========================================
let daftarTransaksi = JSON.parse(localStorage.getItem("dataKeuangan")) || [];
let budgetBulanan = parseInt(localStorage.getItem("budgetBulanan")) || 0;
let saldoTabungan = parseInt(localStorage.getItem("saldoTabungan")) || 0;

const formatRp = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);

function formatTanggalTampilan(tanggalStr) {
  if (!tanggalStr) return "-";
  const [tahun, bulan, tgl] = tanggalStr.split("-");
  return `${tgl}/${bulan}/${tahun}`;
}

function aturDefaultTanggal() {
  const inputTgl = document.getElementById("input-tanggal");
  if (inputTgl && !inputTgl.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    inputTgl.value = `${yyyy}-${mm}-${dd}`;
  }
}

function simpanBudget() {
  let val = document.getElementById("set-budget").value;
  if (val) {
    budgetBulanan = parseInt(val);
    localStorage.setItem("budgetBulanan", budgetBulanan);
    document.getElementById("set-budget").value = "";
    alert("Batas pengeluaran berhasil diatur!");
    updateRingkasan();
  }
}

function nabung() {
  let val = document.getElementById("add-goal").value;
  if (val && parseInt(val) > 0) {
    let nominalNabung = parseInt(val);
    let sisaDompetSaatIni = hitungSaldoDompet();
    if (nominalNabung > sisaDompetSaatIni) {
      alert("Uang di dompetmu tidak cukup!");
      return;
    }
    saldoTabungan += nominalNabung;
    localStorage.setItem("saldoTabungan", saldoTabungan);
    document.getElementById("add-goal").value = "";
    alert(`Berhasil memindahkan ${formatRp(nominalNabung)} ke tabungan!`);
    updateRingkasan();
  }
}

function tambahTransaksi() {
  const tanggal = document.getElementById("input-tanggal").value;
  const tipe = document.getElementById("input-tipe").value;
  const kategori = document.getElementById("input-kategori").value;
  const keterangan = document.getElementById("input-keterangan").value.trim();
  const nominalVal = document.getElementById("input-nominal").value;

  if (!keterangan) {
    alert("Keterangan transaksi tidak boleh kosong!");
    document.getElementById("input-keterangan").focus();
    return;
  }

  const nominal = parseInt(nominalVal);
  if (isNaN(nominal) || nominal <= 0) {
    alert("Masukkan nominal yang valid dan lebih dari 0!");
    document.getElementById("input-nominal").focus();
    return;
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const tglDefault = `${yyyy}-${mm}-${dd}`;

  const dataBaru = {
    id: Date.now(),
    tanggal: tanggal || tglDefault,
    tipe,
    kategori,
    keterangan,
    nominal: nominal,
  };
  daftarTransaksi.push(dataBaru);
  localStorage.setItem("dataKeuangan", JSON.stringify(daftarTransaksi));

  alert("Transaksi berhasil disimpan!");
  window.location.href = "riwayat.html";
}

function hapusTransaksi(id) {
  if (confirm("Yakin mau hapus catatan ini?")) {
    daftarTransaksi = daftarTransaksi.filter((item) => item.id !== id);
    localStorage.setItem("dataKeuangan", JSON.stringify(daftarTransaksi));
    tampilkanTabel(); // Panggil fungsi tabel
    updateRingkasan(); // Update ringkasan jika ada di halaman
  }
}

function hitungSaldoDompet() {
  let totalMasuk = 0,
    totalKeluar = 0;
  daftarTransaksi.forEach((item) => {
    if (item.tipe === "pemasukan") totalMasuk += item.nominal;
    else totalKeluar += item.nominal;
  });
  return totalMasuk - totalKeluar - saldoTabungan;
}

// ==========================================
// 3. FUNGSI TAMPILAN (Dicek per halaman)
// ==========================================

// Fungsi untuk halaman index.html (Ringkasan)
function updateRingkasan() {
  if (document.getElementById("saldo-dompet")) {
    let totalKeluar = daftarTransaksi
      .filter((t) => t.tipe === "pengeluaran")
      .reduce((a, b) => a + b.nominal, 0);
    let sisaDompet = hitungSaldoDompet();

    document.getElementById("saldo-dompet").innerText = formatRp(sisaDompet);
    document.getElementById("saldo-dompet").className =
      sisaDompet < 0 ? "card-value text-red" : "card-value text-green";
    document.getElementById("saldo-tabungan").innerText =
      formatRp(saldoTabungan);
    document.getElementById("total-pengeluaran").innerText =
      formatRp(totalKeluar);

    let sisaBudget = budgetBulanan - totalKeluar;
    document.getElementById("budget-text").innerText =
      `${formatRp(totalKeluar)} / ${formatRp(budgetBulanan)}`;

    let sisaBudgetEl = document.getElementById("sisa-budget");
    let budgetBarEl = document.getElementById("budget-bar");

    if (budgetBulanan > 0) {
      let persen = (totalKeluar / budgetBulanan) * 100;
      budgetBarEl.style.width = Math.min(persen, 100) + "%";
      if (sisaBudget < 0) {
        sisaBudgetEl.innerText = "Overbudget! " + formatRp(sisaBudget);
        sisaBudgetEl.className = "card-value text-red";
        budgetBarEl.style.background = "#f87171";
      } else {
        sisaBudgetEl.innerText = "Sisa: " + formatRp(sisaBudget);
        sisaBudgetEl.className = "card-value text-green";
        budgetBarEl.style.background = persen > 80 ? "#fbbf24" : "#4ade80";
      }
    } else {
      sisaBudgetEl.innerText = "Belum diatur";
    }
  }
}

// Fungsi untuk halaman riwayat.html & index.html (Tabel)
function tampilkanTabel() {
  const tbody = document.getElementById("tabel-transaksi");
  if (tbody) {
    tbody.innerHTML = "";
    daftarTransaksi.sort((a, b) => {
      if (b.tanggal && a.tanggal && b.tanggal !== a.tanggal) {
        return b.tanggal.localeCompare(a.tanggal);
      }
      return (b.id || 0) - (a.id || 0);
    });

    if (daftarTransaksi.length === 0) {
      const trKosong = document.createElement("tr");
      trKosong.innerHTML = `
        <td colspan="5" class="text-center" style="color: #64748b; padding: 30px;">
          Belum ada riwayat transaksi. <a href="transaksi.html" style="color: #38bdf8; text-decoration: none;">Tambah transaksi baru</a>
        </td>
      `;
      tbody.appendChild(trKosong);
      return;
    }

    // Jika di dashboard index.html, tampilkan 5 transaksi terakhir saja agar rapi
    const isDashboard = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/");
    const dataDitampilkan = isDashboard ? daftarTransaksi.slice(0, 5) : daftarTransaksi;

    dataDitampilkan.forEach((item) => {
      const nominalFormat = formatRp(item.nominal);
      let classNominal =
        item.tipe === "pemasukan" ? "nominal-masuk" : "nominal-keluar";
      let tanda = item.tipe === "pemasukan" ? "+" : "-";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="color: #94a3b8; font-size: 13px;">${formatTanggalTampilan(item.tanggal)}</td>
        <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${item.kategori}</span></td>
        <td>${item.keterangan}</td>
        <td class="text-right ${classNominal}">${tanda} ${nominalFormat}</td>
        <td class="text-center"><button class="btn-hapus" onclick="hapusTransaksi(${item.id})">Hapus</button></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function resetData() {
  let yakin = confirm(
    "⚠️ PERINGATAN!\n\nApakah kamu yakin ingin menghapus SEMUA data?",
  );
  if (yakin) {
    localStorage.removeItem("dataKeuangan");
    localStorage.removeItem("budgetBulanan");
    localStorage.removeItem("saldoTabungan");
    location.reload();
  }
}

function updateBadgeTotal() {
  const badge = document.getElementById("badge-total-transaksi");
  if (badge) {
    badge.innerText = daftarTransaksi.length;
  }
}

function updateNamaPengguna() {
  const el = document.getElementById("nama-pengguna-teks");
  if (el) {
    const dataAkun = localStorage.getItem("akunPengguna");
    if (dataAkun) {
      try {
        const parsed = JSON.parse(dataAkun);
        if (parsed && parsed.username) {
          el.innerText = parsed.username.charAt(0).toUpperCase() + parsed.username.slice(1);
          return;
        }
      } catch (e) {}
    }
    el.innerText = "Sobat";
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (menu) {
    menu.classList.toggle("show");
  }
}

// Tutup mobile menu jika klik di luar navbar
document.addEventListener("click", (e) => {
  const navbar = document.querySelector(".devstudio-navbar");
  const menu = document.getElementById("mobile-menu");
  if (navbar && menu && !navbar.contains(e.target)) {
    menu.classList.remove("show");
  }
});

// Jalankan fungsi yang sesuai saat halaman dimuat
aturDefaultTanggal();
updateRingkasan();
tampilkanTabel();
updateBadgeTotal();
updateNamaPengguna();
