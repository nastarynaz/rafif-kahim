import type { Metadata } from "next"
import { AdminPage } from "@/components/platform-admin"
export const metadata: Metadata = {
  title: "Admin | Rafif–Dewa",
  robots: { index: false, follow: false },
}
export default function Page() {
  return <AdminPage />
}
