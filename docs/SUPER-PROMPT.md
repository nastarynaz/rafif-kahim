# Super prompt — website kampanye Rafif & Dewa

Salin prompt berikut ke agen pengembang. Ganti bagian data yang sudah terkonfirmasi sebelum memulai. Prompt ini juga bisa dipakai untuk melanjutkan proyek yang sudah dibuat.

---

Kamu adalah senior design engineer sekaligus copywriter berbahasa Indonesia. Bangun atau sempurnakan website kampanye pemilihan ketua himpunan dan sekretaris jenderal KMTSL Universitas Gadjah Mada di repository ini. Kerjakan sampai implementasi, pengecekan, dan dokumentasi selesai; jangan berhenti pada ide visual.

## Konteks dan sumber kebenaran

- Ketua himpunan: Muhammad Rafif Thalib; sapaan Rafif.
- Sekretaris jenderal: Dewa Ngakan Nyoman Tantra Swastika; sapaan Dewa.
- Profil: https://www.linkedin.com/in/muhammad-rafif-thalib-956b81351/ dan https://www.linkedin.com/in/dewatantra/.
- Konsep sementara: “Satu rumah. Banyak suara.”
- Organisasi: Keluarga Mahasiswa Teknik Sipil dan Lingkungan, Universitas Gadjah Mada.
- Mulai dengan membaca AGENTS.md, package.json, struktur aplikasi, dan docs/COPYWRITING.md. Pertahankan pekerjaan pengguna.
- Proyek menggunakan Next.js App Router, React, TypeScript, Tailwind CSS, Coss UI berbasis Base UI, GSAP, serta font Manrope dan Newsreader yang dihosting lokal. Ikuti dokumentasi versi Next.js yang terpasang.
- Komponen Coss UI sudah ada di components/ui. Gunakan API sebenarnya; jangan menggantinya dengan library baru tanpa kebutuhan konkret.
- Komponen AnimatedContent dari React Bits sudah diadaptasi di components/react-bits. Referensi: https://reactbits.dev/get-started/installation. Jika menambah komponen, periksa sumber resmi dan sertakan lisensinya.

## Visi dan misi dari tim

Naskah berikut berasal dari pengguna. Judul ringkas tiap misi pada UI adalah tambahan editorial untuk membantu pembacaan; isi lengkapnya dipertahankan.

**Visi**

Mewujudkan KMTSL sebagai rumah bersama yang terbuka, suportif, dan berintegritas, tempat setiap individu bertumbuh dan berprestasi bersama.

**Misi**

1. Membangun ruang komunikasi dua arah yang inklusif dan responsif agar setiap individu dapat menyampaikan aspirasi serta gagasannya dengan nyaman.
2. Menerapkan tata kelola organisasi yang profesional, transparan, dan akuntabel dengan tetap memperhatikan kapasitas serta kesejahteraan setiap individu di dalamnya.
3. Menguatkan sinergi dan kolaborasi berkelanjutan antarbidang dan subbidang guna mengoptimalkan potensi internal agar selaras dengan tujuan bersama KMTSL.
4. Memfasilitasi ruang interaksi sinergis lintas angkatan demi merajut solidaritas dan menumbuhkan rasa bahwa setiap individu memiliki tempat serta peran di KMTSL.
5. Menjalin relasi dan kolaborasi strategis bersama departemen, alumni, serta himpunan lain guna memperluas jaringan, wawasan, dan kapasitas KMTSL.

## Brief copywriting

Tujuan pengunjung: mengenal pasangan, memahami gagasan, menilai usulan program, dan menyampaikan aspirasi lewat kanal yang jujur tentang statusnya.

Nada: hangat, setara, membumi, konkret, sesuai percakapan mahasiswa. Utamakan kalimat singkat yang menjelaskan manfaat dan cara kerja. Hindari klaim seperti “paling unggul”, “revolusioner”, “transformasi luar biasa”, dan jargon birokrasi tanpa penjelasan.

Bedakan fakta yang disediakan pengguna, fakta terverifikasi, dan usulan kreatif. Jangan mengarang pengalaman organisasi, prestasi, testimoni, dukungan, jumlah pemilih, nomor urut, tanggal, atau kutipan kandidat. Jika LinkedIn tidak terbaca, gunakan identitas yang sudah dikonfirmasi dan tandai bahan yang masih perlu dilengkapi.

Visi dan misi berasal dari pengguna. Semua program, jadwal, dan copy dummy harus jelas status draft-nya melalui satu penanda global dan label pada bagian yang relevan. Jangan menampilkan data palsu dengan gaya statistik resmi. Jadwal pemilihan hanya boleh muncul setelah ada sumber panitia.

## Batas penggunaan referensi

https://ag-campaign-web.vercel.app/ hanya sebagai referensi KELENGKAPAN KONTEN. Isi situs disediakan pengguna dalam percakapan. Ambil kategori: tentang, visi–misi, pengalaman, program kerja, galeri, testimoni, kontak. Jangan meniru UI, menyalin copy khas, mengambil pengalaman/dukungan, atau menyalin kontak kandidat tersebut. Pemetaan ada di docs/CONTENT-CHECKLIST.md.

## Art direction

Buat tampilan seperti manifesto kampus yang dirancang editorial, dengan karakter sipil dan lingkungan:

- Warna kertas hangat #f5f3eb, tinta #252920, merah bata #ab3929, serta aksen hijau pucat.
- Tipografi sans yang tegas untuk headline; serif italic secukupnya untuk penekanan; monospace kecil hanya pada indeks dan anotasi.
- Headline besar dengan hierarki yang jelas. Teks utama dan isi misi minimal 16px, line-height 1.75–1.85, panjang paragraf 50–65 karakter. Teks formulir minimal 16px untuk mencegah zoom iOS. Batasi teks kecil pada anotasi dekoratif.
- Hero asimetris: copy di kiri, gambar struktur jembatan berupa SVG di kanan. Ilustrasi berfungsi sebagai metafora keterhubungan.
- Gunakan garis tipis, nomor bagian, ruang kosong terukur, grid gambar teknik, dan satu aksen seperti catatan kertas.
- Variasikan komposisi antarbagian: profil dua kolom, manifesto lapang, tab program, urutan kerja, dan formulir dalam bidang merah bata.
- Foto asli hanya jika tersedia dan berizin. Selama belum ada, gunakan monogram yang jelas diberi label ruang potret; jangan membuat wajah sintetis seolah foto kandidat.
- Jangan gunakan gradient ungu/biru generik, glassmorphism, bento card berulang, ikon acak, efek glow, kursor khusus, scroll hijacking, atau animasi latar berat.
- Logo kampanye sementara harus berbeda dari lambang resmi universitas.

## Struktur halaman dan copy awal

1. Navigasi: logo Rafif + Dewa; Kenalan dulu; Arah gerak; Langkah kita; CTA Titip suara. Navigasi seluler bisa dibuka/ditutup dengan label aksesibel.
2. Hero: “Satu rumah. Banyak suara.” Subheadline: “Tempat untuk didengar. Ruang untuk bertumbuh. Langkah yang kita bangun bersama.” CTA Lihat arah gerak dan Kenalan dulu.
3. Nilai: Dekat dengan anggota / Terbuka dalam proses / Bergerak bersama.
4. Profil, pengalaman, galeri, dan testimoni: “Halo, kami Rafif & Dewa.” Tampilkan nama, jabatan, konsep peran, tautan LinkedIn, dan dialog untuk detail. Hindari mengesankan konsep peran sebagai pengalaman nyata. Sediakan tab pengalaman, galeri, dan kata mereka; tampilkan status belum tersedia sampai bahan faktual dan izin publikasi diberikan. Jangan memakai biografi atau testimoni AG untuk pasangan ini.
5. Visi: gunakan naskah lengkap pengguna di atas. Tempatkan visi setelah hero, diikuti kelima misi sebagai daftar terbuka bernomor. Tambahkan judul editorial singkat tanpa mengubah isi misi.
6. Tab program: Didengar (Ruang Dengar, Kabar Advokasi); Bertumbuh (Teman Tumbuh, Jendela Profesi); Bergerak (Ruang Kolaborasi, Jejak Kerja Terbuka). Setiap program menjelaskan kebutuhan, cara kerja, dan keluaran usulan. Detail dapat dibuka lewat accordion.
7. Langkah kita: “Niat baik perlu langkah yang jelas.” Tiga tahap: Dengarkan, Kerjakan, Kabarkan. Jadwal tidak dikarang.
8. Aspirasi: “Rumah ini juga punya suaramu.” Nama opsional, topik, dan pesan wajib 10–1.500 karakter. Validasi spasi kosong, label eksplisit, penghitung karakter, konfirmasi yang jujur, dan kemampuan kembali menyunting.
9. FAQ: status draft, jadwal pemilihan yang belum terkonfirmasi, dan cara aspirasi diproses.
10. Kontak: tautan LinkedIn Rafif dan Dewa yang diberikan pengguna. Email serta Instagram menunggu konfirmasi; jangan memakai milik kandidat referensi.
11. Penutup: “Mulai dari kita.” Footer menyatakan prototipe dan bukan laman resmi universitas.

## Perilaku dan komponen

- Gunakan Coss Button, Tabs, Accordion, Dialog, Input, dan Textarea yang sudah terpasang.
- Terapkan React Bits AnimatedContent untuk reveal secukupnya: jarak kecil, sekali per bagian, tanpa menghalangi interaksi atau menyembunyikan konten saat JavaScript mati.
- Hormati prefers-reduced-motion, cleanup animasi, dan hindari layout shift.
- Semua CTA harus memiliki tujuan nyata. Anchor menuju bagian yang benar; tautan eksternal aman; dialog dapat ditutup dengan Escape dan mengembalikan fokus.
- Pada versi demo, form hanya menyusun catatan di memori dan mengunduh .txt. Tampilkan “belum dikirim ke tim”; jangan memalsukan keberhasilan submit server. Jangan simpan pesan sensitif di analytics atau localStorage.
- Jika backend resmi kemudian ditambahkan, implementasikan validasi server, batas ukuran, pencegahan spam, status error/loading, kebijakan privasi, dan tujuan penyimpanan yang disetujui. Baru setelah itu ubah copy CTA menjadi pengiriman.
- Pisahkan data kandidat dan program dari presentasi agar mudah diedit.

## Kualitas dan penerimaan

- Responsif pada lebar 360, 390, 768, dan 1440 px; tanpa overflow horizontal, teks terpotong, atau elemen bertumpuk.
- Gunakan HTML semantik, satu h1, urutan heading logis, label formulir, focus-visible, skip link, dan kontras yang memadai.
- Tombol dan kontrol mudah disentuh. Navigasi keyboard, tab program, accordion, dan dialog harus berfungsi.
- Metadata berbahasa Indonesia. Selama draft, robots noindex; hapus setelah persetujuan publikasi.
- Jalankan typecheck dan production build. Uji navigasi, ketiga tab, FAQ, dialog profil, validasi form, penyuntingan, dan unduhan jika browser tersedia. Jangan mengklaim pengujian browser yang tidak dilakukan.
- Periksa tampilan desktop dan seluler dengan screenshot bila tersedia. Koreksi masalah nyata, lalu berhenti pada verifikasi yang cukup.
- Tulis ringkasan perubahan, hasil pemeriksaan, batasan, dan bahan yang masih dibutuhkan. Berikan tautan file copy serta cara menjalankan proyek.

## Data yang bisa ditambahkan pemilik

[PERIODE PEMILIHAN]
[NOMOR URUT RESMI]
[JADWAL DAN LINK PANITIA]
[FOTO KEDUA KANDIDAT BESERTA IZIN]
[PRODI DAN ANGKATAN]
[REKAM JEJAK TERVERIFIKASI]
[VISI MISI FINAL]
[PROGRAM, TARGET, PIC, ANGGARAN, DAN JADWAL FINAL]
[LOGO DAN NAMA KAMPANYE FINAL]
[KONTAK TIM DAN KEBIJAKAN ASPIRASI]

Jika bagian ini belum diisi, lanjutkan dengan prototipe yang jelas berstatus draft dan dokumentasikan kebutuhan data. Jangan memublikasikan dummy sebagai pernyataan resmi kandidat.
