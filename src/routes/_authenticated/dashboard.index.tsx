import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CardSkeleton, EventCardSkeleton } from "@/components/ui/skeleton";
import { Download, Loader2, ScanLine, Sparkles, ArrowRight, Ticket } from "lucide-react";
import { downloadBase64, downloadDataUrl } from "@/lib/utils";
import { toast } from "sonner";
import {
  getMe,
  getMembershipCard,
  requestMembership,
  listPublicEvents,
} from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const cardFn = useServerFn(getMembershipCard);
  const requestFn = useServerFn(requestMembership);
  const eventsFn = useServerFn(listPublicEvents);

  const meQ = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const eventsQ = useQuery({ queryKey: ["public-events"], queryFn: () => eventsFn() });

  const req = useMutation({
    mutationFn: () => requestFn(),
    onSuccess: () => {
      toast.success("Membership requested — an admin will review it shortly.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const me = meQ.data;
  const name = me?.profile?.full_name ?? me?.email ?? "Member";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Dashboard</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-display font-bold">
          Welcome{me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{me?.email}</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Membership
        </div>
        {!me ? (
          <CardSkeleton />
        ) : !me.membership ? (
          <div>
            <h2 className="text-2xl font-display font-bold">You're not a member yet</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Membership is free for a limited period. Request approval to unlock your digital card and member pricing.
            </p>
            <button
              onClick={() => req.mutate()}
              disabled={req.isPending}
              className="glow-btn mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60"
            >
              {req.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Request membership
            </button>
          </div>
        ) : me.membership.status === "pending" ? (
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
              Pending approval
            </span>
            <h2 className="mt-3 text-2xl font-display font-bold">Your request is under review</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Requested on {new Date(me.membership.requested_at).toLocaleDateString()}. An admin will approve it shortly.
            </p>
          </div>
        ) : me.membership.status === "rejected" ? (
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-300 border border-red-500/20">
              Rejected
            </span>
            <p className="mt-2 text-sm text-muted-foreground">{me.membership.notes ?? "Contact support for details."}</p>
          </div>
        ) : (
          <MembershipCard cardFn={cardFn} membership={me.membership} name={name} />
        )}
      </motion.div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
            <Ticket className="h-3.5 w-3.5" /> Upcoming events
          </div>
          <Link to="/dashboard/events" className="text-sm text-accent hover:underline inline-flex items-center gap-1">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {eventsQ.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : (eventsQ.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No events published yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {eventsQ.data!.slice(0, 4).map((e: any) => (
              <div key={e.id} className="rounded-2xl border border-border p-4">
                <p className="text-xs text-accent">
                  {e.starts_at ? new Date(e.starts_at).toLocaleDateString() : ""}
                </p>
                <p className="font-medium mt-1">{e.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {[e.venue, e.city].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MembershipCard({ cardFn, membership, name }: { cardFn: any; membership: any; name: string }) {
  const q = useQuery({ queryKey: ["membership-card", membership.card_code], queryFn: () => cardFn() });
  return (
    <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
      <div>
        <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-300 border border-green-500/20">
          Active member
        </span>
        <h2 className="mt-3 text-2xl font-display font-bold">{name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Card ID: <span className="font-mono">{membership.card_code.slice(0, 8).toUpperCase()}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Valid until: {membership.valid_until ? new Date(membership.valid_until).toDateString() : "—"}
        </p>
        {q.data && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => downloadBase64(q.data.pdfBase64, `ync-membership-${membership.card_code.slice(0, 8)}.pdf`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium"
            >
              <Download className="h-4 w-4" /> PDF card
            </button>
            <button
              onClick={() => downloadDataUrl(q.data.qrDataUrl, `ync-qr-${membership.card_code.slice(0, 8)}.png`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-white/5"
            >
              <ScanLine className="h-4 w-4" /> QR image
            </button>
          </div>
        )}
      </div>
      <div className="rounded-2xl bg-white p-3 grid place-items-center">
        {q.isLoading ? (
          <Loader2 className="h-8 w-8 text-black animate-spin" />
        ) : q.data ? (
          <img src={q.data.qrDataUrl} alt="Membership QR" className="w-40 h-40" />
        ) : (
          <div className="w-40 h-40" />
        )}
      </div>
    </div>
  );
}
