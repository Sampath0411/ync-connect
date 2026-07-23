import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Sparkles, Mail, Lock, User, Phone, MapPin, Calendar, Instagram, Twitter, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "Sign in — YNC" }] }),
});

type Step = 0 | 1 | 2 | 3;

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>(0);
  const [busy, setBusy] = useState(false);

  // fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const finishSignup = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: name, phone, city, dob, instagram, twitter },
        },
      });
      if (error) throw error;
      toast.success("Account created!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Sign-up failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (res.error) throw res.error;
      if (!res.redirected) navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Google sign-in failed");
      setBusy(false);
    }
  };

  const canNext =
    (step === 0 && email.trim() && password.length >= 6) ||
    (step === 1 && name.trim() && phone.trim()) ||
    (step === 2 && dob && city.trim()) ||
    step === 3;

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-display font-bold">
              {mode === "signin" ? "Welcome back" : "Join YNC"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to your account" : `Step ${step + 1} of 4`}
            </p>
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="mt-6 w-full py-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 flex items-center justify-center gap-3 text-sm font-medium transition disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6 0-1-.1-1.5H12z"/></svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {mode === "signin" ? (
            <form onSubmit={signIn} className="space-y-4">
              <Field icon={<Mail className="h-4 w-4" />} label="Email">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="you@email.com" />
              </Field>
              <Field icon={<Lock className="h-4 w-4" />} label="Password">
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="••••••••" />
              </Field>
              <button type="submit" disabled={busy} className="glow-btn w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {step === 0 && (
                <>
                  <Field icon={<Mail className="h-4 w-4" />} label="Email">
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="you@email.com" />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="At least 6 characters" />
                  </Field>
                </>
              )}
              {step === 1 && (
                <>
                  <Field icon={<User className="h-4 w-4" />} label="Full name">
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Your name" />
                  </Field>
                  <Field icon={<Phone className="h-4 w-4" />} label="Phone">
                    <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="+91 …" />
                  </Field>
                </>
              )}
              {step === 2 && (
                <>
                  <Field icon={<Calendar className="h-4 w-4" />} label="Date of birth">
                    <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
                  </Field>
                  <Field icon={<MapPin className="h-4 w-4" />} label="City">
                    <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Hyderabad" />
                  </Field>
                </>
              )}
              {step === 3 && (
                <>
                  <Field icon={<Instagram className="h-4 w-4" />} label="Instagram (optional)">
                    <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="@handle" />
                  </Field>
                  <Field icon={<Twitter className="h-4 w-4" />} label="Twitter / X (optional)">
                    <input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="@handle" />
                  </Field>
                </>
              )}

              <div className="flex gap-2 pt-2">
                {step > 0 && (
                  <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="px-4 py-3 rounded-xl border border-border text-sm inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setStep((s) => (s + 1) as Step)}
                    className="glow-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={finishSignup}
                    className="glow-btn flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setStep(0);
              }}
              className="text-accent hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/5 border border-border px-3.5 py-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}
