# Rafif–Dewa · Samanvaya Sahakara

Platform pencalonan Ketua dan Sekretaris Jenderal KMTSL FT UGM 2026/2027. Memuat gagasan resmi, profil kandidat, survei warga, hasil agregat otomatis, aspirasi privat, agenda, dan panel admin.

Seluruh konten publik terintegrasi di landing `/`, dengan navigasi ke `/#gagasan`, `/#survei`, `/#hasil`, `/#agenda`, dan `/#aspirasi`. Hanya `/privasi` dan `/admin` yang terpisah: total tiga halaman. Alamat publik lama otomatis diarahkan ke bagian yang sesuai. Berpindah bagian tidak mereset isian survei atau draft aspirasi.

Next.js 16.4.3 · React 19.3 · TypeScript · Tailwind 4 · Supabase Postgres/Auth. Foto asli memakai aset pengguna di `public/media`; font Manrope dan Newsreader dimuat lokal. Komponen prototipe tetap tersedia di repo.

## Mulai lokal

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Isi konfigurasi Supabase dan origin lokal.
pnpm dev
```

Buka `http://localhost:3000`. Tanpa konfigurasi backend, UI tetap tersedia, sementara operasi pengiriman ditolak dengan pesan yang jelas. Tidak ada data survei atau akun admin palsu yang ditambahkan ke aplikasi.

## Setup backend dan deploy

Ikuti [panduan lengkap](docs/DEPLOYMENT.md) untuk environment variables, migrasi, admin pertama, izin akses, cron retensi, deployment Vercel, dan verifikasi grafik.

- [Environment example](.env.example)
- [Migrasi database](supabase/migrations/202610260001_platform.sql)
- [PRD 1.0](docs/PRD.md)
- [Audit sebelum implementasi](docs/PRD-AUDIT.md)
- [Pengujian dan batas verifikasi](docs/TESTING.md)
- [Naskah Samanvaya Sahakara](../SAMANVAYA-SAHAKARA.md)

## Pemeriksaan

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm audit --prod
```

Playwright memakai database PGlite dan adapter Supabase REST/Auth lokal khusus tes, serta menjalankan build produksi pada port 3001. Browser perlu tersedia:

```bash
pnpm exec playwright install chromium
# Atau gunakan browser lokal yang kompatibel:
TEST_BROWSER_PATH='/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' pnpm test:e2e
```

Migrasi dan kontrol akses aplikasi diuji secara lokal; koneksi Supabase/Auth/Vercel nyata harus diverifikasi setelah kredensial disediakan. Tes tidak menghubungi atau mengisi backend produksi.

## Data dan privasi

Respons individual dan aspirasi tidak dapat dibaca langsung oleh role publik atau akun Supabase biasa. Server memverifikasi akun dan peran setiap kali admin mengakses data. Dashboard publik hanya membaca agregat, dengan ambang lima responden valid per aspek/kelompok. Agenda contoh tetap draft sampai dikonfirmasi admin.

Semua secret hanya digunakan di server. Jangan commit `.env.local`. Jangan mencatat request body aspirasi dalam alat analitik atau log.
