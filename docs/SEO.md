# SEO Rafif–Dewa

Domain utama: `https://rafifdewa.space`. Konfigurasi bersama ada di `lib/site.ts`, terpisah dari `APP_ORIGIN` yang mengatur validasi origin pengiriman formulir.

## Implementasi

- Halaman publik mengizinkan indeks; deployment Vercel Preview memakai noindex dan robots disallow. Preview tidak menghasilkan daftar URL pada sitemap.
- Beranda dan privasi memiliki judul, deskripsi, canonical, Open Graph, dan Twitter Card. Metadata bahasa Indonesia memakai `id-ID` / `id_ID`.
- `/sitemap.xml` hanya memuat URL publik beranda dan privasi. Anchor serta rute redirect tidak menjadi halaman tambahan. Tidak ada tanggal modifikasi buatan yang berubah setiap build.
- `/robots.txt` menunjuk sitemap dan melarang crawling API. Admin tetap dapat dicrawl untuk membaca meta noindex, tetapi tidak masuk sitemap. API mengirim header `X-Robots-Tag: noindex, nofollow`. Pengaturan crawler bukan pengganti autentikasi.
- JSON-LD beranda menjelaskan WebSite, WebPage, serta kedua kandidat sebagai Person dengan profil sosial yang sudah ditampilkan. Tidak ada rating, review, jabatan terpilih, ataupun agenda yang belum dikonfirmasi dalam schema.
- `/opengraph-image` menghasilkan PNG 1200 × 630 saat build, menggunakan font Anton lokal dan warna kampanye. Metadata gambar dan alt tersedia otomatis dari konvensi Next.js.
- Judul utama dan profil tetap tersedia dalam HTML hasil server render, tanpa menambah paragraf berulang atau daftar kata kunci.

## Setelah deployment

1. Pastikan domain utama terhubung ke deployment produksi. Arahkan `www` ke `https://rafifdewa.space` melalui pengaturan domain Vercel.
2. Atur `APP_ORIGIN=https://rafifdewa.space` di environment Production hosting dan redeploy. Secret lokal tidak ikut Git.
3. Buka Google Search Console, tambahkan properti domain `rafifdewa.space`, lalu verifikasi kepemilikan menggunakan TXT DNS yang diberikan Google.
4. Kirim `https://rafifdewa.space/sitemap.xml` melalui menu Sitemaps. Gunakan URL Inspection untuk memeriksa beranda dan meminta indeks.
5. Periksa HTTPS, canonical, robots, dan gambar berbagi setelah domain aktif. Pantau Page Indexing serta Core Web Vitals berdasarkan data pengguna nyata.

Kode dapat mengizinkan indeks dan memberikan informasi yang konsisten; waktu indeks, judul yang ditampilkan, serta peringkat ditentukan mesin pencari. Verifikasi Search Console memerlukan akses pemilik domain; belum dilakukan oleh implementasi ini.

## Verifikasi

`tests/seo.spec.ts` memeriksa canonical, metadata publik/privasi/admin, JSON-LD, robots, sitemap, dimensi gambar, dan header API pada build produksi. Pemeriksaan terpisah memverifikasi bahwa konfigurasi Preview menolak crawling dan menghasilkan sitemap kosong. Gambar Open Graph juga diperiksa secara visual.

Rujukan: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Google Search appearance](https://developers.google.com/search/docs/appearance), serta panduan metadata Next.js yang dibundel di `node_modules/next/dist/docs/` sesuai versi proyek.
