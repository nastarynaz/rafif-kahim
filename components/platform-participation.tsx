import Link from "next/link"
import { CampaignPhotoGallery } from "./campaign-reference-photo"
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  Clock3,
  LockKeyhole,
  MessageCircle,
} from "lucide-react"

export function ParticipationGuide() {
  return (
    <div className="p-participation-guide">
      <div className="p-container">
        <div className="p-participation-heading" data-aos="fade-up">
          <div>
            <span className="p-section-index">03 / IKUT BERSUARA</span>
            <h2>
              Suaramu, <em>mulai dari sini.</em>
            </h2>
          </div>
          <p>
            Pilih yang sesuai kebutuhanmu. Boleh salah satu, boleh keduanya.
          </p>
        </div>
        <CampaignPhotoGallery variant="participation" />
        <div
          className="p-participation-options"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <Link href="/#survei" className="p-participation-option">
            <ChartNoAxesColumnIncreasing size={28} strokeWidth={1.5} />
            <div>
              <span>INGIN MENILAI PENGALAMAN?</span>
              <h3>Isi survei warga</h3>
              <p>
                Nilai 10 aspek kehidupan KMTSL. Jawaban dirangkum dalam hasil
                bersama.
              </p>
              <span className="p-option-meta">
                <Clock3 size={14} /> 3–5 menit · 20 pertanyaan
              </span>
              <span className="p-option-action">
                Mulai survei <ArrowRight size={17} />
              </span>
            </div>
          </Link>
          <Link href="/#aspirasi" className="p-participation-option">
            <MessageCircle size={28} strokeWidth={1.5} />
            <div>
              <span>ADA CERITA ATAU MASUKAN?</span>
              <h3>Kirim aspirasi</h3>
              <p>
                Sampaikan gagasan, keluhan, atau apresiasi lewat pesan pribadi.
              </p>
              <span className="p-option-meta">
                <LockKeyhole size={14} /> Privat · Identitas opsional
              </span>
              <span className="p-option-action">
                Tulis ceritamu <ArrowRight size={17} />
              </span>
            </div>
          </Link>
        </div>
        <Link href="/#hasil" className="p-text-link p-participation-results">
          Ingin lihat hasilnya dulu? <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}
