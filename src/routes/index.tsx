import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  Users,
  Ticket,
  Award,
  Heart,
  Zap,
  Sparkles,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Rocket,
  Mail,
  MapPin,
  Camera,
  Send,
  Loader2,
} from "lucide-react";
import { EventCardSkeleton } from "@/components/ui/skeleton";
import { listPublicEvents, submitContactMessage } from "@/lib/community.functions";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "YNC — Youth Network Community" },
      {
        name: "description",
        content:
          "Join a growing youth movement. Free membership for a limited period, exclusive events, mentorship, and community.",
      },
    ],
  }),
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
} as const;

function Landing() {
  if (typeof window !== "undefined") {
    // scroll to hash on mount
    setTimeout(() => {
      const h = window.location.hash.replace("#", "");
      if (h) document.getElementById(h)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
  return (
    <div>
      <section id="home"><Hero /></section>
      <Stats />
      <section id="about"><About /></section>
      <section id="membership"><Membership /></section>
      <section id="events"><EventsSection /></section>
      <section id="gallery"><Gallery /></section>
      <Features />
      <section id="contact"><Contact /></section>
      <CTA />
    </div>
  );
}


function Hero() {
  return (
    <div className="relative pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
          Free membership — limited period
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.98]"
        >
          Youth Network
          <br />
          <span className="gradient-text">Community</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Be part of a growing youth movement. Attend premium events,
          volunteer, lead, and build lifelong connections with people who care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/auth"
            className="glow-btn group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
          >
            Join Community
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#events"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass hover:bg-white/10 transition font-medium"
          >
            Explore Events
          </a>
        </motion.div>
      </div>
    </div>
  );
}

const stats = [
  { value: "12k+", label: "Community members" },
  { value: "240+", label: "Events hosted" },
  { value: "48", label: "Cities reached" },
  { value: "96%", label: "Would recommend" },
];

function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <motion.div {...fadeUp} className="glass rounded-3xl px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl sm:text-4xl font-bold gradient-text">{s.value}</p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-accent">About YNC</p>
        <h2 className="mt-3 text-4xl sm:text-5xl font-bold">
          A community <span className="gradient-text">built for young leaders</span>.
        </h2>
        <p className="mt-5 text-muted-foreground text-lg">
          YNC is a movement of curious, ambitious, and kind young people. We host meetups, workshops
          and volunteer drives — and we make sure every member finds their people, their mentors,
          and their next opportunity.
        </p>
      </motion.div>
      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Rocket, title: "Our mission", body: "Empower youth through community, events, and mentorship." },
          { icon: Heart, title: "Our values", body: "Kindness, curiosity, courage, and consistency." },
          { icon: Users, title: "Our people", body: "Students, creators, founders, volunteers — all welcome." },
        ].map((it) => (
          <motion.div key={it.title} {...fadeUp} className="glass rounded-2xl p-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <it.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 font-semibold">{it.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Membership() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div {...fadeUp}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Free for a limited period
          </div>
          <h2 className="mt-5 text-4xl sm:text-5xl font-bold leading-tight">
            Membership that <span className="gradient-text">unlocks everything.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Every membership is valid for one full year from the approval date.
            Get discounted event tickets, a digital membership card, early
            access, and exclusive community opportunities.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Discounted tickets on every event",
              "Personal digital membership card with QR",
              "Early access to workshops & activities",
              "Volunteer & leadership programs",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white text-xs">
                  ✓
                </span>
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Link
              to="/auth"
              className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            >
              Join Membership <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative">
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Membership</p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    <span className="line-through text-muted-foreground text-xl mr-2">₹999</span>
                    <span className="gradient-text">Free</span>
                  </p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Limited period. 1-year validity from approval.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Ticket, label: "Ticket discounts" },
                  { icon: Calendar, label: "Early access" },
                  { icon: Award, label: "Recognition" },
                  { icon: Heart, label: "Volunteer perks" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-2xl border border-border p-4 hover:bg-white/5 transition">
                    <Icon className="h-5 w-5 text-accent" />
                    <p className="mt-2 text-sm font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EventsSection() {
  const eventsFn = useServerFn(listPublicEvents);
  const q = useQuery({ queryKey: ["public-events"], queryFn: () => eventsFn() });
  const events = (q.data ?? []).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <motion.div {...fadeUp} className="flex items-end justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Community</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-bold">Upcoming events</h2>
          <p className="mt-3 text-muted-foreground">Members get automatic discounts at checkout.</p>
        </div>
        <Link to="/auth" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
          Reserve tickets <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {q.isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
          No events published yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {events.map((e: any, i: number) => (
            <motion.article
              key={e.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group glass rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-br from-primary to-accent relative">
                {e.cover_url && (
                  <img src={e.cover_url} alt={e.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                )}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs bg-black/40 backdrop-blur">
                  {e.category ?? "Event"}
                </div>
                <div className="absolute bottom-4 left-4 text-white font-display font-bold text-2xl">
                  {new Date(e.starts_at).toLocaleDateString(undefined, { month: "short", day: "2-digit" })}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg">{e.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[e.venue, e.city].filter(Boolean).join(" · ") || "—"}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-accent">Members save more</span>
                  <Link to="/auth" className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

function Gallery() {
  const shots = [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&q=80",
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-accent inline-flex items-center gap-2 justify-center">
          <Camera className="h-3.5 w-3.5" /> Gallery
        </p>
        <h2 className="mt-3 text-4xl sm:text-5xl font-bold">
          Moments from <span className="gradient-text">the community</span>.
        </h2>
      </motion.div>
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shots.map((url, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={`relative rounded-2xl ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"} overflow-hidden group`}
          >
            <img
              src={url}
              alt={`Community moment ${i + 1}`}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                target.parentElement!.style.background = `linear-gradient(135deg, oklch(0.62 0.2 262 / 0.3), oklch(0.78 0.14 220 / 0.3))`;
              }}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const featureItems = [
  { icon: Users, title: "Networking", body: "Connect with peers, mentors and leaders across cities." },
  { icon: Calendar, title: "Exclusive events", body: "Curated meetups, workshops and community nights." },
  { icon: Ticket, title: "Member discounts", body: "Automatic discounted pricing on every event ticket." },
  { icon: BookOpen, title: "Workshops", body: "Skill-building sessions with industry practitioners." },
  { icon: Rocket, title: "Leadership programs", body: "Fast-tracked paths to leading your own chapter." },
  { icon: Heart, title: "Volunteer opportunities", body: "Give back and earn hours toward recognition." },
  { icon: CreditCard, title: "Digital card", body: "A beautiful QR-enabled membership card, always in your pocket." },
  { icon: ShieldCheck, title: "Trusted community", body: "Verified members and safe, moderated spaces." },
];

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold">
          Everything you need to <span className="gradient-text">belong</span>.
        </h2>
      </motion.div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featureItems.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass rounded-2xl p-6 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <f.icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  const contactFn = useServerFn(submitContactMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    try {
      await contactFn({ data: { name, email, message } });
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <motion.div {...fadeUp}>
          <p className="text-xs uppercase tracking-widest text-accent">Contact</p>
          <h2 className="mt-2 text-4xl sm:text-5xl font-bold">
            Say <span className="gradient-text">hello</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Questions, partnerships, or just want to volunteer? Reach out — we read every message.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-accent" /> hello@yncommunity.org</p>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-accent" /> Bengaluru · Mumbai · Delhi</p>
          </div>
        </motion.div>
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-10 text-center">
            <Send className="mx-auto h-10 w-10 text-accent" />
            <p className="mt-4 font-display text-2xl font-bold">Thanks — we'll be in touch!</p>
            <p className="mt-2 text-sm text-muted-foreground">We usually respond within 24 hours.</p>
          </motion.div>
        ) : (
          <motion.form
            {...fadeUp}
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-6 space-y-3"
          >
            <input
              name="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
            />
            <input
              name="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full rounded-xl bg-white/5 border border-border px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
            />
            <button
              disabled={sending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center glass">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-primary/40 blur-3xl" />
        <div className="relative">
          <Zap className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold">
            Ready to <span className="gradient-text">join the movement?</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Create an account and unlock a year of community, events and mentorship — completely free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/auth"
              className="glow-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
