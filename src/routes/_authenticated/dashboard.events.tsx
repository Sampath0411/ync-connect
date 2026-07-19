import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Loader2, MapPin, Ticket } from "lucide-react";
import { toast } from "sonner";
import { listPublicEvents, reserveTicket, listMyTickets } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/events")({
  component: DashboardEvents,
  head: () => ({ meta: [{ title: "Events — YNC" }] }),
});

function DashboardEvents() {
  const qc = useQueryClient();
  const eventsFn = useServerFn(listPublicEvents);
  const reserveFn = useServerFn(reserveTicket);
  const ticketsFn = useServerFn(listMyTickets);

  const eventsQ = useQuery({ queryKey: ["public-events"], queryFn: () => eventsFn() });
  const ticketsQ = useQuery({ queryKey: ["my-tickets"], queryFn: () => ticketsFn() });
  const mine = new Set((ticketsQ.data ?? []).map((t: any) => t.event_id));

  const reserve = useMutation({
    mutationFn: (event_id: string) => reserveFn({ data: { event_id } }),
    onSuccess: () => {
      toast.success("Ticket reserved — check your Tickets tab.");
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Community</p>
        <h1 className="mt-1 text-3xl font-display font-bold">Events</h1>
        <p className="text-sm text-muted-foreground mt-1">Reserve your spot — members get discounts automatically.</p>
      </div>

      {eventsQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (eventsQ.data?.length ?? 0) === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
          No events published yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {eventsQ.data!.map((e: any) => {
            const reserved = mine.has(e.id);
            return (
              <div key={e.id} className="glass rounded-3xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary to-accent relative">
                  {e.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.cover_url} alt={e.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  )}
                  {e.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs bg-black/40 backdrop-blur">
                      {e.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(e.starts_at).toLocaleString()}</p>
                    {(e.venue || e.city) && (
                      <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {[e.venue, e.city].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  {e.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="line-through text-muted-foreground mr-2">₹{(e.price_cents / 100).toFixed(0)}</span>
                      <span className="font-semibold text-accent">₹{(e.member_price_cents / 100).toFixed(0)} member</span>
                    </div>
                    <button
                      disabled={reserved || reserve.isPending}
                      onClick={() => reserve.mutate(e.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-60"
                    >
                      {reserve.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Ticket className="h-4 w-4" /> {reserved ? "Reserved" : "Reserve"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
