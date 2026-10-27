# Setup dan Deployment — Samanvaya Sahakara

## Implementasi

Website menggunakan Next.js 16.4.3 App Router, React 19.3, TypeScript, Tailwind 4, font lokal Manrope/Newsreader, dan Lucide. Dasar komponen dan kode prototipe dipertahankan; halaman publik sekarang menggunakan komponen `platform-*` dan `app/platform.css`.

Integrasi backend menggunakan Supabase Postgres dan Supabase Auth melalui REST dari Route Handlers Next.js. Tidak ada SDK database atau secret yang dikirim ke browser. Tanpa konfigurasi backend, halaman tetap dapat ditampilkan, tetapi pengiriman tidak menghasilkan sukses palsu; API mengembalikan error layanan belum tersedia.

| Halaman | Fungsi |
| --- | --- |
| `/` | Identitas, foto kandidat asli, empat nilai, visi resmi, CTA, dan agenda terdekat |
| `/#gagasan` | Visi dan lima misi resmi, contoh rencana, indikator, dan profil kandidat |
| `/#survei` | 20 pertanyaan / 10 aspek dalam 5 langkah, persetujuan, N/A, konteks opsional, tinjauan sebelum kirim |
| `/#hasil` | Hasil Survei 1.0: jumlah responden, rata-rata dan distribusi aspek, filter konteks/aspek, metode dan waktu pembaruan |
| `/#aspirasi` | Pesan privat, persetujuan, kontak opsional, nomor pesan dan kode penghapusan |
| `/#agenda` | Daftar, kalender bulanan, filter status, detail dan ekspor `.ics` |
| `/privasi` | Penggunaan data, retensi, pembaca berwenang, dan penghapusan pesan |
| `/admin` | Login/logout, ringkasan, aspirasi sesuai izin, agenda, status Survei 1.0, ekspor agregat, pengelolaan akses |

Konten publik berada pada satu landing `/`; menu menuju anchor bagian tanpa memuat ulang halaman. Hanya `/privasi` dan `/admin` yang terpisah. Alamat publik lama diarahkan ke anchor terkait, sehingga total halaman tetap tiga.

## Menjalankan lokal

Gunakan Node.js 22.19+ dan pnpm. Node 23.10 digunakan saat implementasi; untuk hosting gunakan rilis LTS yang didukung Vercel dan Next.js.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Isi .env.local menggunakan dashboard Supabase. Jangan commit file ini.
pnpm dev
```

Buka `http://localhost:3000`. Jangan membagikan secret melalui chat atau memasukkannya ke file berawalan `NEXT_PUBLIC_`.

## Variabel lingkungan

Semua variabel dibaca di server. Contoh tanpa kredensial tersedia dalam [`.env.example`](../.env.example).

| Variabel | Isi |
| --- | --- |
| `APP_ORIGIN` | Origin website yang tepat, tanpa path; lokal `http://localhost:3000`, produksi `https://rafif-kahim.vercel.app` |
| `SUPABASE_URL` | URL proyek Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable API key proyek; legacy anon JWT juga didukung oleh gateway Supabase |
| `SUPABASE_SECRET_KEY` | Secret API key server; legacy service-role JWT juga didukung. Jangan gunakan publishable/anon key di sini |
| `RATE_LIMIT_SECRET` | Nilai acak minimal 32 karakter; buat dengan `openssl rand -hex 32` |
| `FEEDBACK_READERS` | Nama/deskripsi pihak yang benar-benar diberi izin membaca aspirasi, ditampilkan pada pemberitahuan privasi |
| `CRON_SECRET` | Nilai acak terpisah, minimal 32 karakter, untuk pekerjaan retensi harian |

Jaga `RATE_LIMIT_SECRET` stabil: menggantinya mengubah hash deduplikasi dan membuat kode penghapusan lama tidak cocok. Rotasi memerlukan rencana migrasi hash atau penanganan penghapusan manual. Jangan menggunakannya sebagai secret untuk layanan lain.

`APP_ORIGIN` juga memvalidasi asal operasi tulis. Pada Preview Vercel, atur origin preview yang benar agar pengujian tidak ditolak sebagai lintas origin. Jangan menggunakan origin produksi untuk menguji form pada domain preview berbeda.

## Membuat backend dan menjalankan migrasi

1. Buat proyek Supabase terpisah, lalu ambil URL serta API keys di dashboard proyek.
2. Pastikan Data API tersedia untuk schema `public` dan role `service_role`.
3. Jalankan seluruh [migrasi](../supabase/migrations/202610260001_platform.sql) satu kali melalui SQL Editor pada proyek kosong. Alternatif: tautkan Supabase CLI ke proyek dan jalankan `supabase db push`.
4. Jangan menjalankan migrasi awal dua kali lewat SQL Editor. Untuk perubahan berikutnya tambahkan migrasi baru; jangan menghapus data warga untuk mengulang setup.
5. Tinjau Security Advisor. Pastikan semua tabel aplikasi memiliki RLS dan tidak ada grant tambahan ke `anon`/`authenticated`.
6. Jangan mengaktifkan tabel respons individual atau aspirasi pada kanal Realtime publik.

Jalankan juga migrasi `202610270001_single_survey_and_desak.sql`. Migrasi ini menyediakan satu **Survei 1.0** yang langsung dibuka, tanpa menambahkan respons buatan. Permintaan pemilik situs juga memublikasikan agenda Desak RAFIF–DEWA yang sebelumnya tersimpan sebagai draft. Migrasi awal tidak diubah; jangan jalankan ulang migrasi awal pada database yang sudah berisi data.

## Skema dan kebijakan akses

| Tabel | Isi | Akses browser langsung |
| --- | --- | --- |
| `survey_periods` | Versi, jadwal dan status periode | Ditolak; server memproyeksikan metadata aman |
| `survey_responses` | Respons, konteks opsional, komentar privat, persetujuan, hash dedupe dan status | Ditolak |
| `survey_answers` | Nilai numerik atau null per pertanyaan/aspek | Ditolak |
| `private_feedback` | Pesan, kontak opsional, status, catatan internal, hash kode penghapusan dan tenggat | Ditolak |
| `agenda` | Draft/publik, jadwal, tempat, status | Ditolak; endpoint publik hanya mengembalikan agenda terkonfirmasi |
| `admin_users` | Hubungan akun Supabase Auth dan peran | Ditolak |
| `rate_limits` | Hash jaringan harian dan batas percobaan | Ditolak |
| `audit_log` | ID admin, jenis tindakan, ID entitas dan waktu; tanpa isi pesan | Ditolak |

RLS diaktifkan pada semua tabel dan semua grant tabel ke `anon`/`authenticated` dicabut. Tidak ada policy yang memberi akses baca/tulis langsung ke role tersebut. `service_role` diizinkan untuk server. Fungsi RPC juga mencabut `EXECUTE` dari PUBLIC, anon, dan authenticated; hanya server dapat memanggilnya.

Server memverifikasi token melalui Supabase Auth `/user`, lalu membaca peran dari `admin_users` pada setiap operasi admin. Akun Supabase biasa tidak otomatis memperoleh izin. Role tidak dibaca dari request, localStorage, atau metadata yang dapat diubah pengguna.

Endpoint publik `/api/public?resource=results` memanggil fungsi `survey_aggregate`. Fungsi itu mengembalikan skor/distribusi hanya untuk aspek dengan minimal lima responden valid. Tidak pernah mengembalikan jawaban individu, komentar, hash, atau data aspirasi. Rata-rata setiap aspek menggunakan seluruh nilai numerik pada dua pertanyaan, dengan bobot sama; N/A tidak masuk pembagi. Tidak ada skor total lintas aspek.

## Menyiapkan admin pertama

1. Di Supabase Authentication → Users, buat akun pengelola menggunakan email dan kata sandi kuat. Konfirmasi email sesuai kebijakan proyek. Nonaktifkan pendaftaran publik bila tidak diperlukan.
2. Salin User ID akun tersebut, lalu jalankan SQL berikut dengan ID asli di SQL Editor:

```sql
insert into public.admin_users (auth_user_id, role)
values ('GANTI_DENGAN_UUID_USER_AUTH', 'owner');
```

3. Buka `/admin` dan login. Tidak ada kata sandi default atau tombol pendaftaran publik.
4. Owner dapat menambahkan akun yang sudah ada di Supabase Auth sebagai `agenda` atau `feedback` lewat tab Akses admin, serta mencabut aksesnya.
5. Penambahan/pencabutan owner hanya dilakukan melalui SQL Editor. API menolak penambahan owner dan tidak dapat menghapus owner.

| Peran | Ringkasan/ekspor agregat | Kelola agenda | Baca/kelola aspirasi | Periode & akses |
| --- | --- | --- | --- | --- |
| `owner` | Ya | Ya | Ya | Ya |
| `agenda` | Ya | Ya | Tidak | Tidak |
| `feedback` | Ya | Tidak | Ya | Tidak |

Sesi memakai cookie HttpOnly/Secure pada produksi, SameSite Strict, maksimal satu jam, tanpa refresh token di browser. Setelah sesi berakhir, login lagi. Pemulihan kata sandi dilakukan pengelola melalui Supabase Auth; UI reset mandiri belum disediakan.

## Mengelola agenda

1. Masuk sebagai owner atau admin agenda → Agenda → Agenda Baru.
2. Isi tanggal/jam dalam WIB. Waktu selesai wajib setelah waktu mulai.
3. Simpan tanpa konfirmasi untuk draft. Centang pernyataan verifikasi hanya setelah waktu, lokasi, dan penyelenggara benar.
4. Klik Kelola untuk mengubah jadwal, tempat, status, atau menghapus agenda.
5. Status pembatalan tampil jelas; agenda yang dibatalkan tidak menyediakan unduhan kalender.
6. Status berlangsung/selesai juga dihitung dari waktu aktual. Halaman publik memeriksa ulang data setiap 15 detik; preview beranda setiap 30 detik.

Agenda **Desak RAFIF–DEWA, 29 Oktober 2026, 15.00–17.00 WIB, Selasar KMTSL** dipublikasikan sesuai permintaan pemilik situs dan langsung terlihat di landing. Admin tetap dapat mengubah jadwal, menyembunyikan, atau membatalkan kegiatan.

## Membuka survei dan memverifikasi pembaruan

1. Survei 1.0 langsung tersedia setelah migrasi. Tidak perlu membuat periode atau menjadwalkan survei. API menolak pembuatan survei tambahan.
2. Owner dapat membuka atau menutup penerimaan melalui tab Survei 1.0. ID survei tetap sama sehingga menutup/membuka kembali tidak menghapus respons atau mengizinkan pengiriman ulang browser yang sama.
3. Untuk uji manual gunakan backend staging, bukan respons palsu di produksi. Buka `/#hasil` pada tab/perangkat terpisah, lalu kirim respons di `/#survei`.
4. Pastikan `/api/survey` mengembalikan 201. Muat ulang halaman; jumlah responden harus tetap ada.
5. Di tab `/#hasil` yang tetap terbuka, tunggu maksimal sekitar 15 detik. Jumlah respons dan waktu respons terbaru harus berubah tanpa reload manual. Tab dalam browser yang sama juga diberi sinyal BroadcastChannel.
6. Dengan kurang dari lima responden valid, skor/distribusi tetap disembunyikan. Pada responden kelima, skor aspek yang memenuhi syarat muncul. N/A tidak dihitung sebagai nilai.
7. Putuskan koneksi pada halaman hasil setelah data termuat: status sinkronisasi berubah dan data terakhir dipertahankan. Hubungkan kembali; browser mencoba memuat ulang saat event online dan interval berikutnya.

Polling hanya membaca agregat Survei 1.0. Tidak ada subscription publik ke tabel mentah atau pilihan periode pada hasil. Tanggapan sukarela dan dedupe browser bukan bukti identitas/keanggotaan warga.

## Membaca aspirasi dan retensi

- Owner/admin feedback membuka Aspirasi privat, lalu detail pesan. Ubah status baru/ditinjau/ditindaklanjuti/selesai dan simpan catatan internal.
- Daftar memakai pagination 20 pesan dan menyaring pesan yang melewati tenggat retensi.
- Pesan tidak diteruskan ke analitik dan error aplikasi tidak memuat isinya. Jangan mengaktifkan pencatatan request body pada hosting atau alat observabilitas.
- Pengirim menerima nomor pesan dan kode penghapusan acak; yang disimpan di database hanya hash kode. Form `/privasi#hapus` menghapus jika keduanya cocok. Respons tidak mengonfirmasi keberadaan sebuah ID.
- Endpoint `/api/cron/retention` menghapus aspirasi kedaluwarsa (180 hari), rate limit kadaluwarsa, dan audit log di atas 365 hari.
- `vercel.json` menjadwalkan `/api/keep-alive` setiap hari 01.15 UTC (08.15 WIB). Endpoint ini menjalankan query database tanpa cache, lalu pekerjaan retensi yang sama; `/api/cron/retention` tetap berfungsi sebagai alias. Set `CRON_SECRET` di environment Production Vercel agar request cron membawa `Authorization: Bearer <CRON_SECRET>`. Jika paket hosting tidak mendukung cron, jadwalkan pemanggilan HTTPS terlindungi ke endpoint tersebut setiap hari.
- Keep-alive mengadaptasi pola query terjadwal dari [travisvn/supabase-pause-prevention](https://github.com/travisvn/supabase-pause-prevention), memakai koneksi server proyek yang sudah tersedia. Tidak memerlukan SDK, tabel, atau respons survei buatan. Query hanya memilih ID konfigurasi survei dan tidak mengembalikan isi database ke pemanggil. Endpoint tanpa secret ditolak. Retensi tetap hanya menghapus data yang telah melewati tenggat kebijakan sebelumnya.
- Setelah deployment, cek Vercel → Settings → Cron Jobs dan pastikan `/api/keep-alive` terdaftar. Pantau hasil eksekusi; job terjadwal bukan jaminan proyek tidak akan pernah dipause oleh penyedia, dan tidak memulihkan proyek yang sudah dipause.
- Penghapusan cadangan mengikuti kebijakan penyedia. Tinjau retensi survei pada akhir periode kepengurusan; jangan menjanjikan anonimitas absolut.

## Deployment Vercel

1. Gunakan repositori yang sama dan pilih root directory `kahim-jaya` bila repositori induk yang diimpor; jika repo Git memang berakar di `kahim-jaya`, pilih root `.`.
2. Framework Next.js, install `pnpm install --frozen-lockfile`, build `pnpm build`, output default Next.js.
3. Isi environment variables untuk Production dan Preview secara terpisah. Jangan gunakan backend produksi untuk tes sintetis.
4. Jalankan migrasi dan buat admin sebelum menerima data warga.
5. Deploy melalui integrasi Git Vercel atau CLI Vercel yang sudah terhubung. Implementasi ini belum melakukan push atau deployment ke akun eksternal.
6. Redeploy sesudah mengubah environment variables. Uji login, akses publik, persisten survei, kontrol izin, kalender, dan retensi pada deployment.
7. Metadata publik sudah mengizinkan indeks di produksi; Vercel Preview serta `/admin` tetap `noindex`. Canonical memakai `https://rafifdewa.space`. Ikuti [panduan SEO](SEO.md) untuk menghubungkan domain, verifikasi Search Console, dan mengirim sitemap.

Sebelum rilis, pastikan `FEEDBACK_READERS` mencerminkan pemberian akses aktual, kebijakan retensi disetujui pengelola, periode survei benar, dan draft agenda hanya dikonfirmasi jika faktanya telah diverifikasi.

## Batas implementasi dan verifikasi

- Semua integrasi ditulis, tetapi belum terhubung ke proyek Supabase atau Vercel nyata pada sesi implementasi. Tidak ada kredensial yang dibuat atau ditebak.
- Tes lokal memakai PostgreSQL WASM (PGlite) dengan migrasi asli. Tes browser memakai adapter REST/Auth lokal khusus tes. Ini menguji API aplikasi dan SQL, bukan bukti bahwa gateway Supabase, email, konfigurasi Auth, cron atau jaringan deployment sudah berfungsi.
- Cookie dedupe bukan sistem one-person-one-vote. Batas jaringan saat ini: survei 150/jam, aspirasi 30/jam, login 8/15 menit. Jaringan kampus bersama perlu dipantau agar warga tetap dapat mengisi. Pada host selain Vercel, pastikan reverse proxy menimpa header forwarded-for; jangan mempercayai header klien secara langsung.
- Ekspor hanya agregat JSON. Pengingat agenda, notifikasi admin, analisis tren, dan reset kata sandi mandiri belum diimplementasikan.
- CSP menjadi pertahanan tambahan; masih mengizinkan inline script/style untuk kompatibilitas output Next.js. Input disajikan sebagai teks React, tidak memakai HTML mentah. Tidak ada klaim bahwa sistem kebal XSS atau sudah menjalani pentest independen.
- Next.js diperbarui dari 16.4.0 ke 16.4.3 setelah audit menemukan advisory. [Advisory maintainer](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw), [rilis 16.4.3](https://github.com/vercel/next.js/releases/tag/v16.4.3). Dasar kebijakan database mengikuti [dokumentasi Supabase](https://supabase.com/docs/guides/api/securing-your-api).
