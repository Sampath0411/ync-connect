import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/site/PageShell";
import { Sparkles, Users, Shield } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login — YNC" }] }),
});

function Login() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8"
        >
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your YNC account
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
              />
            </div>
            <button
              type="submit"
              className="glow-btn w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-border p-3">
              <Users className="h-4 w-4 text-accent" />
              <span>Members</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border p-3">
              <Shield className="h-4 w-4 text-accent" />
              <span>Team & Admins</span>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/join" className="text-accent hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}
