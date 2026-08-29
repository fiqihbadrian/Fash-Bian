# Fast Bian

Fast Bian adalah panel extension untuk Adobe After Effects yang menyediakan koleksi preset animasi siap pakai. Extension ini dimaksudkan untuk mempercepat alur kerja dengan mengurangi kebutuhan untuk membuat keyframe secara manual atau menulis ekspresi pada efek yang umum digunakan, seperti animasi teks, shape layer, pergerakan kamera, hingga penyesuaian speed graph.

Folder instalasi di macOS menggunakan nama `Fast_Bian` sesuai dengan konvensi CEP Adobe.

## Gambaran Umum

Fast Bian berjalan sebagai panel CEP (Common Extensibility Platform) di dalam After Effects. Antarmuka pengguna dibangun dengan HTML, CSS, dan JavaScript, sedangkan seluruh logika yang berinteraksi dengan After Effects dieksekusi melalui ExtendScript yang berada di sisi host. Komunikasi antara kedua sisi tersebut dilakukan melalui API `CSInterface.evalScript()`.

## Fitur

Panel Fast Bian terdiri dari empat bagian utama:

### 1. Tab Tools

Berisi preset animasi yang dikelompokkan ke dalam beberapa kategori:

- **Text Animation**: Preset animasi untuk layer teks, termasuk `fade`, `slide`, `pop`, `bounce`, `swing`, `shake`, `typewriter`, hingga preset yang lebih kompleks seperti `word-by-word`, `line-by-line`, dan `lyrics` untuk highlight teks karaoke. Setiap preset dapat membuat layer teks baru atau diterapkan pada layer yang sudah ada.

- **Animate Layer**: Kumpulan animasi serupa yang dapat diterapkan pada layer apa pun (shape, footage, atau null object). Tersedia tiga mode yaitu *Masuk* (animasi masuk), *Tengah* (animasi dari posisi saat ini), dan *Keluar* (animasi keluar). Setiap mode dapat dikombinasikan dengan pengatur durasi dan opsi loop.

- **Shape**: Sekumpulan preset untuk membuat shape layer secara instan, antara lain rectangle, square, circle, ellipse, triangle, pentagon, hexagon, star, dan diamond.

- **Camera**: Preset pergerakan kamera yang mencakup `push in`, `push out`, `truck left`, `truck right`, `pedestal up`, `pedestal down`, `orbit left`, `orbit right`, dan `roll`. Jika comp belum memiliki camera layer, preset akan membuatkannya secara otomatis dengan setelan 50mm.

- **Stabilizer**: Lima preset berbasis efek Warp Stabilizer VFX untuk penanganan footage goyang, yaitu `Smooth Motion`, `Lock Motion`, `Crop Less`, `Scale Stabilize`, dan `Roll Smoothing`.

- **Speed Graph**: Preset kurva easing yang dapat langsung diterapkan ke seluruh keyframe pada layer yang dipilih. Pilihan mencakup `Easy Ease`, `Smooth`, `Cinematic`, `Fast Out Slow In`, `Fast In Slow Out`, `Heavy Ease`, `Soft Ease`, `Linear`, `Overshoot`, `Bounce`, dan `Elastic`.

- **Undo / Redo**: Tombol untuk membatalkan dan mengulangi aksi. Shortcut `Ctrl/Cmd+Z` di dalam panel tidak selalu diteruskan ke After Effects, sehingga gunakan tombol ini untuk keandalan.

### 2. Tab Curve

Memungkinkan pengguna untuk membuat kurva bezier secara manual menggunakan mouse, kemudian menerapkannya ke keyframe yang dipilih. Preset dari Speed Graph juga dapat dimuat ulang untuk diterapkan sebagai kurva.

### 3. Tab AI Chat

Fitur obrolan dengan asisten AI yang dapat melihat konteks scene (nama comp, daftar layer, seleksi, dan keyframe yang ada). Pengguna dapat meminta tindakan seperti menambahkan rotation loop ke layer tertentu atau membuat animasi fade in selama beberapa detik. Fitur ini memerlukan API key yang disimpan pada file `client/js/apiKey.js`.

### Pengatur Tambahan

Pada preset animasi tertentu, tersedia slider **Amplitude** dengan rentang 0–100 untuk mengatur intensitas gerakan, serta opsi **Loop** untuk membuat animasi berulang secara otomatis.

## Persyaratan Sistem

- Sistem operasi macOS (pengujian pada Windows belum dilakukan, namun manifest bersifat lintas platform; path default pada `sync.sh` mengarah ke lokasi macOS)
- After Effects **2023** (versi 22.x) atau yang lebih baru
- CEP runtime telah terpasang secara otomatis bersama After Effects, tidak diperlukan instalasi tambahan

## Instalasi

### 1. Mengaktifkan Mode Debug untuk Ekstensi Belum Ditandatangani

Secara bawaan, After Effects hanya menjalankan ekstensi yang ditandatangani oleh Adobe. Karena Fast Bian belum ditandatangani, pengguna perlu mengaktifkan mode debug untuk ekstensi belum ditandatangani melalui Terminal:

```bash
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

Versi `11` merujuk pada After Effects 2023 dalam penomoran CSXS. Untuk After Effects 2024 gunakan `12`, untuk 2025 gunakan `13`, dan seterusnya. Setelah menjalankan perintah tersebut, keluar dari After Effects terlebih dahulu kemudian buka kembali aplikasi.

### 2. Menyalin Folder Ekstensi

Tersedia dua cara untuk menyalin folder ekstensi:

**Menggunakan skrip `sync.sh`**

Skrip ini akan menyalin isi repositori ke direktori CEP menggunakan `rsync`:

```bash
cd /path/ke/repo/aeo
chmod +x sync.sh
./sync.sh
```

**Menyalin secara manual**

```bash
mkdir -p ~/Library/Application\ Support/Adobe/CEP/extensions/
cp -R . ~/Library/Application\ Support/Adobe/CEP/extensions/Fast_Bian
```

Pastikan nama folder tujuan adalah `Fast_Bian` (dengan tanda garis bawah) sesuai dengan yang dirujuk oleh `sync.sh` dan konvensi CEP.

### 3. Membuka Panel di After Effects

1. Buka After Effects, kemudian buka sebuah proyek (atau buat proyek baru).
2. Pilih menu **Window > Extensions > Fast Bian**.
3. Panel akan muncul. Pemuatan pertama kali dapat memakan waktu beberapa detik karena proses inisialisasi CEF (Chromium Embedded Framework) yang digunakan oleh CEP.

Apabila menu **Fast Bian** tidak muncul, keluar dan buka kembali After Effects. Jika masih belum muncul, periksa kembali langkah 1 — biasanya mode debug belum diaktifkan atau nomor versi CSXS tidak sesuai.

## Penggunaan

Pastikan comp sedang aktif (terbuka dan dipilih di panel Timeline), kemudian klik salah satu preset pada panel. Beberapa preset akan membuat layer baru secara otomatis (seperti Shape dan Text Animation), sedangkan yang lain diterapkan pada layer yang sedang dipilih.

Untuk preset pada kategori **Animate**, **Stabilizer**, dan **Speed Graph**, pengguna perlu memilih layer terlebih dahulu sebelum mengeklik preset.

## Pengembangan

### Struktur Direktori

```
aeo/
├── CSXS/
│   └── manifest.xml          # Konfigurasi ekstensi (nama, versi, target AE, ukuran panel)
├── client/                   # Antarmuka panel (HTML/CSS/JS) — berjalan di CEF
│   ├── index.html
│   ├── css/
│   └── js/
│       ├── animationData.js  # Daftar preset animasi
│       ├── renderer.js       # Jembatan antara UI dan skrip host
│       ├── chat.js           # Logika AI chat
│       └── ...
├── host/
│   └── main.jsx              # ExtendScript — berjalan di dalam After Effects
├── icons/
│   └── icon.png
├── jsx/                      # Arsip versi-versi preset (.jsx) terdahulu
└── sync.sh                   # Skrip rsync dari repositori ke folder CEP
```

Penting untuk diperhatikan:

- Berkas pada `client/js/` berjalan dalam konteks UI (browser-like) dan **tidak** memiliki akses langsung ke objek After Effects.
- Berkas pada `host/main.jsx` berjalan sebagai ExtendScript di dalam After Effects dan menjadi satu-satunya tempat untuk mengakses `app.project`, layer, comp, dan sebagainya.
- Komunikasi dua arah dilakukan melalui `CSInterface.evalScript()` yang didefinisikan pada `client/js/renderer.js`.

### Konfigurasi API Key untuk AI Chat

Untuk mengaktifkan fitur AI Chat, buat berkas `client/js/apiKey.js` dengan isi sebagai berikut:

```js
window.FAST_BIAN_API_KEY = "sk-...";
window.FAST_BIAN_MODEL = "gpt-4o-mini";
```

Opsional, gunakan `window.FAST_BIAN_BASE_URL` apabila menggunakan endpoint proxy.

Berkas ini telah dimasukkan ke dalam `.gitignore` sehingga tidak akan terbawa ke riwayat commit. Setelah melakukan perubahan, tutup dan buka kembali panel agar konfigurasi terbaca ulang.

### Alur Kerja Pengembangan

1. Lakukan perubahan pada berkas di dalam repositori.
2. Jalankan `./sync.sh` untuk menyalin perubahan ke direktori CEP.
3. Muat ulang panel dengan menutup tab panel (klik kanan pada tab lalu **Close**), kemudian buka kembali melalui **Window > Extensions > Fast Bian**.

Alternatif lain adalah dengan menutup dan membuka kembali After Effects secara keseluruhan. Log debug untuk panel dan skrip host dapat dilihat pada `~/Library/Logs/CSXS/fastbian-debug.log`.

## Pemecahan Masalah

**Panel tidak muncul di Window > Extensions**
- Pastikan `PlayerDebugMode` telah diaktifkan untuk versi CSXS yang sesuai.
- Keluar dan buka kembali After Effects.
- Periksa apakah folder `Fast_Bian` tersedia pada `~/Library/Application Support/Adobe/CEP/extensions/`.

**Preset tidak menghasilkan efek saat diklik**
- Pastikan comp sedang aktif (bukan pada Project panel atau panel lainnya).
- Untuk preset **Animate**, **Stabilizer**, dan **Speed Graph**, pilih layer terlebih dahulu.
- Periksa `~/Library/Logs/CSXS/fastbian-debug.log` untuk melihat pesan kesalahan.

**Animasi Typewriter atau Word-by-word berjalan tetapi teks tidak terpotong**
- Hal ini biasanya terjadi karena evaluator ekspresi pada After Effects masih menggunakan cache. Tekan `Alt` (Windows) atau `Option` (macOS) sambil klik ikon stopwatch pada properti teks yang memiliki ekspresi untuk memaksa evaluasi ulang.

**CEP tidak dapat memuat Node.js**
- Manifest telah mengaktifkan opsi `--enable-nodejs` dan `--mixed-context`, namun pada After Effects versi lama (sebelum 2022) konfigurasi tambahan mungkin diperlukan.

## Catatan dan Keterbatasan

- Ekstensi ini belum ditandatangani oleh Adobe, sehingga memerlukan aktivasi mode debug secara manual.
- Pengujian pada sistem operasi Windows belum dilakukan. Skrip `sync.sh` secara bawaan mengarah ke lokasi instalasi pada macOS.
- Fitur AI Chat saat ini hanya mendukung satu penyedia API sesuai dengan konfigurasi pada `apiKey.js`. Antarmuka untuk mengganti model secara langsung belum tersedia.
- Beberapa preset pada Text Animation menggunakan ekspresi yang dapat berperilaku tidak terduga apabila teks diedit di tengah animasi.
- Setelah melakukan perubahan pada skrip host, perilaku CEP di After Effects 2023 tidak selalu memuat ulang panel secara otomatis. Disarankan untuk menutup panel dan membukanya kembali, atau memulai ulang After Effects.

Kontribusi dalam bentuk perbaikan bug atau penambahan preset sangat diharapkan melalui *pull request*.
