import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { Target, Eye, Compass, Users, Award, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — YNC" },
      { name: "description", content: "Our vision, mission, and the team behind YNC." },
    ],
  }),
});

const pillars = [
  { icon: Target, title: "Mission", body: "To empower every young person with a community that helps them grow, lead, and give back." },
  { icon: Eye, title: "Vision", body: "A generation connected by purpose, driving change in their cities and beyond." },
  { icon: Compass, title: "Values", body: "Kindness, curiosity, courage, and community — in that order." },
];

const leaders = [
  { name: "Ananya Rao", role: "President" },
  { name: "Kabir Menon", role: "Community Lead" },
  { name: "Sara D'Souza", role: "Events Director" },
  { name: "Rohan Kapoor", role: "Programs Head" },
];

function About() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About YNC"
        title="Building a movement, |one connection| at a time."
        subtitle="Youth Network Community exists to give young people the space, tools, and people they need to become their best selves."
      />

      <section className="mx-auto max-w-6xl px-4 grid gap-5 md:grid-cols-3">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <p.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </motion.div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Meet the team</h2>
          <p className="mt-3 text-muted-foreground">The people making it happen.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {leaders.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-3xl p-6 text-center hover:-translate-y-1 transition-all"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-white text-2xl font-bold">
                {l.name.charAt(0)}
              </div>
              <p className="mt-4 font-semibold">{l.name}</p>
              <p className="text-sm text-muted-foreground">{l.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 mt-24">
        <div className="glass rounded-3xl p-10 sm:p-16 grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, value: "12,000+", label: "Members" },
            { icon: Award, value: "240+", label: "Events" },
            { icon: Heart, value: "18,000+", label: "Volunteer hours" },
          ].map((s) => (
            <div key={s.label}>
              <s.icon className="h-8 w-8 mx-auto text-accent" />
              <p className="mt-3 text-4xl font-display font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
