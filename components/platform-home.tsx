import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Pause, Play, Plus } from "lucide-react"
import { Button } from "@/components/shadcn/button"

const candidates = [
  {
    id: "rafif",
    name: "Muhammad Rafif Thalib",
    nickname: "Rafif.",
    role: "Calon Ketua",
    photo: "/media/rapip-2.webp",
    profilePhoto: "/media/rapip-1.webp",
    focus:
      "Mengembalikan kepercayaan warga dan merawat KMTSL sebagai rumah perkembangan yang aman, suportif, dan humanis.",
    experience: [
      "Pengurus KMTSL FT UGM — Anggota Bidang 3: Advokasi dan PSDM",
      "Penanggung Jawab Sementara KMTSL FT UGM — Sekretaris Jenderal",
      "Open Recruitment Raya KMTSL 2025/2026 — Ketua",
      "13th Civil In Action — Divisi Acara Ceremony",
      "APECX 2026 — Staf Event",
    ],
    instagram: "rafifth",
    linkedin: "https://www.linkedin.com/in/muhammad-rafif-thalib-956b81351/",
  },
  {
    id: "dewa",
    name: "Dewa Ngakan Nyoman T. S.",
    nickname: "Dewa.",
    role: "Calon Sekretaris Jenderal",
    photo: "/media/dewa-2.webp",
    profilePhoto: "/media/dewa-1.webp",
    focus:
      "Membangun mekanisme internal yang efektif dan adaptif, supaya setiap potensi terakomodasi dan keluarga KMTSL berkembang terarah.",
    experience: [
      "Pengurus KMTSL FT UGM — Anggota Bidang 2: Pendidikan dan Pengembangan Prestasi",
      "Civil Foundation — Divisi Humas Publikasi",
      "Pengurus KMHD UGM — Kepala Departemen Humas dan Publikasi",
      "14th Civil In Action — Ketua Subevent FCEC",
      "13th Civil In Action — Divisi Acara",
    ],
    instagram: "dewa.tantraa",
    linkedin: "https://www.linkedin.com/in/dewatantra/",
  },
]

export function PlatformHome() {
  return (
    <>
      <section
        id="beranda"
        className="p-landing-section"
        data-nav-section="kenali"
        tabIndex={-1}
      >
        <div className="p-container p-poster-wrap">
          <div className="p-campaign-poster">
            <div className="p-poster-pattern" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index}>
                  <span className="p-poster-track">
                    <span className="p-poster-run">
                      TUMBUH BERSAMA TUMBUH BERSAMA
                    </span>
                    <span className="p-poster-run">
                      TUMBUH BERSAMA TUMBUH BERSAMA
                    </span>
                  </span>
                </span>
              ))}
            </div>
            <button
              type="button"
              className="p-poster-motion-toggle"
              aria-label="Jeda teks latar"
              aria-pressed="false"
              title="Jeda teks latar"
            >
              <Pause size={15} aria-hidden="true" />
              <Play size={15} aria-hidden="true" />
            </button>
            <div className="p-poster-kicker">
              <span>RAFIF — DEWA</span>
              <span>KMTSL FT UGM · 2026/2027</span>
            </div>
            <h1 className="p-poster-title">
              <span>Rumah untuk</span>
              <strong>
                <span className="p-poster-word">TUMBUH</span>
                <span className="p-poster-word">BERSAMA.</span>
              </strong>
            </h1>
            {candidates.map((candidate) => (
              <figure
                className={`p-poster-person p-person-${candidate.id}`}
                key={candidate.id}
              >
                <Image
                  src={candidate.photo}
                  alt={`${candidate.name}, ${candidate.role} KMTSL`}
                  width={712}
                  height={475}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(max-width: 600px) 620px, (max-width: 1000px) 780px, 1050px"
                />
                <figcaption>
                  <strong>{candidate.nickname.replace(".", "")}</strong>
                  <span>{candidate.role}</span>
                </figcaption>
              </figure>
            ))}
            <span className="p-poster-signature">
              SELARAS DALAM LANGKAH, BERSAMA DALAM KARYA.
            </span>
          </div>
          <div className="p-poster-invitation">
            <span className="p-section-index">SAMANVAYA SAHAKARA</span>
            <h2>Rumah ini, kita bangun bersama.</h2>
            <p>
              Mulai dengan mengenal kami. Lalu, ceritakan KMTSL yang kamu
              harapkan.
            </p>
            <Button asChild className="p-button">
              <Link href="/#kenali">
                Kenali Rafif & Dewa <ArrowRight size={18} />
              </Link>
            </Button>
            <Link className="p-text-link" href="/#aspirasi">
              Aku ingin bersuara <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section
        id="kenali"
        className="p-landing-section p-candidates-section"
        data-nav-section="kenali"
        aria-labelledby="kenali-heading"
        tabIndex={-1}
      >
        <div className="p-container p-candidates-layout">
          <div data-aos="fade-up">
            <span className="p-section-index">01 / KENALI KAMI</span>
            <h2 id="kenali-heading">
              Dua peran.
              <br />
              <em>Satu komitmen.</em>
            </h2>
            <p>Buka profil untuk mengenal fokus dan pengalaman kami.</p>
          </div>
          <div
            className="p-candidate-list"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {candidates.map((candidate) => (
              <details className="p-candidate-details" key={candidate.id}>
                <summary>
                  <Image
                    className="p-candidate-profile-photo"
                    src={candidate.profilePhoto}
                    alt=""
                    width={712}
                    height={475}
                    sizes="(max-width: 600px) 88px, 144px"
                  />
                  <div>
                    <span>{candidate.role}</span>
                    <h3>{candidate.name}</h3>
                  </div>
                  <Plus className="p-details-plus" size={20} />
                </summary>
                <div className="p-candidate-bio">
                  <p>{candidate.focus}</p>
                  <h4>Pengalaman organisasi</h4>
                  <ul>
                    {candidate.experience.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="p-candidate-socials">
                    <a
                      className="p-text-link"
                      href={`https://www.instagram.com/${candidate.instagram}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{candidate.instagram} <ArrowUpRight size={16} />
                    </a>
                    <a
                      className="p-text-link"
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`LinkedIn ${candidate.nickname.replace(".", "")}`}
                    >
                      LinkedIn <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
