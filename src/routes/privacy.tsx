import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — YNC" },
      {
        name: "description",
        content: "How YNC collects, uses, and protects your personal data.",
      },
    ],
  }),
});

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide when creating an account: name, email, phone number, date of birth, city, and optional social media handles. We also collect event attendance data and ticket purchase history.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is used to manage your membership, process event bookings, verify attendance via QR codes, send community announcements, and improve our services. We do not sell your personal information to third parties.",
  },
  {
    title: "Data Storage & Security",
    body: "Your data is stored securely using industry-standard encryption. We use Supabase for database management with strict access controls. Payment data (if enabled) is handled by Stripe/Paddle and never stored on our servers.",
  },
  {
    title: "Cookies",
    body: "We use minimal functional cookies to maintain your session and remember your theme preference. No third-party tracking cookies are used without your explicit consent.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can also download your membership card and ticket data from your dashboard.",
  },
  {
    title: "Contact",
    body: "For privacy-related inquiries, email us at hello@ync.community or visit our contact page. We respond within 48 hours on business days.",
  },
];

function Privacy() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy |Policy|."
        subtitle="How we handle your data — transparently and securely."
      />
      <section className="mx-auto max-w-4xl px-4 space-y-6 pb-16">
        {sections.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
        <p className="text-xs text-muted-foreground text-center">
          Last updated: July 2026. Questions?{" "}
          <a href="/contact" className="text-accent hover:underline">
            Contact us
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
