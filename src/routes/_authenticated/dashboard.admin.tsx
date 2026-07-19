import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  getMe,
  listPendingMemberships,
  decideMembership,
  adminListUsers,
  adminSetRole,
  adminListEvents,
  adminUpsertEvent,
  adminDeleteEvent,
  adminListSignins,
} from "@/lib/community.functions";
import { ShieldCheck, Check, X, Loader2, Plus, Trash2, Edit3, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/admin")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Admin — YNC" }] }),
  loader: async () => {
    const me = await getMe();
    if (!me.roles?.includes("admin")) throw redirect({ to: "/dashboard" });
    return me;
  },
});

function AdminPanel() {
  const [tab, setTab] = useState<"memberships" | "users" | "events" | "activity">("memberships");

  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-2">
        <ShieldCheck className="h-3.5 w-3.5" /> Admin
      </div>
      <h1 className="text-3xl sm:text-4xl font-display font-bold">Manage the community</h1>

      <div className="glass rounded-2xl p-1.5 flex flex-wrap gap-1 w-fit mt-6 mb-6">
        {(["memberships", "users", "events", "activity"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm capitalize transition ${
              tab === t ? "bg-gradient-to-r from-primary to-accent text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "memberships" && <MembershipsTab />}
      {tab === "users" && <UsersTab />}
      {tab === "events" && <EventsTab />}
      {tab === "activity" && <ActivityTab />}
    </div>
  );
}

function ActivityTab() {
  const listFn = useServerFn(adminListSignins);
  const q = useQuery({ queryKey: ["admin-signins"], queryFn: () => listFn() });
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-4">
        <Activity className="h-3.5 w-3.5" /> Recent activity
      </div>
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Last sign-in</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((u: any) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">{u.full_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {q.data?.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function MembershipsTab() {
  const listFn = useServerFn(listPendingMemberships);
  const decideFn = useServerFn(decideMembership);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-memberships"], queryFn: () => listFn() });

  const decide = useMutation({
    mutationFn: (v: { id: string; d: "approved" | "rejected" }) =>
      decideFn({ data: { membership_id: v.id, decision: v.d } }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-memberships"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="glass rounded-3xl p-6">
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {q.data?.map((m: any) => (
            <div key={m.id} className="rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div>
                <p className="font-medium">{m.profiles?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {m.profiles?.city} · Requested {new Date(m.requested_at).toLocaleDateString()}
                </p>
                <p className="text-xs mt-1">
                  Status: <StatusPill status={m.status} />
                </p>
              </div>
              {m.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => decide.mutate({ id: m.id, d: "approved" })}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm"
                  >
                    <Check className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => decide.mutate({ id: m.id, d: "rejected" })}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No membership requests yet.</p>}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "bg-green-500/10 text-green-300 border-green-500/20"
      : status === "rejected"
        ? "bg-red-500/10 text-red-300 border-red-500/20"
        : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${color}`}>{status}</span>;
}

function UsersTab() {
  const listFn = useServerFn(adminListUsers);
  const setRoleFn = useServerFn(adminSetRole);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => listFn() });

  const setRole = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "team" | "member"; grant: boolean }) =>
      setRoleFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="glass rounded-3xl p-6">
      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">City</th>
                <th className="py-2 pr-4">Roles</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((u: any) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">{u.full_name ?? "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{u.city ?? "—"}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r: string) => (
                        <span key={r} className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-border">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {(["team", "admin"] as const).map((role) => {
                        const has = u.roles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => setRole.mutate({ user_id: u.id, role, grant: !has })}
                            className={`text-xs px-2.5 py-1 rounded-lg border ${
                              has
                                ? "bg-red-500/10 border-red-500/20 text-red-300"
                                : "bg-white/5 border-border hover:bg-white/10"
                            }`}
                          >
                            {has ? `Revoke ${role}` : `Make ${role}`}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EventsTab() {
  const listFn = useServerFn(adminListEvents);
  const upsertFn = useServerFn(adminUpsertEvent);
  const deleteFn = useServerFn(adminDeleteEvent);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-events"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">All events</h3>
          <button
            onClick={() =>
              setEditing({
                slug: "",
                title: "",
                description: "",
                cover_url: "",
                category: "",
                starts_at: new Date().toISOString().slice(0, 16),
                venue: "",
                city: "",
                price_cents: 0,
                member_price_cents: 0,
                status: "published",
              })
            }
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm"
          >
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
        {q.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-2">
            {q.data?.map((e: any) => (
              <div key={e.id} className="rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString()} · {e.city} · {e.status}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setEditing({ ...e, starts_at: new Date(e.starts_at).toISOString().slice(0, 16) })
                    }
                    className="p-2 rounded-lg hover:bg-white/5"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirm("Delete this event?") && del.mutate(e.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="glass rounded-3xl p-6 h-fit sticky top-24">
          <h3 className="font-semibold mb-4">{editing.id ? "Edit event" : "New event"}</h3>
          <EventForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={async (v) => {
              const payload: any = { ...v, starts_at: new Date(v.starts_at).toISOString() };
              if (editing.id) payload.id = editing.id;
              await upsertFn({ data: payload });
              toast.success("Saved");
              qc.invalidateQueries({ queryKey: ["admin-events"] });
              setEditing(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

function EventForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: any;
  onSubmit: (v: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState({
    slug: initial.slug ?? "",
    title: initial.title ?? "",
    description: initial.description ?? "",
    cover_url: initial.cover_url ?? "",
    category: initial.category ?? "",
    starts_at: initial.starts_at ?? "",
    venue: initial.venue ?? "",
    city: initial.city ?? "",
    price_cents: initial.price_cents ?? 0,
    member_price_cents: initial.member_price_cents ?? 0,
    status: initial.status ?? "published",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, val: any) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSubmit(v);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setBusy(false);
        }
      }}
      className="space-y-3 text-sm"
    >
      <Input label="Title" value={v.title} onChange={(x) => set("title", x)} required />
      <Input label="Slug" value={v.slug} onChange={(x) => set("slug", x)} required />
      <Input label="Category" value={v.category} onChange={(x) => set("category", x)} />
      <Input label="Cover URL" value={v.cover_url} onChange={(x) => set("cover_url", x)} />
      <label className="block">
        <span className="text-xs text-muted-foreground">Description</span>
        <textarea
          value={v.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2 outline-none focus:border-accent"
        />
      </label>
      <Input label="Starts at" type="datetime-local" value={v.starts_at} onChange={(x) => set("starts_at", x)} required />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Venue" value={v.venue} onChange={(x) => set("venue", x)} />
        <Input label="City" value={v.city} onChange={(x) => set("city", x)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input label="Price (paise)" type="number" value={v.price_cents} onChange={(x) => set("price_cents", Number(x))} />
        <Input label="Member price (paise)" type="number" value={v.member_price_cents} onChange={(x) => set("member_price_cents", Number(x))} />
      </div>
      <label className="block">
        <span className="text-xs text-muted-foreground">Status</span>
        <select
          value={v.status}
          onChange={(e) => set("status", e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2 outline-none focus:border-accent"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
      </label>
      <div className="flex gap-2 pt-2">
        <button
          disabled={busy}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-border">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2 outline-none focus:border-accent"
      />
    </label>
  );
}
