# Rafif & Dewa — konsep website kampanye KMTSL UGM

Prototipe kampanye dengan konsep **Satu rumah. Banyak suara.** Visi dan lima misi memakai naskah yang diberikan pengguna. Copy pendamping, nama kampanye, program, dan alur kerja masih menjadi bahan pembahasan bersama kandidat.

## Menjalankan

```bash
pnpm install
pnpm dev
```

Buka alamat lokal yang dicetak Next.js (biasanya http://localhost:3000).

```bash
pnpm typecheck
pnpm build
```

## Materi dan sumber

- [Copywriting dan daftar kebutuhan](docs/COPYWRITING.md)
- [Peta kelengkapan konten dari referensi AG](docs/CONTENT-CHECKLIST.md)
- [Super prompt untuk melanjutkan pengembangan](docs/SUPER-PROMPT.md)
- Data kandidat, program, dan FAQ: `lib/campaign-content.ts`
- Halaman dan interaksi: `components/campaign.tsx`
- Art direction dan responsivitas: `app/globals.css`

## Komponen

Coss UI: Button, Tabs, Accordion, Dialog, Input, Textarea. React Bits: adaptasi AnimatedContent dengan GSAP, dukungan reduced motion, cleanup, dan konten terlihat tanpa JavaScript. Sumber serta lisensi disimpan di `components/react-bits/`.

Font Manrope dan Newsreader dimuat dari paket lokal, tanpa permintaan Google Fonts saat build.

Ilustrasi jembatan dan mark rumah berupa SVG buatan untuk prototipe. Monogram menggantikan foto yang belum tersedia. Tidak memakai lambang resmi UGM.

## Perilaku demo

Visi dan lima misi tampil utuh dalam daftar terbuka. Navigasi menuju bagian halaman, tab menampilkan pilar program, accordion membuka detail, dan dialog menampilkan konsep peran serta tautan LinkedIn. Form aspirasi memvalidasi pesan, membuat ringkasan, memungkinkan penyuntingan, dan mengunduh file teks. Tab Pengalaman, Galeri, dan Kata mereka menampilkan status bahan yang belum tersedia. Bagian kontak mengarah ke profil LinkedIn kedua kandidat. Tidak ada pengiriman ke server atau tim kampanye; pesan hanya berada di memori halaman dan hilang saat reload.

Nama lengkap Dewa diberikan pengguna. Profil LinkedIn belum terbaca penuh, sehingga pengalaman, prestasi, dan foto tidak diambil atau dikarang. Jadwal, nomor urut, kontak tim, dan periode pemilihan belum dicantumkan. Metadata menggunakan noindex selama draft.

## Verifikasi

TypeScript, ESLint file perubahan, dan build produksi berhasil. Pengujian Playwright memakai browser lokal terpisah mencakup:

- Isi visi dan kelima misi, ukuran teks, dan overflow horizontal pada lebar 360, 390, 768, dan 1440 px.
- Navigasi seluler, tab gagasan program dan cerita, dialog profil, Escape, serta pengembalian fokus.
- Validasi aspirasi kosong, penyuntingan, dan pengunduhan catatan.

Screenshot desktop serta seluler tersimpan di `test-results/` (diabaikan Git). Browser yang terhubung ke aplikasi tidak tersedia pada sesi ini; pengujian dilakukan dengan Playwright dan Brave lokal.

```bash
# Setelah pnpm build; gunakan Chromium Playwright yang sudah terpasang:
pnpm test:e2e

# Atau browser lokal:
TEST_BROWSER_PATH='/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' pnpm test:e2e
```

Playwright menjalankan server produksi pada port 3001 dan menutupnya setelah tes. Lengkapi foto, pengalaman, program final, testimoni berizin, serta informasi pemilihan sebelum publikasi.

# rafif-kahim
