# Hasil Pengujian Implementasi

Tanggal: 26 Oktober 2026. Pengujian dilakukan pada kode lokal. Website produksi tidak menerima data tes dan belum di-deploy ulang oleh sesi ini.

## Hasil

| Pemeriksaan | Hasil |
| --- | --- |
| `pnpm lint` | Lulus; seluruh repositori |
| `pnpm typecheck` | Lulus |
| `pnpm test` | Lulus: 4 tes validasi dan 8 pemeriksaan/suite database |
| `pnpm build` | Lulus dengan Next.js 16.4.3 |
| `pnpm test:e2e` dengan Brave lokal | Lulus: 8 tes browser/API |
| `pnpm audit` | Tidak ditemukan vulnerability yang diketahui saat pemeriksaan |
| Pemindaian `.next/static` | Tidak ditemukan marker secret server atau secret fixture tes |
| `git diff --check` | Lulus |

`pnpm test` menjalankan dua berkas Node test melalui tsx secara berurutan. Pada Node 23 di mesin ini, child-process isolation `tsx --test` sempat macet saat mentransformasi modul; runner langsung dipakai agar perintah tes dapat diulang dengan andal. Satu percobaan macet dihentikan, lalu seluruh tes dijalankan kembali hingga lulus.

## Database dan validasi

Tes database mengeksekusi berkas migrasi produksi yang sama di PostgreSQL WASM/PGlite. Schema `auth.users` dan role Supabase disimulasikan untuk keperluan pengujian lokal.

- Empat responden belum membuka rata-rata atau distribusi; responden kelima membuka aspek yang memenuhi ambang.
- N/A tidak dihitung sebagai angka atau masuk pembagi rata-rata.
- Jumlah responden dihitung sebagai orang yang memiliki nilai valid pada aspek, terpisah dari jumlah jawaban.
- Respons duplikat, nilai di luar rentang, dan periode tertutup ditolak. Kegagalan tidak meninggalkan jawaban parsial.
- Respons excluded tidak masuk hasil publik.
- Kelompok kecil tidak mendapatkan skor/distribusi; teks komentar tidak muncul dalam output agregat.
- RLS aktif; role anon/authenticated tidak memiliki grant membaca tabel mentah ataupun menjalankan RPC agregasi secara langsung.
- Percobaan SELECT pesan sebagai anon ditolak oleh PostgreSQL.
- Rate limit memakai state database; percobaan di atas anggaran ditolak.
- Agenda contoh tetap belum terkonfirmasi; pekerjaan retensi menghapus pesan kedaluwarsa.
- Validasi aplikasi menolak consent yang tidak diberikan, payload kosong, nilai salah tipe, pesan terlalu panjang, serta jadwal agenda yang tidak berurutan.

## Browser dan API aplikasi

Playwright menjalankan build produksi Next.js pada port 3001, dengan adapter REST/Auth loopback pada 54329 yang menjalankan SQL migrasi asli di PGlite. Adapter hanya dipakai tes dan tidak diimpor oleh aplikasi. Data sintetis di screenshot grafik merupakan data tes lokal, bukan hasil survei warga.

1. Memverifikasi visi dan lima misi, foto kandidat, navigasi seluler, serta semua route publik. Halaman visi diperiksa pada 360, 390, 768, dan 1440 px.
2. Memverifikasi API admin menolak akses tanpa login, endpoint publik tidak membuka aspirasi, permintaan lintas origin ditolak, serta payload kosong/terlalu besar ditolak.
3. Mengisi survei dari browser, menguji validasi dan N/A, menyimpan respons ke SQL backend, memeriksa deduplikasi, memastikan hasil bertahan setelah reload, serta melihat grafik berubah otomatis pada tab yang tetap terbuka setelah respons kelima.
4. Mengirim aspirasi, menolak admin agenda saat membaca/mengubah aspirasi, menampilkan payload script sebagai teks, mengubah status/catatan internal sebagai owner, memeriksa ketiadaan pesan di hasil publik, menghapus melalui kode penerimaan, dan memastikan logout mencabut akses aplikasi.
5. Mengonfirmasi draft agenda, mengubah lokasi, memeriksa daftar publik dan kalender, mengunduh ICS, serta menandai pembatalan tanpa menyediakan tombol tambah kalender.
6. Menggagalkan koneksi endpoint hasil, memastikan snapshot terakhir tetap terlihat, lalu memulihkan sinkronisasi.
7. Menggagalkan pengiriman aspirasi dan memastikan isi form tetap ada serta kontrol berlabel dapat difokuskan.
8. Memeriksa seluruh route publik pada 360 dan 768 px tanpa overflow horizontal.

Screenshot QA tersedia secara lokal di `test-results/home-desktop.png`, `home-mobile.png`, `results.png`, dan `results-mobile.png`. Direktori ini diabaikan Git agar artefak tes dan respons sintetis tidak diterbitkan bersama aplikasi.

## Belum diverifikasi secara eksternal

- Migrasi pada proyek Supabase hosted asli, perilaku gateway PostgREST, dan penggunaan API keys milik proyek.
- Pengiriman email, login Supabase Auth nyata, serta konfigurasi akun admin asli.
- Deployment Vercel beserta origin, cookies HTTPS, cron retensi dan environment variables sebenarnya.
- Perlindungan header proxy/IP pada hosting di luar Vercel.
- Uji perangkat iOS/Android fisik, audit pembaca layar menyeluruh, load test, dan pentest independen.

Lakukan smoke test staging sesuai [panduan deployment](DEPLOYMENT.md) sebelum membuka pengumpulan data warga. Hasil tes lokal tidak dipakai sebagai klaim keamanan absolut atau bukti koneksi layanan produksi.
