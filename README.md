# RavenCard (レーベンカード) - Flashcard & Kuis Bahasa Jepang (PWA)

Aplikasi web flashcard dan kuis interaktif untuk mempelajari **Hiragana**, **Katakana**, **Kanji (N5-N3)**, dan **Kotoba (N5-N3)** bahasa Jepang. Dirancang dengan pendekatan *mobile-first*, palet warna Material Design 3 Expressive, audio pelafalan, serta kapabilitas Progressive Web App (PWA) untuk dipasang di Android.

---

## Fitur Utama

1. **Dataset Bahasa Jepang (3.837 Entri)**:
   * **Hiragana**: 104 karakter (Seion, Dakuon, Handakuon, Yoon/Kombinasi).
   * **Katakana**: 104 karakter (Seion, Dakuon, Handakuon, Yoon/Kombinasi).
   * **Kanji (N5, N4, N3)**: 645 kanji terstruktur dengan Onyomi, Kunyomi, jumlah coretan, arti bahasa Indonesia, dan contoh kata majemuk (*jukugo*).
   * **Kotoba (N5, N4, N3)**: 2.984 kosakata mencakup kata benda, kata kerja, kata sifat, kata keterangan, partikel, dan contoh kalimat.
2. **Antarmuka & Pengalaman Pengguna**:
   * **Floating Bottom Navigation**: Navigasi dok melayang untuk berpindah antara halaman **Belajar**, **Kuis**, dan **Kamus**.
   * **Deck Selector Bottom Sheet**: Pemilih kategori dan level materi melalui sheet modal ringkas.
   * **Progressive Chunk Rendering**: Render kamus dengan mekanisme pemuatan bertahap 60 item per batch agar peramban tetap responsif.
   * **3D Flip Flashcard**: Animasi kartu 3D dengan dukungan gestur geser (swipe) di ponsel.
   * **Mode Kuis**: Uji pemahaman dengan kuis 4 opsi otomatis, pelafalan audio, dan rangkuman skor.
   * **Audio Pelafalan**: Pelafalan bahasa Jepang (*ja-JP*) menggunakan sintesis suara peramban atau aliran audio online fallback.
   * **Status Hafalan (SRS)**: Penilaian 3 tingkat (*Ulangi*, *Ragu*, *Hafal*) tersimpan secara persisten di `localStorage`.
3. **Dukungan Offline & PWA Android**:
   * Aset dan dataset tersimpan di cache lokal perangkat melalui Service Worker.
   * Dapat dijalankan langsung di peramban modern tanpa proses kompilasi tambahan.

---

## Panduan Memasang di Android

RavenCard mengadopsi standar Progressive Web App (PWA) yang dapat dipasang ke layar utama Android:

### Metode 1: Tombol Instal di Aplikasi
1. Buka RavenCard melalui browser Google Chrome di ponsel Android.
2. Ketuk tombol **Instal** yang muncul di bilah atas aplikasi (atau pada banner bawah).
3. Konfirmasi dengan memilih **Instal**.
4. Ikon RavenCard akan ditambahkan ke layar utama ponsel.

### Metode 2: Menu Browser Chrome
1. Buka RavenCard di browser Google Chrome Android.
2. Ketuk ikon menu titik tiga (**⋮**) di pojok kanan atas browser.
3. Pilih opsi **Instal aplikasi** atau **Tambahkan ke layar utama**.
4. Konfirmasi dengan memilih **Instal**.

---

## Cara Menjalankan Secara Lokal

RavenCard dibangun dengan standar web modern berbasis *native ES Modules*. Jalankan menggunakan web server statis:

### Menggunakan Python 3:
```bash
python3 -m http.server 8080
```
Buka browser di `http://localhost:8080`.

### Menggunakan Node.js (npx serve):
```bash
npx serve .
```

---

## Pintasan Keyboard (Desktop)

* <kbd>Spasi</kbd> : Membalik kartu flashcard
* <kbd>→</kbd> : Kartu berikutnya
* <kbd>←</kbd> : Kartu sebelumnya
* <kbd>1</kbd> : Menandai *Ulangi*
* <kbd>2</kbd> : Menandai *Ragu*
* <kbd>3</kbd> : Menandai *Hafal*
* <kbd>A</kbd> : Memutar audio pelafalan
* <kbd>S</kbd> : Mengacak urutan kartu

---

## Struktur Direktori Proyek

```text
ravencard/
├── index.html            # Antarmuka semantik aplikasi (App Shell)
├── manifest.json         # Konfigurasi PWA Web App Manifest
├── sw.js                 # Service Worker strategi Offline-First
├── README.md             # Dokumentasi teknis & panduan instalasi
├── css/
│   └── style.css         # Desain sistem MD3 Expressive
├── js/
│   ├── app.js            # Entry point aplikasi, state management, & event handlers
│   ├── data-service.js   # Modul pemuatan data asinkron & in-memory cache
│   ├── audio.js          # Modul Text-to-Speech Web Speech API & fallback
│   ├── storage.js        # Modul persistensi hafalan di localStorage
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
    └── icons/            # Ikon aplikasi (192px, 512px, maskable)
```
