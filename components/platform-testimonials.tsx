"use client"

import { useEffect, useRef } from "react"
import { Quote } from "lucide-react"

const demoTestimonials = [
  {
    name: "Aditya Pratama",
    role: "Rekan organisasi",
    message:
      "Yang paling terasa dari Rafif adalah kesediaannya mendengar. Diskusi jadi lebih terbuka, dan setiap orang punya kesempatan menyampaikan pendapat.",
  },
  {
    name: "Nadia Putri",
    role: "Teman satu kepanitiaan",
    message:
      "Dewa bisa membuat pekerjaan yang rumit terasa lebih terarah. Pembagian tugasnya jelas, tapi tetap ada ruang untuk saling bantu dan belajar bareng.",
  },
  {
    name: "Raka Mahendra",
    role: "Rekan kegiatan mahasiswa",
    message:
      "Buat saya, pemimpin yang baik hadir saat dibutuhkan. Rafif dan Dewa menunjukkan itu lewat cara mereka mendampingi tim dan mencari jalan keluar bersama.",
  },
  {
    name: "Alya Safitri",
    role: "Teman diskusi",
    message:
      "Senang bisa berdiskusi tanpa merasa sungkan. Gagasan kecil pun ditanggapi dengan serius. Semoga ruang seperti ini bisa dirasakan lebih banyak warga KMTSL.",
  },
  {
    name: "Fikri Ramadhan",
    role: "Rekan organisasi",
    message:
      "Keduanya punya cara kerja yang saling melengkapi. Ada kepedulian pada orang-orangnya, sekaligus perhatian pada langkah nyata yang perlu dikerjakan.",
  },
]

function TestimonialCards({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className="p-testimonial-group"
      aria-hidden={duplicate ? true : undefined}
    >
      {demoTestimonials.map((review) => (
        <figure className="p-testimonial-card" key={review.name}>
          <div className="p-testimonial-avatar" aria-hidden="true">
            {review.name
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")}
          </div>
          <figcaption>
            <h3>{review.name}</h3>
            <span>{review.role}</span>
          </figcaption>
          <Quote className="p-testimonial-quote" size={26} aria-hidden="true" />
          <blockquote>
            <p>{review.message}</p>
          </blockquote>
        </figure>
      ))}
    </div>
  )
}

export function PlatformTestimonials() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let visible = false
    const update = () => {
      root.dataset.running = String(visible && !document.hidden)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    observer.observe(root)
    root.dataset.enhanced = "true"
    document.addEventListener("visibilitychange", update)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", update)
      delete root.dataset.enhanced
      delete root.dataset.running
    }
  }, [])

  return (
    <section
      id="testimoni"
      className="p-landing-section p-testimonials"
      aria-labelledby="testimoni-heading"
      tabIndex={-1}
      ref={rootRef}
    >
      <div className="p-container p-testimonials-heading" data-aos="fade-up">
        <h2 id="testimoni-heading">Apa Kata Mereka</h2>
        <p>Cerita dari teman-teman yang pernah berproses bersama.</p>
      </div>
      <div
        className="p-testimonial-viewport"
        tabIndex={0}
        role="region"
        aria-label="Testimoni teman-teman. Fokuskan area ini untuk menghentikan gerakan."
      >
        <div className="p-testimonial-track">
          <TestimonialCards />
          <TestimonialCards duplicate />
        </div>
      </div>
    </section>
  )
}
