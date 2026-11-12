
// ===== DATA KERANJANG DAN LOGIN =====

let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let menuDibuka = null;
let menuTujuan = null;

// Reset login saat website dimuat ulang
localStorage.removeItem("masuk");

// ===== FUNGSI BANTUAN =====

function ambil(id) {
    return document.getElementById(id);
}

function cariKartu(id) {
    return document.querySelector(
        '.kartu[data-id="' + id + '"]'
    );
}

function rupiah(angka) {
    return "Rp" + Number(angka).toLocaleString("id-ID");
}

function sudahMasuk() {
    return localStorage.getItem("masuk") === "ya";
}

// ===== PENCARIAN DAN FILTER =====

ambil("input-cari").addEventListener("input", function () {
    if (location.hash !== "#/") {
        location.hash = "#/";
    }

    tampilkanKatalog();
});

ambil("form-cari").addEventListener("submit", function (e) {
    e.preventDefault();
    tampilkanKatalog();
});

function tampilkanKatalog() {
    const pilihan = document.querySelector(
        'input[name="kategori"]:checked'
    );

    const kategori = pilihan ? pilihan.value : "semua";

    const kata = ambil("input-cari").value
        .trim()
        .toLowerCase();

    document.querySelectorAll(".kartu").forEach(function (kartu) {
        const cocokKategori =
            kategori === "semua" ||
            kartu.dataset.kategori === kategori;

        const cocokKata =
            kartu.textContent.toLowerCase().includes(kata);

        kartu.hidden = !(cocokKategori && cocokKata);
    });
}

ambil("halaman-katalog").addEventListener(
    "change",
    tampilkanKatalog
);

// ===== LOGIN =====

const USERNAME = "kira";
const PASSWORD = "1234";

ambil("form-login").addEventListener("submit", function (e) {
    e.preventDefault();

    const benar =
        ambil("isian-username").value.trim().toLowerCase()
            === USERNAME &&
        ambil("isian-password").value === PASSWORD;

    ambil("login-salah").hidden = benar;

    if (!benar) return;

    localStorage.setItem("masuk", "ya");

    this.reset();

    // Kembali ke halaman yang ingin dibuka sebelumnya
    const tujuan = menuTujuan || "#/";

    menuTujuan = null;

    location.hash = tujuan;
});

// ===== DETAIL PRODUK =====

function tampilkanDetail(id) {
    menuDibuka = cariKartu(id);

    if (!menuDibuka) {
        ambil("isi-detail").hidden = true;
        ambil("detail-tidak-ada").hidden = false;
        return;
    }

    ambil("detail-tidak-ada").hidden = true;
    ambil("isi-detail").hidden = false;

    ambil("detail-gambar").src =
        menuDibuka.querySelector(".foto").src;

    ambil("detail-nama").textContent =
        menuDibuka.dataset.nama;

    ambil("detail-deskripsi").textContent =
        menuDibuka.dataset.deskripsi;

    ambil("isian-jumlah").value = 1;

    hitungKasir();
}

// ===== PERHITUNGAN TOTAL HARGA DETAIL =====

function hitungKasir() {
    if (!menuDibuka) return;

    const kolom = ambil("isian-jumlah");

    const jumlah = Math.max(
        1,
        Math.floor(Number(kolom.value)) || 1
    );

    kolom.value = jumlah;

    const harga = Number(menuDibuka.dataset.harga);

    const subtotal = harga * jumlah;

    ambil("kasir-nama").textContent =
        menuDibuka.dataset.nama;

    ambil("kasir-harga").textContent =
        rupiah(harga);

    // Tampilkan total di semua bagian detail
    document.querySelectorAll(".total-teks").forEach(
        function (elemen) {
            elemen.textContent = rupiah(subtotal);
        }
    );

    ambil("tombol-kurang").disabled = jumlah <= 1;
}

// Tombol kurang
ambil("tombol-kurang").addEventListener("click", function () {
    const kolom = ambil("isian-jumlah");

    kolom.value = Math.max(
        1,
        Number(kolom.value) - 1
    );

    hitungKasir();
});

// Tombol tambah
ambil("tombol-tambah").addEventListener("click", function () {
    const kolom = ambil("isian-jumlah");

    kolom.value = Number(kolom.value || 0) + 1;

    hitungKasir();
});

// Input jumlah manual
ambil("isian-jumlah").addEventListener(
    "input",
    hitungKasir
);

// ===== SISTEM KERANJANG =====

function jumlahBarang() {
    return keranjang.reduce(function (total, item) {
        return total + item.jumlah;
    }, 0);
}

function totalHarga() {
    return keranjang.reduce(function (total, item) {
        return total + item.harga * item.jumlah;
    }, 0);
}

function simpanKeranjang() {
    localStorage.setItem(
        "keranjang",
        JSON.stringify(keranjang)
    );

    ambil("lencana-keranjang").textContent =
        jumlahBarang();
}

// Tambah produk ke keranjang
function masukKeranjang(tambah) {
    if (!menuDibuka) return;

    const id = Number(menuDibuka.dataset.id);

    const jumlah = Math.max(
        1,
        Math.floor(Number(ambil("isian-jumlah").value)) || 1
    );

    const item = keranjang.find(function (i) {
        return i.id === id;
    });

    if (item) {
        item.jumlah = tambah
            ? item.jumlah + jumlah
            : jumlah;
    } else {
        keranjang.push({
            id: id,
            jumlah: jumlah,
            harga: Number(menuDibuka.dataset.harga)
        });
    }

    simpanKeranjang();
}

// Tombol tambah keranjang
ambil("tombol-keranjang").addEventListener("click", function () {
    masukKeranjang(true);
}); 

// Tombol pesan sekarang
ambil("tombol-pesan").addEventListener("click", function () {
    masukKeranjang(false);

    location.hash = "#/checkout";
});

// ===== MENAMPILKAN BARANG =====

function isiBaris(wadah, daftar) {
    wadah.replaceChildren();

    daftar.forEach(function (item) {
        const menu = cariKartu(item.id);

        if (!menu) return;

        const baris = ambil("templat-baris")
            .content.cloneNode(true);

        baris.querySelector(".baris-keranjang")
            .dataset.id = item.id;

        baris.querySelector(".foto").src =
            menu.querySelector(".foto").src;

        baris.querySelector(".baris-info a").textContent =
            menu.dataset.nama;

        baris.querySelector(".baris-info a").href =
            "#/detail/" + item.id;

        baris.querySelector(".baris-info p").textContent =
            rupiah(item.harga);

        baris.querySelector(".jumlah").textContent =
            item.jumlah;

        baris.querySelector(
            '[data-aksi="kurang"]'
        ).disabled = item.jumlah <= 1;

        baris.querySelector(".baris-subtotal").textContent =
            rupiah(item.harga * item.jumlah);

        wadah.append(baris);
    });
}

// ===== TAMPILAN KERANJANG =====

function tampilkanKeranjang() {
    const kosong = keranjang.length === 0;

    ambil("keranjang-kosong").hidden = !kosong;
    ambil("keranjang-isi").hidden = kosong;

    isiBaris(
        ambil("daftar-keranjang"),
        keranjang
    );

    ambil("keranjang-jumlah").textContent =
        jumlahBarang();

    ambil("keranjang-subtotal").textContent =
        rupiah(totalHarga());
}

// Tombol tambah, kurang, hapus keranjang
ambil("daftar-keranjang").addEventListener("click", function (e) {
    const tombol = e.target.closest("[data-aksi]");

    if (!tombol) return;

    const aksi = tombol.dataset.aksi;

    const id = Number(
        tombol.closest("[data-id]").dataset.id
    );

    const item = keranjang.find(function (i) {
        return i.id === id;
    });

    if (!item) return;

    if (aksi === "kurang") {
        item.jumlah--;
    }

    if (aksi === "tambah") {
        item.jumlah++;
    }

    if (aksi === "hapus") {
        keranjang = keranjang.filter(function (i) {
            return i.id !== id;
        });
    }

    simpanKeranjang();
    tampilkanKeranjang();
});

// ===== CHECKOUT =====

function tampilkanCheckout() {
    isiBaris(
        ambil("ringkasan-checkout"),
        keranjang
    );

    ambil("checkout-total").textContent =
        rupiah(totalHarga());
}

// Buat pesanan
ambil("form-checkout").addEventListener("submit", function (e) {
    e.preventDefault();

    if (keranjang.length === 0) {
        location.hash = "#/keranjang";
        return;
    }

    const pesanan = {
        nama: ambil("isian-nama").value.trim(),
        alamat: ambil("isian-alamat").value.trim(),
        kota: ambil("isian-kota").value.trim(),
        pembayaran: ambil("isian-pembayaran").value,
        catatan: ambil("isian-catatan").value.trim(),
        barang: JSON.parse(JSON.stringify(keranjang)),
        total: totalHarga()
    };

    localStorage.setItem(
        "pesananTerakhir",
        JSON.stringify(pesanan)
    );

    keranjang = [];

    simpanKeranjang();

    this.reset();

    location.hash = "#/sukses";
});

// ===== KONFIRMASI PESANAN =====

function tampilkanSukses() {
    const pesanan = JSON.parse(
        localStorage.getItem("pesananTerakhir")
    );

    ambil("isi-sukses").hidden = !pesanan;
    ambil("sukses-tidak-ada").hidden = Boolean(pesanan);

    if (!pesanan) return;

    ambil("sukses-pemesan").textContent =
        "Terima kasih, " + pesanan.nama +
        ". Pesananmu sedang diproses.";

    isiBaris(
        ambil("sukses-daftar"),
        pesanan.barang
    );

    ambil("sukses-total").textContent =
        rupiah(pesanan.total);
}

// ===== NAVIGASI HALAMAN =====

function aturHalaman() {
    const hash = location.hash || "#/";

    let halaman = "katalog";
    let idProduk = null;

    // Tentukan halaman tujuan
    if (hash === "#/login") {
        halaman = "login";
    } else if (hash === "#/keranjang") {
        halaman = "keranjang";
    } else if (hash === "#/checkout") {
        halaman = "checkout";
    } else if (hash === "#/sukses") {
        halaman = "sukses";
    } else {
        const cocok = hash.match(/^#\/detail\/(\d+)$/);

        if (cocok) {
            halaman = "detail";
            idProduk = cocok[1];
        }
    }

    // Cegah checkout kosong
    if (halaman === "checkout" && keranjang.length === 0) {
        location.hash = "#/keranjang";
        return;
    }

    // Login wajib untuk melakukan pemesanan
    if (
        halaman !== "katalog" &&
        halaman !== "login" &&
        !sudahMasuk()
    ) {
        menuTujuan = hash;
        location.hash = "#/login";
        return;
    }

    // Jika sudah login, tidak perlu membuka halaman login lagi
    if (halaman === "login" && sudahMasuk()) {
        location.hash = menuTujuan || "#/";
        menuTujuan = null;
        return;
    }

    // Sembunyikan seluruh halaman terlebih dahulu
    const semuaHalaman = [
        "halaman-katalog",
        "halaman-login",
        "halaman-detail",
        "halaman-keranjang",
        "halaman-checkout",
        "halaman-sukses"
    ];

    semuaHalaman.forEach(function (id) {
        ambil(id).hidden = true;
    });

    // Tampilkan halaman yang dipilih
    const halamanAktif = {
        katalog: "halaman-katalog",
        login: "halaman-login",
        detail: "halaman-detail",
        keranjang: "halaman-keranjang",
        checkout: "halaman-checkout",
        sukses: "halaman-sukses"
    };

    ambil(halamanAktif[halaman]).hidden = false;

    // Status login untuk header
    document.documentElement.classList.toggle(
        "sudah-masuk",
        sudahMasuk()
    );

    document.body.dataset.halaman = halaman;

    // Jalankan fungsi sesuai halaman
    if (halaman === "katalog") {
        tampilkanKatalog();
    }

    if (halaman === "login") {
        ambil("login-salah").hidden = true;
    }

    if (halaman === "detail") {
        tampilkanDetail(idProduk);
    }

    if (halaman === "keranjang") {
        tampilkanKeranjang();
    }

    if (halaman === "checkout") {
        tampilkanCheckout();
    }

    if (halaman === "sukses") {
        tampilkanSukses();
    }

    window.scrollTo(0, 0);
}

// ===== LOGOUT =====

ambil("tombol-keluar").addEventListener("click", function () {
    localStorage.removeItem("masuk");

    menuTujuan = null;

    location.hash = "#/";

    aturHalaman();
});

// ===== MULAI WEBSITE =====

window.addEventListener("hashchange", aturHalaman);

simpanKeranjang();

aturHalaman();
