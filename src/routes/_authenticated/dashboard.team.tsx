import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMe, verifyCode } from "@/lib/community.functions";
import { ScanLine, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/team")({
  component: TeamPanel,
  head: () => ({ meta: [{ title: "Team — YNC" }] }),
  loader: async () => {
    const me = await getMe();
    const roles = me.roles ?? [];
    if (!roles.includes("team") && !roles.includes("admin")) throw redirect({ to: "/dashboard" });
    return me;
  },
});

function TeamPanel() {
  const verifyFn = useServerFn(verifyCode);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);

  const verify = useMutation({
    mutationFn: (c: string) => verifyFn({ data: { code: c } }),
    onSuccess: (d) => {
      setResult(d);
      if (d.kind === "unknown") toast.error("Code not recognized");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl">
      <div className="glass rounded-3xl p-8">

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
            <ScanLine className="h-3.5 w-3.5" /> Check-in / Verify
          </div>
          <h1 className="text-3xl font-display font-bold">Verify a member or ticket</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste the scanned QR code payload (or a UUID) below. Members and event tickets are both accepted.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim()) return;
              setResult(null);
              verify.mutate(code.trim());
            }}
            className="mt-5 flex gap-2"
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste QR contents or code"
              className="flex-1 rounded-xl bg-white/5 border border-border px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              disabled={verify.isPending}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2"
            >
              {verify.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify
            </button>
          </form>

          {result && (
            <div className="mt-6 rounded-2xl border border-border p-5">
              {result.kind === "unknown" ? (
                <div className="flex items-center gap-3 text-red-300">
                  <XCircle className="h-6 w-6" />
                  <span>Not recognized</span>
                </div>
              ) : result.kind === "member" ? (
                <div>
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">Member verified</span>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {result.holder ?? "—"}</p>
                    <p><span className="text-muted-foreground">City:</span> {result.city ?? "—"}</p>
                    <p><span className="text-muted-foreground">Status:</span> {result.status}</p>
                    <p><span className="text-muted-foreground">Valid until:</span> {result.valid_until ? new Date(result.valid_until).toDateString() : "—"}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`flex items-center gap-3 ${result.alreadyChecked ? "text-yellow-300" : "text-green-300"}`}>
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="font-medium">
                      {result.alreadyChecked ? "Ticket already checked in" : "Ticket checked in"}
                    </span>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Event:</span> {result.event?.title}</p>
                    <p><span className="text-muted-foreground">Holder:</span> {result.holder ?? "—"}</p>
                    <p><span className="text-muted-foreground">When:</span> {result.event?.starts_at ? new Date(result.event.starts_at).toLocaleString() : "—"}</p>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}

