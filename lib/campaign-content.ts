import { officialMissions, officialVision } from "./platform-content"

// Legacy components share the official source with the current platform.
// Program proposals below remain illustrative, not claims of completed work.
export const vision = officialVision
export const missions = officialMissions.map((mission, i) => ({
  id: ["komunikasi", "tata-kelola", "sinergi", "solidaritas", "relasi"][i],
  number: String(i + 1).padStart(2, "0"),
  title: mission.title,
  text: mission.text,
}))

export const candidates = [
  {
    name: "Muhammad Rafif Thalib",
    short: "Rafif",
    initials: "RF",
    role: "Calon Ketua KMTSL",
    focus: "Mendengar lebih dekat. Menggerakkan bersama.",
    description:
      "Dalam konsep ini, ketua himpunan menjaga arah bersama: membuka percakapan, mempertemukan gagasan, dan memastikan kebutuhan anggota menjadi dasar keputusan.",
    linkedin: "https://www.linkedin.com/in/muhammad-rafif-thalib-956b81351/",
  },
  {
    name: "Dewa Ngakan Nyoman T. S.",
    short: "Dewa",
    initials: "DW",
    role: "Calon Sekretaris Jenderal",
    focus: "Merawat proses. Menjaga langkah tetap jelas.",
    description:
      "Dalam konsep ini, sekretaris jenderal merawat cara kerja: menyambungkan koordinasi, merapikan dokumentasi, dan membuat tindak lanjut mudah ditelusuri bersama.",
    linkedin: "https://www.linkedin.com/in/dewatantra/",
  },
]

export const programs = [
  {
    id: "dengar",
    number: "01",
    label: "Didengar",
    title: "Ada ruang untuk setiap suara.",
    intro:
      "Aspirasi layak mendapat jawaban. Kami mengusulkan ruang dengar dengan alur tindak lanjut yang bisa dipantau.",
    items: [
      {
        title: "Ruang Dengar",
        mission: "01",
        description:
          "Forum percakapan terbuka dan kanal aspirasi tertulis. Anggota dapat menyampaikan kebutuhan, mengusulkan perbaikan, atau bertanya tanpa harus menunggu forum besar.",
        output:
          "Usulan hasil: rangkuman isu, penanggung jawab, dan status tindak lanjut tanpa membuka identitas pengirim.",
      },
      {
        title: "Kabar Advokasi",
        mission: "01",
        description:
          "Informasi akademik dan kesejahteraan mahasiswa dihimpun dalam satu tempat dengan sumber serta tanggal pembaruan yang jelas.",
        output:
          "Usulan hasil: papan informasi terverifikasi dan rujukan kanal bantuan yang relevan.",
      },
    ],
  },
  {
    id: "tumbuh",
    number: "02",
    label: "Bertumbuh",
    title: "Belajar terasa lebih dekat.",
    intro:
      "Dari tugas pertama sampai langkah setelah kuliah, pengetahuan akan lebih berarti ketika dibagikan.",
    items: [
      {
        title: "Teman Tumbuh",
        mission: "04",
        description:
          "Pertemuan belajar lintas angkatan berdasarkan kebutuhan peserta, dengan fasilitator sebaya dan jadwal yang disepakati bersama.",
        output:
          "Usulan hasil: sesi belajar, catatan bersama, serta evaluasi manfaat dari peserta.",
      },
      {
        title: "Jendela Profesi",
        mission: "05",
        description:
          "Percakapan tentang dunia sipil dan lingkungan bersama alumni atau praktisi. Topik dipilih dari pertanyaan anggota; narasumber perlu dikonfirmasi.",
        output:
          "Usulan hasil: rangkuman wawasan profesi dan bahan persiapan yang bisa diakses kembali.",
      },
    ],
  },
  {
    id: "gerak",
    number: "03",
    label: "Bergerak",
    title: "Gagasan bertemu tindakan.",
    intro:
      "Kolaborasi dimulai dari persoalan yang dekat, dengan ruang bagi anggota untuk ikut merancang solusinya.",
    items: [
      {
        title: "Ruang Kolaborasi",
        mission: "03",
        description:
          "Anggota membawa ide kegiatan atau proyek kecil, lalu menemukan rekan lintas minat untuk menyusun tujuan, kebutuhan, dan pembagian peran.",
        output:
          "Usulan hasil: proposal bersama yang dinilai berdasarkan manfaat dan kelayakan sumber daya.",
      },
      {
        title: "Jejak Kerja Terbuka",
        mission: "02",
        description:
          "Perkembangan program dirangkum secara berkala: apa yang selesai, apa yang tertunda, dan apa yang perlu diperbaiki.",
        output:
          "Usulan hasil: catatan kemajuan serta evaluasi yang dapat dibaca dan ditanggapi anggota.",
      },
    ],
  },
]

export const faqs = [
  {
    question: "Apakah ini sudah menjadi program resmi?",
    answer:
      "Visi dan lima misi di halaman ini bersumber dari naskah yang diberikan tim. Nama serta rincian program masih berupa gagasan awal untuk dibahas. Target, jadwal, dan sumber daya pelaksanaannya belum ditetapkan.",
  },
  {
    question: "Kapan dan bagaimana pemilihannya?",
    answer:
      "Jadwal, nomor urut, persyaratan pemilih, serta mekanisme pemilihan belum dicantumkan karena belum tersedia informasi resmi dari penyelenggara. Bagian ini akan diperbarui setelah dikonfirmasi.",
  },
  {
    question: "Apakah aspirasi di sini langsung diterima tim?",
    answer:
      "Belum. Pada versi demo ini, kamu bisa menyusun dan mengunduh catatan aspirasi. Isinya hanya diproses di halaman ini, tidak dikirim ke server atau tim kampanye, dan akan hilang saat halaman dimuat ulang.",
  },
]
