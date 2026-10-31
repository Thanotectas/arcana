import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/cuenta", "/lecturas", "/creditos", "/correos", "/auth", "/en-vivo/escenario", "/c/", "/r/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
