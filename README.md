# Undangan Digital Minangkabau

Website statis mobile-first. Tanpa dependency, RSVP, atau buku tamu.

## Jalankan

Dari folder proyek, jalankan `python3 -m http.server 8080`, lalu buka http://localhost:8080.
Bisa juga membuka index.html langsung; server lokal disarankan untuk clipboard dan audio.
Upload seluruh isi folder ini ke hosting statis; tidak perlu build.

## Ganti konten dari SATU file

Edit **invitation-data.js**. Semua nama, teks, tanggal, lokasi, rekening, foto, musik, dan nama tamu fallback ada di sana. Data saat ini hanya contoh dan harus diganti sebelum dibagikan. Alamat, peta, dan rekening contoh tidak untuk transaksi.

- Ganti foto di assets/photos dengan JPG/WebP milik Anda, lalu ubah path di konfigurasi. Rekomendasi: foto potret 800–1200px, WebP di bawah 200KB. Placeholder SVG lokal disediakan, bukan foto dari screenshot.
- Ganti musik di assets/music dan ubah music.src; gunakan musik yang Anda punya izin pakainya. melody.wav adalah melodi demo asli yang dibuat untuk proyek ini. Set music.enabled ke false untuk menonaktifkan.
- Tanggal menggunakan ISO dengan zona waktu, misalnya 2026-12-20T09:00:00+07:00. Sesuaikan timezone dan timeLabel jika memakai WITA/WIT. Awal dan akhir acara juga dipakai oleh Google Calendar dan file .ics untuk Apple/Outlook.
- Ganti events[].mapUrl dengan URL Google Maps lokasi sebenarnya.
- Tambahkan/hapus item pada profiles, events, accounts, gallery sesuai kebutuhan.
- Nama tamu via `?to=Yogi%20dan%20Ratna`. Contoh http://localhost:8080/?to=Yogi%20dan%20Ratna. Parameter ditampilkan sebagai teks, bukan HTML.

## Struktur

index.html — struktur semantik
styles.css — palet, layout, responsive, motion
app.js — rendering, countdown, kalender, clipboard, lightbox, musik
invitation-data.js — satu sumber seluruh konten
assets/decor — motif songket, rumah gadang, bunga SVG sederhana asli
assets/photos — placeholder lokal yang dapat diganti
assets/music — melodi demo lokal

## Perilaku

Buka Undangan menampilkan isi, menggulir ke salam, dan memutar musik setelah interaksi. Tombol melayang dapat menjeda/memutar musik. Jika browser menolak audio, tamu mendapat pemberitahuan dan dapat mencoba kembali. Galeri mendukung Escape, panah kiri/kanan, tombol navigasi, dan focus modal bawaan browser. Clipboard memakai fallback salin bila Clipboard API tidak tersedia. Countdown berhenti di nol dan menampilkan pesan hari acara. Motion mengikuti prefers-reduced-motion. Semua layar menampilkan satu kolom vertikal seperti ponsel, maksimal 480px dan berada di tengah layar komputer.

Aset dekorasi merupakan SVG sederhana yang dibuat khusus; tidak menyalin brand, domain, foto, atau ornamen dari screenshot referensi. Tidak menggunakan font atau aset eksternal sehingga dapat dipakai offline.

## Revisi galeri dan latar

Latar menggunakan motif ukiran dan tenun SVG lokal asli. Galeri kini 3 kolom foto potret persegi panjang seperti referensi, dengan 12 placeholder; edit daftar gallery di invitation-data.js untuk mengganti atau mengurangi foto. Semua foto tetap mendukung lightbox.

## Background ilustrasi per bagian

Background utama telah diterapkan pada cover, countdown, dan penutup; variasi ivory floral pada salam dan profil; maroon–emas pada acara; bingkai ivory tipis pada amplop dan galeri. Komposisi, ukuran area kosong, dan intensitas gambar disesuaikan per bagian.

Seluruh path dapat diubah melalui objek `backgrounds` dalam invitation-data.js. File WebP dalam assets/decor dikompres untuk ponsel; versi PNG asli dan prompt pembuatan ada di assets/decor/originals. Gambar latar di bawah cover memakai lazy loading.

## Halaman pas satu layar

Setiap halaman mengikuti tinggi viewport aktual (`100dvh` dengan fallback dan Visual Viewport API). Undangan memakai scroll snap vertikal: geser/gulir untuk pindah halaman. Tinggi menyesuaikan address bar ponsel dan perubahan ukuran layar.

Bagian panjang dibagi: salam dan kutipan terpisah; kedua profil dalam satu halaman dengan dua kolom; akad dan resepsi masing-masing satu halaman; seluruh rekening dalam satu halaman; seluruh foto dalam satu halaman galeri (tetap tiga kolom dan jumlah baris otomatis); pesan penutup dan tanda tangan terpisah. Konten contoh menghasilkan 11 halaman termasuk cover. Menambah acara akan menambah halaman otomatis; foto, profil, dan rekening tetap di halaman masing-masing. Kalender tampil dalam dialog agar halaman acara tidak memanjang.

Pemeriksaan browser: 320×568, 390×844, 1366×768 — setiap section sama tinggi dengan viewport, tidak ada isi melebihi tinggi area isi, tidak ada scroll horizontal, tombol minimal 44px. Tidak ada error console.

Untuk teks pengganti yang jauh lebih panjang, layar landscape sangat pendek, atau pembesaran font aksesibilitas, area isi tetap dapat digulir agar konten tidak disembunyikan atau dipotong.
