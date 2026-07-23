import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/site/PageShell";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms of Service — YNC" },
      {
        name: "description",
        content: "Terms and conditions for using YNC — Youth Network Community.",
      },
    ],
  }),
});

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account and using YNC (Youth Network Community), you agree to these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "Membership",
    body: "Membership is granted on an approval basis. We reserve the right to approve, reject, or revoke membership at our discretion. Membership is valid for one year from the approval date unless otherwise stated.",
  },
  {
    title: "Events & Tickets",
    body: "Event tickets are non-transferable unless explicitly stated. We reserve the right to cancel or reschedule events. In such cases, ticket holders will be notified and offered a refund or alternative arrangement.",
  },
  {
    title: "Code of Conduct",
    body: "All members agree to treat others with respect, kindness, and dignity. Harassment, discrimination, or disruptive behavior will result in immediate removal from the community and revocation of membership without refund.",
  },
  {
    title: "Limitation of Liability",
    body: "YNC provides its services on an 'as is' basis. We are not liable for any damages arising from your use of our platform, attendance at events, or interactions with other members.",
  },
  {
    title: "Changes to Terms",
    body: "We may update these terms at any time. Members will be notified of significant changes via email or announcement. Continued use after changes constitutes acceptance of the new terms.",
  },
];

function Terms() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms of |Service|."
        subtitle="Please read these terms carefully before using YNC."
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
