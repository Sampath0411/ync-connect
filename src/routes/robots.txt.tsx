import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots/txt")({
  component: () => null,
  loader: async () => {
    const txt = `User-agent: *
Allow: /
Disallow: /auth
Disallow: /admin
Disallow: /dashboard

Sitemap: https://ync.community/sitemap.xml
`;
    return new Response(txt, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  },
});
