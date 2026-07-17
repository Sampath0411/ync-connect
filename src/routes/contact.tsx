import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — YNC" },
      { name: "description", content: "Get in touch with the YNC team." },
    ],
  }),
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Let's |talk|."
        subtitle="Questions, partnerships, or just want to say hello? We'd love to hear from you."
      />

      <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", value: "hello@ync.community" },
            { icon: Phone, title: "Phone", value: "+91 98765 43210" },
            { icon: MapPin, title: "Office", value: "YNC Hub, Bengaluru" },
          ].map((c) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</p>
                <p className="font-medium truncate">{c.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="lg:col-span-2 glass rounded-3xl p-8 space-y-4"
        >
          {sent ? (
            <div className="text-center py-16">
              <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
              <p className="mt-4 font-display text-2xl font-bold">Thanks — we'll be in touch!</p>
              <p className="mt-2 text-muted-foreground">
                We usually respond within 24 hours on business days.
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" placeholder="Your name" />
                <Field label="Email" type="email" placeholder="you@email.com" />
              </div>
              <Field label="Subject" placeholder="How can we help?" />
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tell us a bit more…"
                  className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <button
                type="submit"
                className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
              >
                Send message <Send className="h-4 w-4" />
              </button>
            </>
          )}
        </motion.form>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
      />
    </div>
  );
}
