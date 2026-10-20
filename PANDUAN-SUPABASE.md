# Mengaktifkan ucapan tamu

Versi ini menambahkan buku tamu ke undangan HTML/CSS/JS yang sudah ada. Hosting tetap di Vercel. Nama dan ucapan bersifat publik; tamu tidak perlu login.

## Perubahan Sebelum/Sesudah

| File | Sebelum | Sesudah |
| --- | --- | --- |
| index.html | Galeri langsung diikuti penutup | Ada bagian Ucapan untuk kami sebelum penutup |
| invitation-data.js | Belum ada konfigurasi database | Ada `supabase.url`, `supabase.publishableKey`, dan background untuk ucapan |
| app.js | Menampilkan konten undangan | Ditambah kirim/baca ucapan, tombol Perbarui, dan pemuatan 10 ucapan per halaman |
| styles.css | Belum ada gaya buku tamu | Ditambah form dan kartu ucapan mengikuti warna undangan |

## 1. Buat proyek Supabase

Buka https://supabase.com/dashboard dan buat proyek. Setelah siap, buka SQL Editor, pilih New query, salin seluruh isi `supabase-setup.sql`, lalu klik Run. Jalankan sekali pada proyek tujuan. Jika tabel `invitation_comments` sudah ada, periksa skemanya sebelum melanjutkan; jangan menghapus tabel berisi data.

SQL membuat tabel, indeks urutan tanggal, mengaktifkan RLS, dan memberi pengunjung akses baca serta tambah nama/ucapan. Pengunjung tidak diberi izin mengubah atau menghapus data. Tanggal dan ID ditentukan database. Jangan menonaktifkan RLS.

## 2. Isi dua nilai di invitation-data.js

Temukan blok ini di dekat awal file:

```js
supabase: {
  url: "https://YOUR_PROJECT.supabase.co",
  publishableKey: "sb_publishable_GANTI_DENGAN_KEY_ANDA",
},
```

Ganti `url` dengan Project URL dari dialog Connect proyek, dan `publishableKey` dengan publishable key proyek yang sama. Key juga tersedia di Settings > API Keys. Gunakan nilai lengkap milik proyek Anda; jangan gunakan URL dashboard. Jangan tempel secret key (`sb_secret_...`) atau `service_role`.

Publishable key memang dapat terlihat oleh browser; hak aksesnya dibatasi oleh izin database dan RLS. Versi kode ini secara sengaja menerima key baru yang dimulai `sb_publishable_`.

Tidak perlu membuat file `.env` atau mengisi environment variable Vercel untuk versi HTML biasa ini: konfigurasi dibaca langsung dari `invitation-data.js`. Environment variable Vercel tidak otomatis masuk ke file JS statis.

## 3. Ganti file di proyek Vercel

Ganti `index.html`, `app.js`, `invitation-data.js`, dan `styles.css` dengan versi revisi. Pertahankan folder `assets/` asli berisi foto, musik, background, dan ornamen di lokasi yang sama. Folder assets tidak disertakan dalam paket karena tidak diunggah bersama empat file sumber. Jalankan deployment seperti biasa, misalnya push perubahan ke repositori yang terhubung ke Vercel.

`supabase-setup.sql` dijalankan di Supabase; file panduan dan SQL tidak perlu ikut dipublikasikan. Tidak perlu npm, CDN, atau library tambahan: kode menggunakan `fetch` untuk REST API Supabase.

## 4. Uji setelah deployment

1. Buka undangan, ketuk Buka Undangan, lalu gulir ke Ucapan untuk kami.
2. Isi nama dan ucapan, lalu ketuk Kirim Ucapan. Pesan berhasil hanya muncul setelah server menerima penyimpanan.
3. Buka undangan dari browser/perangkat lain. Ucapan harus muncul juga.
4. Pada perangkat pertama, ketuk Perbarui untuk mengambil ucapan baru dari tamu lain.
5. Periksa tabel `invitation_comments` di Supabase Table Editor. Ucapan tersimpan di sini dan bisa dihapus oleh pemilik lewat dashboard.

Daftar diambil ketika bagian ucapan mendekati layar, setelah pengiriman berhasil, dan ketika Perbarui ditekan. Ini belum menggunakan pembaruan realtime otomatis. Tombol Muat ucapan lainnya muncul ketika masih mungkin ada halaman berikutnya. Nama tamu dari parameter `?to=` menjadi isian awal nama, tetapi tetap boleh diubah; tautan tersebut tidak memverifikasi identitas tamu.

## Jika belum bekerja

- Pesan ucapan belum tersedia: pastikan placeholder URL/key sudah diganti dengan publishable key yang sesuai.
- Ucapan tidak dapat dimuat: pastikan proyek aktif, tabel sudah dibuat, Data API aktif untuk schema public, serta grant dan policy sudah dijalankan. Periksa respons request di DevTools > Network.
- HTTP 401: periksa publishable key dan proyek tujuan. HTTP 403: periksa grant/RLS. Tabel tidak ditemukan: periksa SQL dan nama tabel `invitation_comments`.
- Gagal kirim: isian tidak dihapus. Pada koneksi terputus, penyimpanan bisa saja sudah diterima server; ketuk Perbarui dan periksa ucapan sebelum mengirim ulang.

## Cakupan dan validasi

Satu tabel ini untuk satu undangan. Menggunakan proyek/tabel sama untuk undangan lain akan mencampur daftar ucapan. Pengiriman publik dapat diakses tanpa login; RLS tidak menyediakan pembatasan spam. Versi ini membatasi panjang input, menonaktifkan tombol selama pengiriman, serta menampilkan teks melalui `textContent`. Untuk perlindungan spam dengan CAPTCHA dan pembatasan request, perlu endpoint server tambahan dan izin insert langsung dari browser perlu dicabut.

Pemeriksaan sintaks JavaScript dan uji logika dengan respons Supabase simulasi berhasil: pemuatan, paginasi, render teks aman, penolakan isian kosong, pencegahan pengiriman bersamaan, penyegaran setelah kirim, penanganan kegagalan, dan kondisi belum dikonfigurasi. Uji browser visual tidak dapat dijalankan di lingkungan ini. Uji proyek Supabase asli dan SQL di server belum dilakukan karena URL/key proyek belum diberikan. Foto dan musik asli juga tidak tersedia untuk pemeriksaan tampilan lengkap.

## Dokumentasi resmi

- https://supabase.com/docs/guides/api/creating-routes
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/database/postgres/row-level-security
