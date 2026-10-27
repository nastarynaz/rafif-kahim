import Image from "next/image"

const photos = {
  campusHome: {
    src: "/media/reference/campus-home.jpg",
    alt: "Mahasiswa berkumpul di sekitar gedung KMTSL FT UGM",
    width: 1024,
    height: 631,
  },
  campusLab: {
    src: "/media/reference/campus-lab.jpeg",
    alt: "Mahasiswa mengamati material di laboratorium DTSL UGM",
    width: 1024,
    height: 768,
  },
  campusTogether: {
    src: "/media/reference/campus-together.jpg",
    alt: "Mahasiswa DTSL UGM berfoto bersama di ruang kampus",
    width: 1024,
    height: 461,
  },
  campusField: {
    src: "/media/reference/campus-field.jpg",
    alt: "Mahasiswa DTSL UGM mengikuti kunjungan belajar lapangan dengan perlengkapan keselamatan",
    width: 1024,
    height: 631,
  },
  campusLabGroup: {
    src: "/media/reference/campus-lab-group.jpg",
    alt: "Kunjungan mahasiswa di laboratorium struktur DTSL UGM",
    width: 1024,
    height: 631,
  },
}

export function CampaignReferencePhoto({
  kind,
  className = "",
  sizes,
}: {
  kind: keyof typeof photos
  className?: string
  sizes?: string
}) {
  const photo = photos[kind]
  return (
    <figure className={`p-reference-photo ${className}`} data-aos="fade-up">
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes ?? "(max-width: 600px) 100vw, 600px"}
      />
    </figure>
  )
}

export function CampaignPhotoGallery({
  variant,
}: {
  variant: "story" | "participation"
}) {
  const kinds =
    variant === "story"
      ? (["campusLabGroup", "campusLab"] as const)
      : (["campusHome", "campusTogether", "campusField"] as const)
  return (
    <div className={`p-campus-gallery p-campus-gallery-${variant}`}>
      {kinds.map((kind) => (
        <CampaignReferencePhoto
          key={kind}
          kind={kind}
          sizes={
            variant === "story"
              ? "(max-width: 600px) 100vw, 750px"
              : "(max-width: 600px) 90vw, 440px"
          }
        />
      ))}
    </div>
  )
}
