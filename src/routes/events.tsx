import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { MapPin, Calendar, ArrowRight, Loader2, Ticket } from "lucide-react";
import { listPublicEvents, reserveTicket } from "@/lib/community.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/events")({
  component: Events,
  head: () => ({
    meta: [
      { title: "Events — YNC" },
      { name: "description", content: "Upcoming, ongoing, and completed YNC community events." },
    ],
  }),
});

type Tab = "All" | "Upcoming" | "Past";
const tabs: Tab[] = ["All", "Upcoming", "Past"];

function Events() {
  const navigate = useNavigate();
  const listFn = useServerFn(listPublicEvents);
  const reserveFn = useServerFn(reserveTicket);
  const [tab, setTab] = useState<Tab>("All");

  const q = useQuery({ queryKey: ["public-events"], queryFn: () => listFn() });

  const reserve = useMutation({
    mutationFn: async (event_id: string) => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/auth" });
        throw new Error("Please sign in to reserve tickets");
      }
      return reserveFn({ data: { event_id } });
    },
    onSuccess: () => {
      toast.success("Ticket reserved! Find it in your dashboard.");
      navigate({ to: "/dashboard" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const now = Date.now();
  const filtered = (q.data ?? []).filter((e) => {
    if (tab === "All") return true;
    const upcoming = new Date(e.starts_at).getTime() >= now;
    return tab === "Upcoming" ? upcoming : !upcoming;
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Events"
        title="Where the community |comes alive|."
        subtitle="Curated experiences you'll actually want to attend. Members get automatic discounts."
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

        {q.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No events in this view yet.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => {
              const past = new Date(e.starts_at).getTime() < now;
              return (
                <motion.article
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group glass rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="h-40 bg-gradient-to-br from-primary to-accent relative bg-cover bg-center"
                    style={e.cover_url ? { backgroundImage: `url(${e.cover_url})` } : {}}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs bg-black/40 backdrop-blur">
                      {past ? "Past" : e.category ?? "Event"}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg">{e.title}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(e.starts_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {(e.venue || e.city) && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {[e.venue, e.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {e.price_cents === 0 && e.member_price_cents === 0 ? "Free" : "From"}
                        </p>
                        <p className="text-sm font-semibold">
                          {e.price_cents !== e.member_price_cents && (
                            <span className="line-through text-muted-foreground mr-1.5">
                              ₹{(e.price_cents / 100).toFixed(0)}
                            </span>
                          )}
                          <span className="gradient-text">
                            {e.member_price_cents === 0 ? "Free" : `₹${(e.member_price_cents / 100).toFixed(0)}`}
                          </span>
                        </p>
                      </div>
                      {past ? (
                        <span className="text-xs text-muted-foreground">Completed</span>
                      ) : (
                        <button
                          onClick={() => reserve.mutate(e.id)}
                          disabled={reserve.isPending}
                          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:translate-x-0.5 transition disabled:opacity-60"
                        >
                          <Ticket className="h-4 w-4" /> Reserve <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
