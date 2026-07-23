import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { EventCardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { Calendar, Loader2, MapPin, Ticket, X, Tag, Check } from "lucide-react";
import { toast } from "sonner";
import { listPublicEvents, listMyTickets, bookEvent, validateCoupon } from "@/lib/community.functions";

export const Route = createFileRoute("/_authenticated/dashboard/events")({
  component: DashboardEvents,
  head: () => ({ meta: [{ title: "Events — YNC" }] }),
});

function DashboardEvents() {
  const eventsFn = useServerFn(listPublicEvents);
  const ticketsFn = useServerFn(listMyTickets);
  const eventsQ = useQuery({ queryKey: ["public-events"], queryFn: () => eventsFn() });
  const ticketsQ = useQuery({ queryKey: ["my-tickets"], queryFn: () => ticketsFn() });
  const mineCount = new Map<string, number>();
  for (const t of ticketsQ.data ?? []) mineCount.set((t as any).event_id, (mineCount.get((t as any).event_id) ?? 0) + 1);

  const [booking, setBooking] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent">Community</p>
        <h1 className="mt-1 text-3xl font-display font-bold">Events</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Book seats — members get discounts. Apply a coupon at checkout.
        </p>
      </div>

      {eventsQ.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : (eventsQ.data?.length ?? 0) === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
          No events published yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {eventsQ.data!.map((e: any) => {
            const owned = mineCount.get(e.id) ?? 0;
            return (
              <div key={e.id} className="glass rounded-3xl overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-primary to-accent relative">
                  {e.cover_url && (
                    <img src={e.cover_url} alt={e.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
                  )}
                  {e.category && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs bg-black/40 backdrop-blur">
                      {e.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{e.title}</h3>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(e.starts_at).toLocaleString()}
                    </p>
                    {(e.venue || e.city) && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {[e.venue, e.city].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {e.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="line-through text-muted-foreground mr-2">₹{(e.price_cents / 100).toFixed(0)}</span>
                      <span className="font-semibold text-accent">₹{(e.member_price_cents / 100).toFixed(0)} member</span>
                    </div>
                    <button
                      onClick={() => setBooking(e)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-medium"
                    >
                      <Ticket className="h-4 w-4" /> {owned > 0 ? `Book more (${owned})` : "Book"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {booking && <BookingSheet event={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

function BookingSheet({ event, onClose }: { event: any; onClose: () => void }) {
  const bookFn = useServerFn(bookEvent);
  const validateFn = useServerFn(validateCoupon);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [seatInput, setSeatInput] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent_off: number | null; amount_off_cents: number | null } | null>(null);
  const [validating, setValidating] = useState(false);

  const base = event.member_price_cents ?? event.price_cents;
  let unit = base;
  if (coupon?.percent_off) unit = Math.round(unit * (1 - coupon.percent_off / 100));
  if (coupon?.amount_off_cents) unit = Math.max(0, unit - coupon.amount_off_cents);
  const total = unit * quantity;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidating(true);
    try {
      const res = await validateFn({ data: { code: couponInput, event_id: event.id } });
      if (!res.ok) {
        toast.error(res.error);
        setCoupon(null);
      } else {
        setCoupon({ code: res.code, percent_off: res.percent_off, amount_off_cents: res.amount_off_cents });
        toast.success(`Coupon ${res.code} applied`);
      }
    } finally {
      setValidating(false);
    }
  };

  const book = useMutation({
    mutationFn: () =>
      bookFn({
        data: {
          event_id: event.id,
          quantity,
          seat_labels: seatInput.trim()
            ? seatInput.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
          coupon_code: coupon?.code,
        },
      }),
    onSuccess: (res) => {
      toast.success("Booking confirmed");
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      const firstId = res.ticket_ids[0];
      onClose();
      if (firstId) navigate({ to: "/dashboard/bookings/$id/ticket", params: { id: firstId } });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg glass rounded-3xl p-6 border border-white/10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">Book event</p>
            <h2 className="mt-1 text-2xl font-display font-bold">{event.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(event.starts_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Quantity</span>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-xl border border-border hover:bg-white/5"
              >
                −
              </button>
              <div className="flex-1 text-center py-2 rounded-xl bg-white/5 border border-border font-semibold">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                className="h-9 w-9 rounded-xl border border-border hover:bg-white/5"
              >
                +
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-muted-foreground">Seat labels (optional, comma-separated)</span>
            <input
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)}
              placeholder="A1, A2"
              className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2 outline-none focus:border-accent text-sm"
            />
          </label>

          <div>
            <span className="text-xs text-muted-foreground">Coupon</span>
            <div className="mt-1 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                disabled={!!coupon}
                className="flex-1 rounded-xl bg-white/5 border border-border px-3 py-2 outline-none focus:border-accent text-sm disabled:opacity-60"
              />
              {coupon ? (
                <button
                  type="button"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  className="px-3 py-2 rounded-xl border border-border text-sm"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={validating}
                  className="px-3 py-2 rounded-xl border border-accent/30 bg-accent/10 text-sm inline-flex items-center gap-1"
                >
                  {validating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                  Apply
                </button>
              )}
            </div>
            {coupon && (
              <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                {coupon.percent_off
                  ? `${coupon.percent_off}% off`
                  : `₹${((coupon.amount_off_cents ?? 0) / 100).toFixed(0)} off`}{" "}
                per ticket
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white/[0.02] p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Unit price</span>
              <span>₹{(unit / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>₹{(total / 100).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Bookings are confirmed instantly. Payment integration coming soon.
          </p>

          <button
            disabled={book.isPending}
            onClick={() => book.mutate()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {book.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}
