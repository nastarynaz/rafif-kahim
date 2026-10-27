import type { MetadataRoute } from "next"
import { indexable, siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return indexable
    ? [{ url: `${siteUrl}/` }, { url: `${siteUrl}/privasi` }]
    : []
}
