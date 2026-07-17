import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/events")({
  component: Events,
  head: () => ({
    meta: [
      { title: "Events — YNC" },
      { name: "description", content: "Upcoming, ongoing, and completed YNC community events." },
    ],
  }),
});

type EventCat = "Upcoming" | "Ongoing" | "Completed";

const events: {
  title: string;
  date: string;
  location: string;
  cat: EventCat;
  price: string;
  memberPrice: string;
  color: string;
}[] = [
  { title: "YNC Founders Night", date: "Mar 22, 2026", location: "Bengaluru · The Leela", cat: "Upcoming", price: "₹1,499", memberPrice: "₹999", color: "from-primary to-accent" },
  { title: "Storytelling for Leaders", date: "Apr 06, 2026", location: "Online · Live workshop", cat: "Upcoming", price: "₹799", memberPrice: "₹499", color: "from-accent to-primary" },
  { title: "Volunteer Day 2026", date: "Apr 19, 2026", location: "Mumbai · BKC", cat: "Upcoming", price: "Free", memberPrice: "Free", color: "from-primary to-accent" },
  { title: "Community Design Sprint", date: "In progress", location: "Delhi · YNC Hub", cat: "Ongoing", price: "₹599", memberPrice: "₹399", color: "from-accent to-primary" },
  { title: "Winter Youth Summit", date: "Dec 12, 2025", location: "Bengaluru", cat: "Completed", price: "—", memberPrice: "—", color: "from-primary to-accent" },
  { title: "Startup Mentorship Meet", date: "Nov 08, 2025", location: "Hyderabad", cat: "Completed", price: "—", memberPrice: "—", color: "from-accent to-primary" },
];

const tabs: (EventCat | "All")[] = ["All", "Upcoming", "Ongoing", "Completed"];

function Events() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const filtered = tab === "All" ? events : events.filter((e) => e.cat === tab);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Events"
        title="Where the community |comes alive|."
        subtitle="Curated experiences you'll actually want to attend. Members get automatic discounts at checkout."
      />

      <div className="mx-auto max-w-6xl px-4">
        <div className="glass rounded-2xl p-1.5 flex gap-1 w-fit mx-auto mb-10">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-2 rounded-xl text-sm font-medium transition ${
                tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="event-tab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e, i) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group glass rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-40 bg-gradient-to-br ${e.color} relative`}>
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs bg-black/30 backdrop-blur">
                  {e.cat}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.location}</p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-sm font-semibold">
                      <span className="line-through text-muted-foreground mr-1.5">{e.price}</span>
                      <span className="gradient-text">{e.memberPrice}</span>
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:translate-x-0.5 transition">
                    Details <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
