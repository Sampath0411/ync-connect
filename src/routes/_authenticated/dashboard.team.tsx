import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getMe, verifyCode } from "@/lib/community.functions";
import { ScanLine, Loader2, CheckCircle2, XCircle, Camera, CameraOff } from "lucide-react";
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
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const verify = useMutation({
    mutationFn: (c: string) => verifyFn({ data: { code: c } }),
    onSuccess: (d) => {
      setResult(d);
      if (d.kind === "unknown") toast.error("Code not recognized");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const stopScan = () => {
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let raf = 0;
    const BD = (window as any).BarcodeDetector;
    if (!BD) {
      toast.error("Camera scanner not supported here — paste the code instead.");
      setScanning(false);
      return;
    }
    const detector = new BD({ formats: ["qr_code"] });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) {
              const val = codes[0].rawValue as string;
              setCode(val);
              stopScan();
              setResult(null);
              verify.mutate(val);
              return;
            }
          } catch {}
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (err: any) {
        toast.error(err.message ?? "Camera error");
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [scanning]);

  return (
    <div className="max-w-3xl">
      <div className="glass rounded-3xl p-8">

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent mb-3">
            <ScanLine className="h-3.5 w-3.5" /> Check-in / Verify
          </div>
          <h1 className="text-3xl font-display font-bold">Verify a member or ticket</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan the QR with your camera, or paste the code below.
          </p>

          <div className="mt-5">
            {scanning ? (
              <div className="relative rounded-2xl overflow-hidden border border-border bg-black">
                <video ref={videoRef} playsInline muted className="w-full max-h-[360px] object-cover" />
                <button
                  onClick={stopScan}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs inline-flex items-center gap-1"
                >
                  <CameraOff className="h-3.5 w-3.5" /> Stop
                </button>
              </div>
            ) : (
              <button
                onClick={() => setScanning(true)}
                className="w-full py-3 rounded-xl border border-border bg-white/5 hover:bg-white/10 text-sm inline-flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" /> Scan with camera
              </button>
            )}
          </div>

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

