# SKILL: Fast Bian Extension Development

## Tujuan
Panduan ini untuk membantu agent AI bekerja lebih efektif pada project Fast Bian, terutama saat menangani error runtime seperti `null is not defined` atau masalah saat extension dijalankan di Adobe After Effects.

## Ringkasan Project
Project ini adalah extension Adobe After Effects berbentuk panel UI. Struktur utamanya:
- UI panel berada di folder `client/`
- Script host ExtendScript berada di folder `host/`
- Manifest extension ada di `CSXS/manifest.xml`

## Arsitektur Utama
- `client/index.html` : halaman panel UI
- `client/js/main.js` : bootstrap panel, inisialisasi tab, search, settings
- `client/js/renderer.js` : menangani klik card, menampilkan settings, memanggil host script lewat `evalScript`
- `client/js/animationData.js` : daftar preset animasi
- `host/main.jsx` : implementasi aksi yang dijalankan di After Effects
- `CSXS/manifest.xml` : konfigurasi extension untuk AE

## Prinsip Kerja yang Penting
1. Selalu cek konteks eksekusi:
   - File di `client/js/` berjalan di panel UI/browser-like context
   - File di `host/` berjalan di ExtendScript / After Effects
2. Jangan menganggap elemen DOM selalu ada.
3. Jangan mengakses property AE tanpa cek null / validasi.
4. Prioritaskan fix kecil dan aman, jangan rewrite besar-besaran.
5. Pastikan perubahan tetap kompatibel dengan AE dan CSXS versi yang digunakan.

## Masalah Umum: `null is not defined`
Error ini biasanya muncul karena salah satu hal berikut:
- Elemen DOM tidak ditemukan, misalnya `document.getElementById(...)` mengembalikan `null`
- Layer/property di After Effects tidak ditemukan
- `app.project` atau `app.project.activeItem` belum tersedia
- `CSInterface` / `evalScript` tidak tersedia atau gagal

## Pola Safe yang Disarankan
### Saat bekerja dengan DOM di client JS
```js
var el = document.getElementById('searchInput');
if (el) {
  el.addEventListener('input', function () {
    // logic
  });
}
```

### Saat bekerja dengan After Effects
```jsx
if (!app.project) return 'ERR: No project opened.';

var comp = app.project.activeItem;
if (!comp || !(comp instanceof CompItem)) {
  return 'ERR: No active composition.';
}
```

### Saat memanggil host script dari UI
```js
var el = document.getElementById('accordionContainer');
if (!el) return;
```

## Alur Debug yang Disarankan
1. Reproduce error terlebih dahulu.
2. Cek console log / error message.
3. Identifikasi apakah masalah ada di UI (`client/js`) atau host script (`host/main.jsx`).
4. Tambahkan guard cek null sebelum akses.
5. Verifikasi ulang setelah perubahan.

## Ketika Menambah Fitur Baru
- Jika fitur UI baru: periksa `client/index.html`, `client/js/main.js`, dan `client/js/renderer.js`
- Jika fitur memanggil AE action: tambahkan fungsi di `host/main.jsx`
- Jika fitur butuh preset/daftar item: tambahkan ke data di `client/js/animationData.js`
- Jika fitur perlu komunikasi UI ke AE: pastikan `Renderer.run()` tetap dipakai dengan benar

## Tips Khusus untuk Project Ini
- Project ini sangat bergantung pada eksekusi panel UI + ExtendScript.
- Jangan mengasumsikan semua elemen HTML selalu ada saat panel pertama kali dimuat.
- Saat debug, cek dulu apakah error berasal dari:
  - DOM belum siap
  - elemen tidak ada di HTML
  - property tidak ada di AE
  - script host tidak dipanggil karena `evalScript` gagal

## Default Behavior Agent Saat Membantu
- Jelaskan akar masalah sebelum mengubah kode.
- Berikan patch minimal yang aman.
- Selalu jelaskan langkah verifikasi setelah perbaikan.
- Jika error terkait extension AE, prioritaskan pengecekan null/guard dan konteks eksekusi.
