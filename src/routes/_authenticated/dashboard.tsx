import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import {
  getMe,
  requestMembership,
  listMyTickets,
  getMembershipCard,
  getTicketDownload,
  updateMyProfile,
} from "@/lib/community.functions";
import { Download, Loader2, ShieldCheck, Sparkles, Ticket, User2, LogOut, Users, ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — YNC" }] }),
});

function downloadBase64Pdf(base64: string, filename: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const ticketsFn = useServerFn(listMyTickets);
  const requestFn = useServerFn(requestMembership);
  const cardFn = useServerFn(getMembershipCard);
  const ticketDownloadFn = useServerFn(getTicketDownload);
  const updateProfileFn = useServerFn(updateMyProfile);

  const meQ = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const ticketsQ = useQuery({ queryKey: ["my-tickets"], queryFn: () => ticketsFn() });

  const req = useMutation({
    mutationFn: () => requestFn(),
    onSuccess: () => {
      toast.success("Membership requested — an admin will review it shortly.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const [profileOpen, setProfileOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const me = meQ.data;
  const roles = me?.roles ?? [];
  const isAdmin = roles.includes("admin");
  const isTeam = roles.includes("team") || isAdmin;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">Dashboard</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
              Welcome{me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">{me?.email}</p>
          </div>
          <div className="flex gap-2">
            {isTeam && (
              <Link to="/dashboard/team" className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white/5 flex items-center gap-2">
                <Users className="h-4 w-4" /> Team
              </Link>
            )}
            {isAdmin && (
              <Link to="/dashboard/admin" className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white/5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <button onClick={signOut} className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-white/5 flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Membership card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-3xl p-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Membership
            </div>

            {!me?.membership ? (
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
                  Requested on {new Date(me.membership.requested_at).toLocaleDateString()}. We'll email you as soon as an admin approves it.
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
              <MembershipCard cardFn={cardFn} membership={me.membership} name={me.profile?.full_name ?? me.email ?? "Member"} />
            )}
          </motion.div>

          {/* Profile summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
              <User2 className="h-3.5 w-3.5" /> Profile
            </div>
            <div className="text-sm space-y-2">
              <Row label="Name" value={me?.profile?.full_name ?? "—"} />
              <Row label="Phone" value={me?.profile?.phone ?? "—"} />
              <Row label="City" value={me?.profile?.city ?? "—"} />
            </div>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm hover:bg-white/5"
            >
              {profileOpen ? "Close" : "Edit profile"}
            </button>
            {profileOpen && (
              <ProfileForm
                initial={me?.profile ?? {}}
                onSubmit={async (v) => {
                  await updateProfileFn({ data: v });
                  toast.success("Profile updated");
                  qc.invalidateQueries({ queryKey: ["me"] });
                  setProfileOpen(false);
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Tickets */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <Ticket className="h-3.5 w-3.5" /> My Tickets
            </div>
            <Link to="/events" className="text-sm text-accent hover:underline">
              Browse events →
            </Link>
          </div>
          {ticketsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (ticketsQ.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet. Reserve your first event.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {ticketsQ.data!.map((t: any) => (
                <div key={t.id} className="rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.events?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.events?.starts_at ? new Date(t.events.starts_at).toLocaleString() : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[t.events?.venue, t.events?.city].filter(Boolean).join(" · ") || ""}
                    </p>
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Ticket:</span> {t.ticket_code.slice(0, 8).toUpperCase()}
                      {t.checked_in_at && <span className="ml-2 text-green-400">✓ checked in</span>}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await ticketDownloadFn({ data: { ticket_id: t.id } });
                      downloadBase64Pdf(res.pdfBase64, `ync-ticket-${t.ticket_code.slice(0, 8)}.pdf`);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10"
                    aria-label="Download ticket"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function ProfileForm({ initial, onSubmit }: { initial: any; onSubmit: (v: any) => Promise<void> }) {
  const [v, setV] = useState({
    full_name: initial.full_name ?? "",
    phone: initial.phone ?? "",
    city: initial.city ?? "",
  });
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSubmit(v);
        } finally {
          setBusy(false);
        }
      }}
      className="mt-4 space-y-3"
    >
      {(["full_name", "phone", "city"] as const).map((k) => (
        <input
          key={k}
          value={v[k]}
          onChange={(e) => setV({ ...v, [k]: e.target.value })}
          placeholder={k.replace("_", " ")}
          className="w-full rounded-xl bg-white/5 border border-border px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      ))}
      <button
        disabled={busy}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-60"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
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
              onClick={() => downloadBase64Pdf(q.data.pdfBase64, `ync-membership-${membership.card_code.slice(0, 8)}.pdf`)}
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
