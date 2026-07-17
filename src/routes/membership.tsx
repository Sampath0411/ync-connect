import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/membership")({
  component: Membership,
  head: () => ({
    meta: [
      { title: "Membership — YNC" },
      { name: "description", content: "Free membership for a limited period. One year of premium community access." },
    ],
  }),
});

const perks = [
  "Discounted tickets on every YNC event",
  "Digital membership card with QR verification",
  "Early access to workshops and activities",
  "Volunteer & leadership program access",
  "Priority invitations to community meetups",
  "Recognition badges and achievement tracks",
  "Exclusive member-only announcements",
  "One-year validity from approval date",
];

function Membership() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Free for a limited period"
        title="One membership. |A full year| of belonging."
        subtitle="Join the YNC family with a completely free membership. Approval-based, one-year validity, and premium benefits from day one."
      />

      <section className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent">
                  YNC Membership
                </p>
                <p className="mt-2 font-display text-5xl sm:text-6xl font-bold">
                  <span className="line-through text-muted-foreground text-3xl mr-3">₹999</span>
                  <span className="gradient-text">Free</span>
                </p>
                <p className="mt-2 text-muted-foreground">
                  Valid 12 months from your approval date.
                </p>
              </div>
              <Link
                to="/join"
                className="glow-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
              >
                Join Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-3">
              {perks.map((p) => (
                <div key={p} className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:bg-white/5 transition">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3 text-center">
          {[
            { n: "01", t: "Register", d: "Create your free account and verify your email." },
            { n: "02", t: "Apply", d: "Complete your profile and submit membership request." },
            { n: "03", t: "Get approved", d: "Receive your digital card, valid for 12 months." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass rounded-2xl p-6"
            >
              <p className="font-display text-4xl font-bold gradient-text">{s.n}</p>
              <p className="mt-2 font-semibold">{s.t}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
