import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calendar, Download, MapPin, Loader2, Ticket as TicketIcon } from "lucide-react";
import { getTicketById, getTicketDownload } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/bookings/$id/ticket")({
  component: TicketPage,
  head: () => ({ meta: [{ title: "Your Ticket — YNC" }] }),
});

function TicketPage() {
  const { id } = Route.useParams();
  const infoFn = useServerFn(getTicketById);
  const dlFn = useServerFn(getTicketDownload);

  const ticketQ = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => infoFn({ data: { ticket_id: id } }),
  });
  const downloadQ = useQuery({
    queryKey: ["ticket-download", id],
    queryFn: () => dlFn({ data: { ticket_id: id } }),
  });

  if (ticketQ.isLoading || downloadQ.isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (ticketQ.error || !ticketQ.data) {
    return <p className="text-sm text-destructive">Ticket not found or you don't have access.</p>;
  }

  const t: any = ticketQ.data;
  const ev = t.events;
  const dl = downloadQ.data;

  const downloadPdf = () => {
    if (!dl) return;
    const bin = atob(dl.pdfBase64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ync-ticket-${t.ticket_code.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/dashboard/tickets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All tickets
      </Link>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary via-accent to-primary relative">
          {ev?.cover_url && (
            <img src={ev.cover_url} alt={ev.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <p className="text-xs uppercase tracking-widest text-white/70 flex items-center gap-1.5">
              <TicketIcon className="h-3.5 w-3.5" /> Booking confirmed
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-display font-bold text-white">{ev?.title}</h1>
          </div>
        </div>

        <div className="p-6 grid gap-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3 text-sm">
            {ev?.starts_at && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> {new Date(ev.starts_at).toLocaleString()}
              </p>
            )}
            {(ev?.venue || ev?.city) && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {[ev?.venue, ev?.city].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <Info label="Ticket code" value={t.ticket_code.slice(0, 8).toUpperCase()} />
              <Info label="Status" value={t.status} />
              {t.seat_label && <Info label="Seat" value={t.seat_label} />}
              <Info label="Amount" value={`₹${(t.amount_cents / 100).toFixed(2)}`} />
              {t.coupon_code && <Info label="Coupon" value={t.coupon_code} />}
              {t.checked_in_at && <Info label="Checked in" value={new Date(t.checked_in_at).toLocaleString()} />}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-3">
              {dl?.qrDataUrl ? (
                <img src={dl.qrDataUrl} alt="Ticket QR" className="h-44 w-44" />
              ) : (
                <div className="h-44 w-44 grid place-items-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={downloadPdf}
              disabled={!dl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <p className="text-[11px] text-muted-foreground text-center">Show this QR at entry</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
