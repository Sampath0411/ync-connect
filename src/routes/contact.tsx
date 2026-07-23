import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/community.functions";
import { toast } from "sonner";

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
  const contactFn = useServerFn(submitContactMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    try {
      await contactFn({
        data: { name, email, subject: subject.trim() || undefined, message },
      });
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

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

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 glass rounded-3xl p-10 text-center"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
            <p className="mt-4 font-display text-2xl font-bold">Thanks — we'll be in touch!</p>
            <p className="mt-2 text-muted-foreground">
              We usually respond within 24 hours on business days.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="lg:col-span-2 glass rounded-3xl p-8 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium" htmlFor="contact-name">Full name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us a bit more…"
                className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        )}
      </div>
    </PageShell>
  );
}
