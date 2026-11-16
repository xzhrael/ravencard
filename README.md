# RavenCard (レーベンカード) - Flashcard & Kuis Bahasa Jepang (PWA)

Aplikasi web flashcard dan kuis interaktif untuk mempelajari **Hiragana**, **Katakana**, **Kanji (N5–N3)**, dan **Kotoba/Kosakata (N5–N3)** bahasa Jepang. Dirancang dengan pendekatan *Mobile-First*, tema gelap OLED hemat daya, audio pelafalan asli tanpa internet, serta kapabilitas **Progressive Web App (PWA)** sehingga dapat dipasang layaknya aplikasi native di Android.

---

## ✨ Fitur Utama

1. **Dataset Komprehensif Bahasa Jepang (3.837 Entri)**:
   * **Hiragana**: 104 karakter (Seion, Dakuon, Handakuon, Yoon/Kombinasi).
   * **Katakana**: 104 karakter (Seion, Dakuon, Handakuon, Yoon/Kombinasi).
   * **Kanji (N5, N4, N3)**: 645 kanji lengkap (103 N5, 181 N4, 361 N3) terstruktur dengan Onyomi, Kunyomi, jumlah coretan, arti bahasa Indonesia, dan contoh kata majemuk (*jukugo*).
   * **Kotoba (N5, N4, N3)**: 2.984 kosakata komprehensif (678 N5, 636 N4, 1.670 N3) mencakup kata benda, kata kerja gol. I/II/III, kata sifat -i/-na, kata keterangan, partikel, dan contoh kalimat.
2. **Desain Modern Minimalis & Multi-Halaman**:
   * **Floating Bottom Navigation**: Bilah navigasi melayang untuk berpindah mulus antara halaman **Belajar**, **Kuis**, dan **Kamus**.
   * **Floating Category & Sub-Filter Pills**: Navigasi pil melayang responsif untuk memfilter kategori dan tingkat JLPT N5–N3 seketika.
   * **Progressive Chunk Rendering**: Render kamus dengan mekanisme *lazy infinite-scroll* 60 item per batch agar peramban ponsel tetap ringan dan mulus 60 FPS saat memuat ribuan kata.
   * **3D Flip Flashcard**: Animasi kartu 3D berkecepatan tinggi dengan gestur sentuh swipe di HP Android.
   * **Mode Kuis Pilihan Ganda**: Uji pemahaman dengan kuis 4 opsi otomatis, pelafalan audio, dan kalkulasi skor akhir.
   * **Audio Native (Web Speech API)**: Pelafalan bahasa Jepang asli (*ja-JP*) langsung berbunyi tanpa membutuhkan file audio eksternal.
   * **Spaced Repetition System (SRS)**: Penilaian 3 tingkat (*Ulangi*, *Ragu*, *Hafal*) dengan penyimpanan persisten di `localStorage`.
3. **100% Offline-Ready & PWA Android**:
   * Seluruh 3.837 aset dan dataset tersimpan di cache lokal perangkat melalui Service Worker (Cache v6).
   * Tidak memerlukan instalasi compiler/bundler berat; berjalan langsung di browser modern.

---

## 📱 Panduan Memasang di Smartphone Android

Website ini mengadopsi standar Progressive Web App (PWA) yang terdaftar pada sistem Android melalui *WebAPK*:

### Metode 1: Menggunakan Tombol Instal di Aplikasi
1. Buka website RavenCard melalui browser **Google Chrome** di smartphone Android.
2. Ketuk tombol **"Instal"** yang muncul di bilah atas aplikasi (atau pada banner bawah yang otomatis muncul).
3. Pilih **Instal**.
4. Ikon RavenCard akan otomatis ditambahkan ke Layar Utama (*Home Screen*) dan menu aplikasi ponsel Anda.

### Metode 2: Melalui Menu Browser Chrome
1. Buka website di browser **Google Chrome** Android.
2. Ketuk ikon menu titik tiga (**⋮**) di pojok kanan atas browser.
3. Pilih opsi **"Instal aplikasi"** (atau **"Tambahkan ke Layar Utama" / "Add to Home screen"**).
4. Konfirmasi dengan memilih **Instal**.

### Keunggulan Setelah Terpasang di Android:
* Tampil *fullscreen* tanpa bilah alamat (*address bar*) browser.
* Berjalan mulus secara instan dari layar beranda.
* Dapat digunakan sepenuhnya dalam kondisi **mode pesawat (offline)** tanpa koneksi internet.

---

## 🚀 Cara Menjalankan Secara Lokal

RavenCard dibangun dengan standar web modern berbasis *native ES Modules*. Anda dapat menjalankannya menggunakan static web server ringan:

### Menggunakan Python 3:
```bash
python3 -m http.server 8080
```
Buka browser di `http://localhost:8080` (atau `http://<IP-Lokal-Anda>:8080` dari HP Android yang berada di jaringan Wi-Fi yang sama).

### Menggunakan Node.js (npx serve):
```bash
npx serve .
```

### Menggunakan VS Code:
Klik kanan pada file `index.html` dan pilih **"Open with Live Server"**.

---

## ⌨️ Pintasan Keyboard (Mode Desktop)

* <kbd>Spasi</kbd> : Membalik kartu flashcard
* <kbd>→</kbd> : Kartu berikutnya
* <kbd>←</kbd> : Kartu sebelumnya
* <kbd>1</kbd> : Menandai *Belum Hafal* (Ulangi)
* <kbd>2</kbd> : Menandai *Ragu-ragu*
* <kbd>3</kbd> : Menandai *Sudah Hafal*
* <kbd>A</kbd> : Memutar audio pelafalan bahasa Jepang
* <kbd>S</kbd> : Mengacak urutan kartu

---

## 📁 Struktur Direktori Proyek

```text
ravencard/
├── index.html            # Antarmuka semantik aplikasi (App Shell)
├── manifest.json         # Konfigurasi PWA Web App Manifest Android WebAPK
├── sw.js                 # Service Worker strategi Offline-First (Cache v6)
├── README.md             # Dokumentasi teknis & panduan instalasi
├── css/
│   └── style.css         # Styling modern responsif, OLED Dark Mode, & efek 3D
├── js/
│   ├── app.js            # Entry point aplikasi, state management, & event handlers
│   ├── data-service.js   # Modul pemuatan data asinkron & in-memory cache
│   ├── audio.js          # Modul Text-to-Speech Web Speech API (ja-JP)
│   ├── storage.js        # Modul persistensi hafalan SRS di localStorage
│   ├── quiz.js           # Engine mode kuis pilihan ganda 4 opsi & skor
│   └── pwa.js            # Manajer daftaran PWA & event install Android
├── data/
│   ├── hiragana.json     # Dataset karakter Hiragana (104 entri)
│   ├── katakana.json     # Dataset karakter Katakana (104 entri)
│   ├── kanji-n5.json     # Dataset Kanji JLPT N5 (103 entri)
│   ├── kanji-n4.json     # Dataset Kanji JLPT N4 (181 entri)
│   ├── kanji-n3.json     # Dataset Kanji JLPT N3 (361 entri)
│   ├── kotoba-n5.json    # Dataset Kosakata JLPT N5 (678 entri)
│   ├── kotoba-n4.json    # Dataset Kosakata JLPT N4 (636 entri)
│   └── kotoba-n3.json    # Dataset Kosakata JLPT N3 (1.670 entri)
└── assets/
    └── icons/            # Ikon aplikasi resolusi tinggi (192px, 512px, maskable)
```
