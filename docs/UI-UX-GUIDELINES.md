# Panduan UI/UX Samanvaya Sahakara

## Arah dan alur

Website mengenalkan Rafif–Dewa, menjelaskan arah KMTSL, lalu memberi warga ruang berpartisipasi. Komposisi pembuka mengikuti referensi Harris–Walz yang diberikan: poster lebar, dua potret kandidat, tipografi besar, dan panel ajakan bertumpuk di bawahnya. Pembagian konten dan pilihan kanal juga mengambil pelajaran dari [Education Reform](https://iier.vercel.app/en), yang diperiksa langsung melalui browser. Pendekatan foto mengacu pada Diana for Queens dan Abdul El-Sayed; konsistensi identitas kampanye mengacu pada Zohran. Referensi lengkap ada di [CAMPAIGN-REFERENCES.md](CAMPAIGN-REFERENCES.md).

Urutan membaca:

1. **Pembuka:** foto asli Rafif–Dewa, satu pesan utama, panel ajakan menuju profil kandidat.
2. **Kenali kami:** nama, peran, profil yang dapat dibuka, serta Instagram dan LinkedIn masing-masing kandidat.
3. **Visi & misi:** visi resmi tampil sekali; lima ringkasan misi dapat dibuka untuk melihat isi resmi, rencana, serta indikatornya.
4. **Apa Kata Mereka:** marquee kartu dengan avatar inisial, nama, peran, dan ulasan dummy. Data contoh dikelola di `components/platform-testimonials.tsx`; identitas dan ulasan belum merupakan kesaksian terverifikasi.
5. **Ikut bersuara:** jelaskan perbedaan survei dan aspirasi. Formulir baru dibuka setelah dipilih; dua kanal berada dalam tab fungsional dan draft tetap tersimpan saat berpindah tab atau menutup panel.
6. **Hasil survei:** panel ringkas “Apa kata warga?” membuka data agregat, status koneksi, dan filter.
7. **Agenda:** panel “Sampai bertemu” membuka kegiatan terkonfirmasi, waktu, lokasi, dan tindakan tambah ke kalender.

Logo mengarah ke awal halaman. Menu utama mengikuti bagian konten; tidak ada tab Beranda di dalam Beranda. Tautan lama `/visi-misi`, `/survei`, `/aspirasi`, `/hasil`, dan `/agenda` tetap mengarah ke anchor masing-masing.

## Penulisan dan komposisi

- Satu bagian mengerjakan satu tugas. Hindari mengulang visi, teaser survei, atau daftar agenda sebelum bagian lengkapnya.
- Gunakan judul pendek dan satu kalimat pengantar. Detail panjang masuk ke profil atau accordion misi.
- Petunjuk harus membantu pengambilan keputusan: waktu pengisian, privasi, pilihan N/A, dan perbedaan kanal.
- Pesan privasi, persetujuan, validasi, serta status layanan tetap tersedia sebelum tindakan terkait.
- Semua bagian memakai gutter konten yang sama. Teks isi tetap 16 px; keterangan pendamping memiliki ukuran sesuai hierarkinya.
- Navy `#0b1f3a` menandai identitas, navigasi, dan aksi; `#193d74` dipakai untuk aksen gelap dan judul pendamping. Gradasi memakai `rgb(126 154 198 / 80%)`, sesuai `#7e9ac6/80` yang ditentukan. Latar `#f0f4fa`, panel `#fafcff`, dan tint `#dce7f7` menggantikan putih polos serta hijau muda. Anton dipakai pada poster, wordmark, dan judul section; Manrope untuk isi dan formulir. Newsreader terbatas pada kutipan visi serta halaman data yang sudah ada.

## Gambar sementara dan pengganti

Favicon monogram RD memakai latar `#0b1f3a` dan huruf `#dce7f7`; versi SVG, ICO multiresolusi, serta ikon Apple 180 px harus diperbarui bersama.

Foto asli kandidat tetap berada di pembuka. Untuk pembaruan aset hero, siapkan foto Rafif dan Dewa dengan cahaya serta skala yang sama, tinggi minimal 2000 px, latar transparan, dan ruang utuh di atas kepala. Poster dibuat dari HTML/CSS agar teks tetap tajam, dapat diakses, dan menyesuaikan ponsel. Foto kampanye Diana for Queens dan Abdul El-Sayed telah dihapus karena tidak relevan. Lima foto dari situs DTSL UGM membentuk kolase laboratorium serta strip kegiatan kampus, tanpa caption. Foto asli kandidat juga tampil sebagai thumbnail profil. Data sumber ada di [sources.json](../public/media/reference/sources.json).

| Aset sementara | Penempatan | Gambar pengganti yang perlu disiapkan |
| --- | --- | --- |
| `campus-lab-group.jpg`, `campus-lab.jpeg` | Kolase setelah misi | Dokumentasi kegiatan laboratorium mahasiswa. |
| `campus-home.jpg`, `campus-together.jpg`, `campus-field.jpg` | Strip foto sebelum pilihan partisipasi | Suasana KMTSL, kebersamaan, dan kunjungan lapangan. |

Gunakan dokumentasi kegiatan yang benar-benar berlangsung. Tidak ada caption atau label referensi pada antarmuka. Saat mengganti foto, perbarui sumber dan alt text; alt harus menjelaskan subjek sebenarnya tanpa mengklaim keterlibatan kandidat dalam foto pinjaman.

## Komponen dan interaksi

- Seluruh komponen resmi shadcn untuk konfigurasi proyek telah diunduh ke `components/shadcn/`; komponen Coss sebelumnya tetap berada di `components/ui/`.
- Implementasi publik memakai Button, Accordion, Tabs, Alert, Input, Textarea, NativeSelect, dan Progress dari shadcn.
- Animasi masuk memakai AOS `fade-up` pada blok pengenalan, foto, visi, dan pilihan partisipasi. Satu gerakan 20 px, durasi 600 ms, easing `ease-out-cubic`, dan berjalan sekali. Penundaan antarblok dibatasi 100 ms.
- Hero dan foto kandidat langsung tampil statis. Tidak ada animasi per baris, parallax, tilt, tombol magnetik, atau indikator scroll yang bergerak.
- Tulisan latar “TUMBUH BERSAMA” tetap menjadi marquee CSS dengan arah berselang-seling, loop 110 detik, dan tombol jeda. Marquee berhenti ketika poster keluar layar, tab tidak aktif, keyboard digunakan, atau reduced motion aktif.
- JavaScript publik menggunakan AOS untuk reveal; komponen React Bits yang diunduh tetap tersedia sebagai sumber, tetapi tidak menjalankan animasi pada halaman.
- Isi tetap terlihat sebelum inisialisasi dan tanpa JavaScript. Reduced motion menampilkan konten secara langsung, termasuk ketika preferensi berubah saat halaman terbuka. Keyboard menampilkan semua blok tanpa transisi.
- Scroll dan disclosure tetap native. Input serta formulir tidak dianimasikan; pengukuran AOS diperbarui ketika tinggi halaman atau gambar berubah.
- Marquee testimoni memakai CSS, berhenti saat hover, fokus, tab tidak aktif, atau section keluar layar. Reduced motion dan tampilan tanpa JavaScript menyediakan kartu yang dapat digeser secara manual. Salinan untuk loop tidak dibacakan ulang oleh screen reader.
- Tab survei–aspirasi tetap terpasang saat berganti sehingga draft tidak hilang. Hash langsung membuka kanal yang sesuai; tombol panah mendukung perpindahan tab dengan keyboard.
- Formulir, hasil, dan agenda memakai disclosure native yang dapat dibuka dengan keyboard. Tautan hash membuka panel yang sesuai sebelum menggulir ke tujuan. Menutup panel tidak melepas formulir dari halaman.
- Formulir memiliki label, validasi, dan feedback pengiriman. Hasil dan agenda memakai status data yang sebenarnya.

## Pemeriksaan sebelum rilis

Periksa pembuka, misi terbuka, kedua kanal partisipasi, hasil, agenda, serta menu seluler pada 320, 390, 768, dan 1440 px. Pastikan fokus terlihat, anchor tidak tertutup header, draft tetap ada, foto berhasil dimuat, dan kondisi gagal kirim tidak menghapus isian.


## Hasil verifikasi implementasi

- TypeScript dan lint pada komponen yang diubah lulus.
- Build produksi lulus dengan `pnpm exec next build --webpack`. Build Turbopack default terhalang pembatasan port proses CSS di lingkungan lokal, dengan pesan `Operation not permitted`; fallback Webpack tidak mengubah konfigurasi build proyek.
- Sebelas tes Playwright lulus pada build produksi dengan browser Brave lokal dan backend fixture. Cakupannya termasuk draft antar-tab, keyboard tab, anchor, menu seluler, isi resmi visi–misi, survei, aspirasi, hasil, agenda, serta kegagalan koneksi. Dua tes tambahan memeriksa animasi aktif, perubahan reduced motion saat halaman terbuka, navigasi keyboard, dan tampilan tanpa JavaScript.
- Pemeriksaan tampilan lokal mencakup 320, 360, 390, 768, 1024, dan 1440 px tanpa overflow horizontal. Pembuka, profil, misi, panduan partisipasi, dan aspirasi diperiksa melalui screenshot.
- Kelima foto kegiatan DTSL hasil scraping berhasil dimuat dari aset lokal tanpa caption. Kolase desktop berubah susunan pada ponsel; foto kandidat juga tersedia di profil. Warna teks pendamping dan placeholder memakai `#4d607c` pada latar biru pucat. Header, menu seluler, poster, tombol, formulir, grafik, footer, dan favicon memakai token navy yang sama.

Pengujian ini memakai layanan dan data fixture lokal. Koneksi layanan produksi serta perangkat fisik tidak termasuk dalam verifikasi ini.
