import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap/xml")({
  component: () => null,
  loader: async () => {
    const base = "https://ync.community";
    const pages = [
      "",
      "/about",
      "/membership",
      "/events",
      "/gallery",
      "/contact",
      "/auth",
    ];

    const urls = pages
      .map(
        (p) => `  <url>
    <loc>${base}${p}</loc>
    <changefreq>${p === "" ? "weekly" : "monthly"}</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
  </url>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
      },
    });
  },
});
