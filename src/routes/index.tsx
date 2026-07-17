import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
  return (
    <div>
      <Hero />
      <Stats />
      <Membership />
      <Features />
      <EventsPreview />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-24 sm:pt-48 sm:pb-32">
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
            to="/join"
            className="glow-btn group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
          >
            Join Community
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass hover:bg-white/10 transition font-medium"
          >
            Explore Events
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm text-muted-foreground hover:text-foreground transition"
          >
            Team Member Login →
          </Link>
        </motion.div>

        {/* floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-24 relative mx-auto max-w-4xl"
        >
          <div className="glass rounded-3xl p-2 shadow-[0_40px_120px_-30px_oklch(0.55_0.22_265/0.6)]">
            <div className="rounded-2xl bg-gradient-to-br from-navy to-background p-8 sm:p-12 text-left overflow-hidden relative">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative grid sm:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-xs uppercase tracking-widest text-accent">Digital Membership Card</p>
                  <p className="mt-2 font-display text-2xl font-bold">Aarav Sharma</p>
                  <p className="text-sm text-muted-foreground">YNC-2026-0142 · Valid 12 months</p>
                  <div className="mt-6 flex gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Issued</p>
                      <p className="font-medium">Jan 2026</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-medium">Jan 2027</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="grid h-32 w-32 place-items-center rounded-2xl bg-white/95">
                    <div
                      className="h-24 w-24"
                      style={{
                        backgroundImage:
                          "conic-gradient(#111 0 25%, transparent 0 50%, #111 0 75%, transparent 0), radial-gradient(circle at 20% 20%, #111 20%, transparent 21%), radial-gradient(circle at 80% 20%, #111 20%, transparent 21%), radial-gradient(circle at 20% 80%, #111 20%, transparent 21%)",
                        backgroundSize: "8px 8px, 100% 100%, 100% 100%, 100% 100%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
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
      <motion.div
        {...fadeUp}
        className="glass rounded-3xl px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6"
      >
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-display text-3xl sm:text-4xl font-bold gradient-text">
              {s.value}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function Membership() {
  return (
    <section id="membership" className="mx-auto max-w-6xl px-4 py-24">
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
              to="/join"
              className="glow-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            >
              Join Membership <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/10 transition font-medium"
            >
              Learn more
            </Link>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative">
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary/40 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Membership
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    <span className="line-through text-muted-foreground text-xl mr-2">₹999</span>
                    <span className="gradient-text">Free</span>
                  </p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Limited period. 1-year validity from approval.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Ticket, label: "Ticket discounts" },
                  { icon: Calendar, label: "Early access" },
                  { icon: Award, label: "Recognition" },
                  { icon: Heart, label: "Volunteer perks" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border p-4 hover:bg-white/5 transition"
                  >
                    <Icon className="h-5 w-5 text-accent" />
                    <p className="mt-2 text-sm font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
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
        <p className="mt-4 text-muted-foreground">
          Thoughtfully designed features that make the community experience
          feel premium, personal and alive.
        </p>
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

function EventsPreview() {
  const events = [
    {
      tag: "Upcoming",
      date: "Mar 22",
      title: "YNC Founders Night",
      location: "Bengaluru · The Leela",
      color: "from-primary to-accent",
    },
    {
      tag: "Workshop",
      date: "Apr 06",
      title: "Storytelling for Leaders",
      location: "Online · Live",
      color: "from-accent to-primary",
    },
    {
      tag: "Community",
      date: "Apr 19",
      title: "Volunteer Day 2026",
      location: "Mumbai · BKC",
      color: "from-primary to-accent",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="flex items-end justify-between mb-10">
        <motion.div {...fadeUp}>
          <h2 className="text-4xl sm:text-5xl font-bold">Upcoming events</h2>
          <p className="mt-3 text-muted-foreground">
            Members get automatic discounts at checkout.
          </p>
        </motion.div>
        <Link
          to="/events"
          className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {events.map((e, i) => (
          <motion.article
            key={e.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group glass rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`h-40 bg-gradient-to-br ${e.color} relative`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white/30,transparent_60%)] opacity-30" />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs bg-black/30 backdrop-blur">
                {e.tag}
              </div>
              <div className="absolute bottom-4 left-4 text-white font-display font-bold text-2xl">
                {e.date}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <span className="text-accent">Members save 30%</span>
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:translate-x-0.5 transition">
                  Details <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center glass"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-primary/40 blur-3xl" />
        <div className="relative">
          <Zap className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 text-4xl sm:text-5xl font-bold">
            Ready to <span className="gradient-text">join the movement?</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Register today, verify your email, and unlock a year of community,
            events and mentorship — completely free.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/join"
              className="glow-btn inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl glass hover:bg-white/10 transition font-medium"
            >
              Learn about YNC
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
