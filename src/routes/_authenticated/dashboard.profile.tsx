import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User2 } from "lucide-react";
import { getMe, updateMyProfile } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — YNC" }] }),
});

function ProfilePage() {
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const updateFn = useServerFn(updateMyProfile);
  const meQ = useQuery({ queryKey: ["me"], queryFn: () => meFn() });

  const [v, setV] = useState({ full_name: "", phone: "", city: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (meQ.data?.profile) {
      setV({
        full_name: meQ.data.profile.full_name ?? "",
        phone: meQ.data.profile.phone ?? "",
        city: meQ.data.profile.city ?? "",
      });
    }
  }, [meQ.data]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateFn({ data: v });
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const me = meQ.data;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Account</p>
        <h1 className="mt-1 text-3xl font-display font-bold flex items-center gap-2">
          <User2 className="h-6 w-6" /> Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{me?.email}</p>
      </div>

      <form onSubmit={submit} className="glass rounded-3xl p-6 space-y-4">
        {(
          [
            { k: "full_name", label: "Full name", placeholder: "Your name" },
            { k: "phone", label: "Phone", placeholder: "+91 …" },
            { k: "city", label: "City", placeholder: "Bengaluru" },
          ] as const
        ).map(({ k, label, placeholder }) => (
          <div key={k}>
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input
              value={v[k]}
              onChange={(e) => setV({ ...v, [k]: e.target.value })}
              placeholder={placeholder}
              className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        ))}
        <button
          disabled={busy}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>

      {me?.roles && me.roles.length > 0 && (
        <div className="glass rounded-3xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Roles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {me.roles.map((r) => (
              <span key={r} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-border capitalize">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
