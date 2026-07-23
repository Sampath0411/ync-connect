import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Ticket } from "lucide-react";
import { downloadBase64 } from "@/lib/utils";
import { listMyTickets, getTicketDownload } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/tickets")({
  component: MyTickets,
  head: () => ({ meta: [{ title: "My Tickets — YNC" }] }),
});

function MyTickets() {
  const ticketsFn = useServerFn(listMyTickets);
  const downloadFn = useServerFn(getTicketDownload);
  const q = useQuery({ queryKey: ["my-tickets"], queryFn: () => ticketsFn() });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Your library</p>
        <h1 className="mt-1 text-3xl font-display font-bold flex items-center gap-2">
          <Ticket className="h-6 w-6" /> My Tickets
        </h1>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          Loading…
        </div>
      ) : (q.data?.length ?? 0) === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No tickets yet.</p>
          <Link
            to="/dashboard/events"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {q.data!.map((t: any) => (
            <div key={t.id} className="glass rounded-2xl p-5 flex items-start justify-between gap-3">
              <Link
                to="/dashboard/bookings/$id/ticket"
                params={{ id: t.id }}
                className="flex-1 min-w-0"
              >
                <p className="font-semibold truncate">{t.events?.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.events?.starts_at ? new Date(t.events.starts_at).toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[t.events?.venue, t.events?.city].filter(Boolean).join(" · ") || ""}
                </p>
                <p className="text-xs mt-2">
                  <span className="text-muted-foreground">Code:</span>{" "}
                  <span className="font-mono">{t.ticket_code.slice(0, 8).toUpperCase()}</span>
                  {t.seat_label && <span className="ml-2 text-muted-foreground">seat {t.seat_label}</span>}
                  {t.checked_in_at && <span className="ml-2 text-green-400">✓ checked in</span>}
                </p>
              </Link>
              <button
                onClick={async () => {
                  const res = await downloadFn({ data: { ticket_id: t.id } });
                  downloadBase64(res.pdfBase64, `ync-ticket-${t.ticket_code.slice(0, 8)}.pdf`);
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 shrink-0"
                aria-label="Download ticket"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
