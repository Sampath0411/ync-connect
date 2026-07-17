import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/join")({
  component: Join,
  head: () => ({ meta: [{ title: "Join YNC" }] }),
});

const steps = ["Account", "Profile", "Verify"] as const;

function Join() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <PageShell>
      <div className="mx-auto max-w-xl px-4">
        <div className="text-center mb-8">
          <div className="mx-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Free membership
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-display font-bold">
            Create your <span className="gradient-text">YNC account</span>
          </h1>
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-10 text-center"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-5 text-2xl font-display font-bold">You're in!</h2>
            <p className="mt-2 text-muted-foreground">
              Check your inbox for a verification link. Once verified, you can
              apply for membership from your dashboard.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white glow-btn font-medium"
            >
              Back to home
            </Link>
          </motion.div>
        ) : (
          <div className="glass rounded-3xl p-8">
            {/* stepper */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-8 w-8 shrink-0 grid place-items-center rounded-full text-xs font-medium transition ${
                      i <= step
                        ? "bg-gradient-to-br from-primary to-accent text-white"
                        : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 rounded-full transition ${
                        i < step ? "bg-gradient-to-r from-primary to-accent" : "bg-white/5"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <p className="text-lg font-semibold">Account details</p>
                    <Input label="Full name" placeholder="Aarav Sharma" />
                    <Input label="Email" type="email" placeholder="you@email.com" />
                    <Input label="Password" type="password" placeholder="••••••••" />
                  </>
                )}
                {step === 1 && (
                  <>
                    <p className="text-lg font-semibold">Your profile</p>
                    <Input label="Mobile number" placeholder="+91 …" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Date of birth" type="date" />
                      <div>
                        <label className="text-sm font-medium">Gender</label>
                        <select className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent">
                          <option>Prefer not to say</option>
                          <option>Female</option>
                          <option>Male</option>
                          <option>Non-binary</option>
                        </select>
                      </div>
                    </div>
                    <Input label="City" placeholder="Bengaluru" />
                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="text-lg font-semibold">Verify your email</p>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit OTP we just sent to your inbox.
                    </p>
                    <div className="flex gap-2 justify-center">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <input
                          key={i}
                          maxLength={1}
                          className="h-14 w-12 rounded-xl bg-white/5 border border-border text-center text-xl font-semibold outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setDone(true)}
                  className="glow-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium"
                >
                  Verify & finish <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
      />
    </div>
  );
}
