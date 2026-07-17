import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/gallery")({
  component: Gallery,
  head: () => ({
    meta: [
      { title: "Gallery — YNC" },
      { name: "description", content: "Moments from past YNC events and community activities." },
    ],
  }),
});

// Deterministic pseudo-random heights for masonry look
const items = Array.from({ length: 15 }, (_, i) => ({
  h: 220 + ((i * 73) % 180),
  hue: (i * 37) % 360,
  tag: ["Meetup", "Workshop", "Volunteer", "Summit"][i % 4],
}));

function Gallery() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Gallery"
        title="Moments |worth remembering|."
        subtitle="A visual diary of our community — meetups, workshops, volunteer days, and summits."
      />
      <div className="mx-auto max-w-6xl px-4">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
              className="break-inside-avoid glass rounded-2xl overflow-hidden relative group"
              style={{ height: it.h }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.22 ${it.hue}), oklch(0.78 0.14 ${(it.hue + 60) % 360}))`,
                }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition">
                <span className="px-3 py-1 rounded-full text-xs bg-black/40 backdrop-blur text-white">
                  {it.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
