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

function gantiPassword() {
  let passwordTersimpan = localStorage.getItem("userPassword") || "alfianto";
  let passLama = prompt("Masukkan password lama kamu:");
  if (passLama !== passwordTersimpan) {
    alert("❌ Password lama salah!");
    return;
  }
  let passBaru = prompt("Masukkan password baru:");
  if (!passBaru || passBaru.trim() === "") {
    alert("❌ Password baru tidak boleh kosong!");
    return;
  }
  let konfirmasiPass = prompt("Ketik ulang password baru kamu:");
  if (passBaru !== konfirmasiPass) {
    alert("❌ Konfirmasi password tidak cocok!");
    return;
  }
  localStorage.setItem("userPassword", passBaru);
  alert(
    "✅ Password berhasil diubah! Gunakan password baru saat login berikutnya.",
  );
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
  if (!tahun || !bulan || !tgl) return tanggalStr;
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
    tampilkanData();
    alert("Batas pengeluaran bulan ini berhasil diatur!");
  }
}

function nabung() {
  let val = document.getElementById("add-goal").value;
  if (val && parseInt(val) > 0) {
    let nominalNabung = parseInt(val);
    let sisaDompetSaatIni = hitungSaldoDompet();
    if (nominalNabung > sisaDompetSaatIni) {
      alert("Uang di dompetmu tidak cukup untuk ditabung sebanyak itu!");
      return;
    }
    saldoTabungan += nominalNabung;
    localStorage.setItem("saldoTabungan", saldoTabungan);
    document.getElementById("add-goal").value = "";
    tampilkanData();
    alert(`Berhasil memindahkan ${formatRp(nominalNabung)} ke tabungan!`);
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

  const dataBaru = {
    id: Date.now(),
    tanggal: tanggal || new Date().toISOString().split("T")[0],
    tipe,
    kategori,
    keterangan,
    nominal: nominal,
  };
  daftarTransaksi.push(dataBaru);
  localStorage.setItem("dataKeuangan", JSON.stringify(daftarTransaksi));

  document.getElementById("input-keterangan").value = "";
  document.getElementById("input-nominal").value = "";
  aturDefaultTanggal();
  tampilkanData();
}

function hapusTransaksi(id) {
  if (confirm("Yakin mau hapus catatan ini?")) {
    daftarTransaksi = daftarTransaksi.filter((item) => item.id !== id);
    localStorage.setItem("dataKeuangan", JSON.stringify(daftarTransaksi));
    tampilkanData();
  }
}

function hitungSaldoDompet() {
  let totalMasuk = 0;
  let totalKeluar = 0;
  daftarTransaksi.forEach((item) => {
    if (item.tipe === "pemasukan") totalMasuk += item.nominal;
    else totalKeluar += item.nominal;
  });
  return totalMasuk - totalKeluar - saldoTabungan;
}

function tampilkanData() {
  const tbody = document.getElementById("tabel-transaksi");
  tbody.innerHTML = "";
  let totalKeluarUntukBudget = 0;

  // Urutkan berdasarkan tanggal terbaru, lalu id terbaru
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
        Belum ada riwayat transaksi. Tambahkan transaksi barumu di atas!
      </td>
    `;
    tbody.appendChild(trKosong);
  } else {
    daftarTransaksi.forEach((item) => {
      const nominalFormat = formatRp(item.nominal);
      let classNominal =
        item.tipe === "pemasukan" ? "nominal-masuk" : "nominal-keluar";
      let tanda = item.tipe === "pemasukan" ? "+" : "-";

      if (item.tipe === "pengeluaran") totalKeluarUntukBudget += item.nominal;

      const tr = document.createElement("tr");
      const tglTampil = formatTanggalTampilan(item.tanggal);
      tr.innerHTML = `
              <td style="color: #94a3b8; font-size: 13px;">${tglTampil}</td>
              <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${item.kategori}</span></td>
              <td>${item.keterangan}</td>
              <td class="text-right ${classNominal}">${tanda} ${nominalFormat}</td>
              <td class="text-center"><button class="btn-hapus" onclick="hapusTransaksi(${item.id})">Hapus</button></td>
          `;
      tbody.appendChild(tr);
    });
  }

  let sisaDompet = hitungSaldoDompet();
  const dompetEl = document.getElementById("saldo-dompet");
  dompetEl.innerText = formatRp(sisaDompet);
  dompetEl.className =
    sisaDompet < 0 ? "card-value text-red" : "card-value text-green";

  document.getElementById("saldo-tabungan").innerText = formatRp(saldoTabungan);
  document.getElementById("total-pengeluaran").innerText = formatRp(
    totalKeluarUntukBudget,
  );

  let sisaBudget = budgetBulanan - totalKeluarUntukBudget;
  document.getElementById("budget-text").innerText =
    `${formatRp(totalKeluarUntukBudget)} / ${formatRp(budgetBulanan)}`;

  const sisaBudgetEl = document.getElementById("sisa-budget");
  const budgetBarEl = document.getElementById("budget-bar");

  if (budgetBulanan > 0) {
    let persen = (totalKeluarUntukBudget / budgetBulanan) * 100;
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
    sisaBudgetEl.className = "card-value text-small";
    budgetBarEl.style.width = "0%";
  }
}

function resetData() {
  let yakin = confirm(
    "⚠️ PERINGATAN!\n\nApakah kamu yakin ingin menghapus SEMUA data transaksi, tabungan, dan anggaran?\nTindakan ini tidak bisa dibatalkan.",
  );
  if (yakin) {
    localStorage.removeItem("dataKeuangan");
    localStorage.removeItem("budgetBulanan");
    localStorage.removeItem("saldoTabungan");
    daftarTransaksi = [];
    budgetBulanan = 0;
    saldoTabungan = 0;
    tampilkanData();
    alert("✅ Data berhasil dihapus! Kamu siap mulai dari awal lagi.");
  }
}

aturDefaultTanggal();
tampilkanData();
