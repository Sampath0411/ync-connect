import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Admin Login — YNC" },
      { name: "description", content: "Restricted access for YNC administrators." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        toast.error(error?.message ?? "Invalid credentials");
        return;
      }
      // Verify admin role server-side via RLS-scoped read of own user_roles row.
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        await supabase.auth.signOut();
        toast.error("This account is not an administrator.");
        return;
      }
      toast.success("Welcome, admin");
      navigate({ to: "/dashboard/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-red-600/10" />
      <div className="w-full max-w-md glass rounded-3xl p-8 border border-white/10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
          <ShieldCheck className="h-4 w-4" /> Admin access
        </div>
        <h1 className="text-3xl font-display font-bold mb-1">Sign in as Admin</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Restricted. Use your administrator email and password. Members should
          use the <Link to="/auth" className="text-accent underline">regular sign-in</Link> page.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2.5 outline-none focus:border-accent"
              placeholder="admin@yourdomain.com"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2.5 outline-none focus:border-accent"
              placeholder="Enter password"
            />
          </label>
          <button
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Enter admin panel
          </button>
        </form>
      </div>
    </div>
  );
}
