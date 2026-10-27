# Audit Awal terhadap PRD 1.0 — Sebelum Implementasi

Dokumen ini mencatat kondisi awal. Untuk hasil implementasi dan setup terkini, lihat [panduan deployment](DEPLOYMENT.md).

**Tanggal:** 26 Oktober 2026  
**Acuan:** [PRD](PRD.md) dan [naskah Samanvaya Sahakara](../../SAMANVAYA-SAHAKARA.md)  
**Cakupan:** inspeksi kode lokal; belum merupakan pengujian penerimaan atau audit keamanan sistem produksi.

## Kondisi proyek

- Next.js 16.4.0 App Router, React 19.3.0, TypeScript, Tailwind CSS 4.
- UI yang sudah tersedia: Base UI/Coss UI, Lucide, GSAP, serta font lokal Manrope dan Newsreader.
- Route halaman yang ditemukan: `app/page.tsx`, merender `components/campaign.tsx`. Belum ditemukan route survei, hasil, agenda, admin, maupun handler API.
- Data kampanye tersimpan dalam `lib/campaign-content.ts`.
- Form aspirasi menggunakan state React dan unduhan Blob. Tidak mengirim data ke backend; isi hilang saat halaman dimuat ulang.
- Belum ditemukan implementasi database, autentikasi admin, otorisasi, agregasi survei, atau konfigurasi integrasi backend dalam kode yang diperiksa.
- `app/layout.tsx` masih memakai metadata konsep lama dan `noindex`.
- Tersedia skrip typecheck, lint, build, dan tes Playwright. Keberadaan tes bukan bukti bahwa tes lulus pada audit ini; belum dijalankan ulang.
- URL produksi dicoba melalui alat web tetapi tidak dapat diakses oleh alat tersebut. Kesamaan kode lokal dengan deployment aktif belum terverifikasi.

## Selisih terhadap kebutuhan

| Kebutuhan | Kondisi lokal | Pekerjaan berikutnya |
| --- | --- | --- |
| Identitas Samanvaya Sahakara dan periode 2026/2027 | Copy dan metadata masih berupa konsep sebelumnya | Selaraskan identitas, periode, CTA, dan metadata dengan PRD |
| Visi dan lima misi resmi | Sudah ada bagian visi–misi, tetapi redaksinya berbeda dari naskah terbaru | Gunakan redaksi resmi PRD; pisahkan penjelasan sederhana dan contoh rencana |
| Biodata kandidat | Profil ringkas dan monogram; belum mencakup biodata terbaru | Masukkan motivasi dan pengalaman dari naskah pengguna; gunakan ejaan nama terbaru |
| Penjelasan misi | Ada gagasan program ilustratif | Hubungkan setiap misi dengan contoh, indikator rencana, dan fitur website |
| Survei 10 aspek | Belum ada | Form bertahap, persetujuan, profil opsional, skala 1–5 dan N/A, ringkasan, validasi server, penyimpanan |
| Hasil survei publik | Belum ada | Endpoint agregat aman, jumlah respons, distribusi, metode, waktu pembaruan, sinkronisasi otomatis |
| Aspirasi privat | Baru menyusun dan mengunduh catatan | Penyimpanan privat, izin baca khusus, status, catatan internal, kebijakan retensi dan penghapusan |
| Agenda | Belum ada | Penyimpanan agenda, daftar/detail, status, pengelolaan admin; kalender mengikuti prioritas P1 |
| Admin | Belum ada | Autentikasi, otorisasi server/database, pemisahan izin dan catatan tindakan penting |
| Perlindungan spam | Tidak relevan pada demo unduhan; belum ada jalur pengiriman | Batasi pengiriman dan validasi input di server, dengan minimisasi data |
| Responsivitas dan aksesibilitas | Sudah ada CSS, skip link, komponen interaktif dan tes terkait | Pertahankan dasar UI, lalu uji kembali alur baru di ponsel dan keyboard |

## Arah implementasi setelah audit

Pertahankan Next.js, komponen UI, font, dan struktur proyek yang sudah berfungsi. Pengembangan dapat dilakukan pada repositori yang sama tanpa mengganti framework.

Supabase menjadi kandidat backend yang sesuai untuk dievaluasi: Postgres untuk relasi dan agregasi, Auth untuk admin, serta aturan akses database. Ini belum menjadi integrasi yang dipilih atau terpasang. Ketersediaan proyek backend, koneksi deployment, dan kredensial server perlu dipastikan sebelum pengujian integrasi.

Urutan kerja yang disarankan:

1. Selaraskan konten resmi, navigasi, dan halaman visi–misi.
2. Tetapkan skema database, periode/versi survei, izin admin, dan aturan akses. Pastikan pembacaan aspirasi ditolak bagi publik sejak awal.
3. Buat jalur pengiriman survei dan aspirasi dengan validasi server, persetujuan, pembatasan spam, dan penanganan kegagalan.
4. Buat agregasi hasil survei dan pembaruan otomatis, lalu terapkan ambang privasi pada setiap kelompok yang dipublikasikan.
5. Buat autentikasi admin, pengelolaan agenda, serta pengelolaan aspirasi sesuai izin.
6. Uji penyimpanan, perhitungan N/A, pencegahan akses publik, otorisasi admin, kegagalan jaringan, dan alur seluler sebelum rilis.

## Hal yang belum ditetapkan

- Proyek backend dan akun admin pertama.
- Pihak berwenang yang boleh membaca aspirasi serta masa retensi data.
- Tanggal buka/tutup dan versi pertanyaan survei.
- Daftar resmi unit organisasi bila penilaian per unit digunakan.
- Konfirmasi publikasi agenda contoh **Desak RAFIF–DEWA**, 29 Oktober 2026, 15.00–17.00 WIB, Selasar KMTSL. Jangan menerbitkannya sebagai agenda terkonfirmasi sebelum ada konfirmasi.

Keputusan tersebut tidak menghalangi penyusunan UI atau skema untuk ditinjau, tetapi diperlukan sebelum fitur terkait menerima data warga atau dipublikasikan.
