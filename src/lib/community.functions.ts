import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// ---------- Public read: events ----------
function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const { data, error } = await s
    .from("events")
    .select("id, slug, title, description, cover_url, category, starts_at, ends_at, venue, city, price_cents, member_price_cents, status, capacity")
    .eq("status", "published")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

// ---------- Session bootstrap ----------
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileRes, rolesRes, membershipRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("memberships").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return {
      userId,
      email: context.claims.email as string | undefined,
      profile: profileRes.data,
      roles: (rolesRes.data ?? []).map((r) => r.role),
      membership: membershipRes.data,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { full_name?: string; phone?: string; city?: string; dob?: string; gender?: string }) =>
    z
      .object({
        full_name: z.string().max(120).optional(),
        phone: z.string().max(30).optional(),
        city: z.string().max(120).optional(),
        dob: z.string().optional(),
        gender: z.string().max(30).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Membership ----------
export const requestMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const existing = await supabase.from("memberships").select("id, status").eq("user_id", userId).maybeSingle();
    if (existing.data) return { ok: true, status: existing.data.status };
    const { error } = await supabase.from("memberships").insert({ user_id: userId, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true, status: "pending" as const };
  });

export const listPendingMemberships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("memberships")
      .select("*, profiles:profiles!memberships_user_id_fkey(full_name, phone, city)")
      .order("requested_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const decideMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { membership_id: string; decision: "approved" | "rejected" }) =>
    z.object({ membership_id: z.string().uuid(), decision: z.enum(["approved", "rejected"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const update =
      data.decision === "approved"
        ? {
            status: "approved" as const,
            approved_at: new Date().toISOString(),
            approved_by: context.userId,
            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          }
        : { status: "rejected" as const };
    const { error } = await context.supabase.from("memberships").update(update).eq("id", data.membership_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Tickets ----------
export const reserveTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { event_id: string }) => z.object({ event_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // check existing
    const existing = await supabase
      .from("tickets")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", data.event_id)
      .maybeSingle();
    if (existing.data) return { ok: true, ticket_id: existing.data.id };

    const eventRes = await supabase
      .from("events")
      .select("price_cents, member_price_cents")
      .eq("id", data.event_id)
      .single();
    if (eventRes.error) throw new Error(eventRes.error.message);
    const membershipRes = await supabase
      .from("memberships")
      .select("status, valid_until")
      .eq("user_id", userId)
      .maybeSingle();
    const isActiveMember =
      membershipRes.data?.status === "approved" &&
      (!membershipRes.data.valid_until || new Date(membershipRes.data.valid_until) > new Date());
    const amount = isActiveMember ? eventRes.data.member_price_cents : eventRes.data.price_cents;

    const ins = await supabase
      .from("tickets")
      .insert({
        event_id: data.event_id,
        user_id: userId,
        amount_cents: amount,
        status: amount === 0 ? "paid" : "paid", // Stripe not wired yet; auto-confirm all reservations
      })
      .select("id")
      .single();
    if (ins.error) throw new Error(ins.error.message);
    return { ok: true, ticket_id: ins.data.id };
  });

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tickets")
      .select("*, events(title, starts_at, venue, city, cover_url)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- QR + PDF ----------
async function qrPngBytes(payload: string): Promise<Uint8Array> {
  const dataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 512, errorCorrectionLevel: "H" });
  const b64 = dataUrl.split(",")[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export const getMembershipCard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [mRes, pRes] = await Promise.all([
      supabase.from("memberships").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("full_name, city").eq("id", userId).maybeSingle(),
    ]);
    if (!mRes.data || mRes.data.status !== "approved") throw new Error("Membership not approved");
    const m = mRes.data;
    const p = pRes.data;
    const payload = JSON.stringify({ t: "ync-member", code: m.card_code });
    const qrPng = await qrPngBytes(payload);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([600, 380]);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({ x: 0, y: 0, width: 600, height: 380, color: rgb(0.06, 0.07, 0.12) });
    page.drawRectangle({ x: 0, y: 340, width: 600, height: 40, color: rgb(0.24, 0.29, 0.85) });
    page.drawText("YNC · Youth Network Community", { x: 24, y: 352, size: 14, font, color: rgb(1, 1, 1) });

    page.drawText("Member", { x: 24, y: 300, size: 10, font: fontReg, color: rgb(0.7, 0.75, 0.9) });
    page.drawText(p?.full_name ?? "Member", { x: 24, y: 272, size: 22, font, color: rgb(1, 1, 1) });
    if (p?.city) page.drawText(p.city, { x: 24, y: 250, size: 11, font: fontReg, color: rgb(0.7, 0.75, 0.9) });

    page.drawText(`Card ID: ${m.card_code.slice(0, 8).toUpperCase()}`, {
      x: 24,
      y: 90,
      size: 10,
      font: fontReg,
      color: rgb(0.7, 0.75, 0.9),
    });
    const validUntil = m.valid_until ? new Date(m.valid_until).toDateString() : "—";
    page.drawText(`Valid until: ${validUntil}`, { x: 24, y: 72, size: 10, font: fontReg, color: rgb(0.7, 0.75, 0.9) });
    page.drawText("Scan to verify", { x: 24, y: 40, size: 9, font: fontReg, color: rgb(0.55, 0.6, 0.8) });

    const qrImg = await pdf.embedPng(qrPng);
    page.drawRectangle({ x: 430, y: 40, width: 150, height: 150, color: rgb(1, 1, 1) });
    page.drawImage(qrImg, { x: 440, y: 50, width: 130, height: 130 });

    const pdfBytes = await pdf.save();
    return {
      code: m.card_code,
      pdfBase64: bytesToBase64(pdfBytes),
      qrDataUrl: `data:image/png;base64,${bytesToBase64(qrPng)}`,
      valid_until: m.valid_until,
    };
  });

export const getTicketDownload = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ticket_id: string }) => z.object({ ticket_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: t, error } = await supabase
      .from("tickets")
      .select("*, events(title, starts_at, venue, city)")
      .eq("id", data.ticket_id)
      .single();
    if (error) throw new Error(error.message);
    if (t.user_id !== userId) throw new Error("Forbidden");

    const payload = JSON.stringify({ t: "ync-ticket", code: t.ticket_code });
    const qrPng = await qrPngBytes(payload);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([600, 260]);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

    page.drawRectangle({ x: 0, y: 0, width: 600, height: 260, color: rgb(0.06, 0.07, 0.12) });
    page.drawRectangle({ x: 0, y: 220, width: 600, height: 40, color: rgb(0.24, 0.29, 0.85) });
    page.drawText("YNC · Event Ticket", { x: 24, y: 232, size: 13, font, color: rgb(1, 1, 1) });

    const ev = (t as any).events;
    page.drawText(ev?.title ?? "Event", { x: 24, y: 180, size: 18, font, color: rgb(1, 1, 1) });
    if (ev?.starts_at)
      page.drawText(new Date(ev.starts_at).toLocaleString(), {
        x: 24,
        y: 158,
        size: 10,
        font: fontReg,
        color: rgb(0.75, 0.8, 0.95),
      });
    if (ev?.venue || ev?.city)
      page.drawText([ev?.venue, ev?.city].filter(Boolean).join(" · "), {
        x: 24,
        y: 142,
        size: 10,
        font: fontReg,
        color: rgb(0.75, 0.8, 0.95),
      });

    page.drawText(`Ticket: ${t.ticket_code.slice(0, 8).toUpperCase()}`, {
      x: 24,
      y: 60,
      size: 10,
      font: fontReg,
      color: rgb(0.7, 0.75, 0.9),
    });
    page.drawText(`Amount: ₹${(t.amount_cents / 100).toFixed(2)}`, {
      x: 24,
      y: 44,
      size: 10,
      font: fontReg,
      color: rgb(0.7, 0.75, 0.9),
    });
    page.drawText("Scan at entry", { x: 24, y: 24, size: 9, font: fontReg, color: rgb(0.55, 0.6, 0.8) });

    const qrImg = await pdf.embedPng(qrPng);
    page.drawRectangle({ x: 440, y: 30, width: 140, height: 140, color: rgb(1, 1, 1) });
    page.drawImage(qrImg, { x: 450, y: 40, width: 120, height: 120 });

    const pdfBytes = await pdf.save();
    return {
      code: t.ticket_code,
      pdfBase64: bytesToBase64(pdfBytes),
      qrDataUrl: `data:image/png;base64,${bytesToBase64(qrPng)}`,
    };
  });

// ---------- Admin: users, roles, events ----------
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profiles = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false });
    const roles = await supabaseAdmin.from("user_roles").select("*");
    if (profiles.error) throw new Error(profiles.error.message);
    return (profiles.data ?? []).map((p) => ({
      ...p,
      roles: (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
  });

// Recent sign-in / activity view — pulls last_sign_in_at from auth.users (admin only)
export const adminListSignins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) throw new Error(error.message);
    const users = (data?.users ?? [])
      .map((u) => ({
        id: u.id,
        email: u.email,
        full_name: (u.user_metadata as any)?.full_name ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }))
      .sort((a, b) => (b.last_sign_in_at ?? "").localeCompare(a.last_sign_in_at ?? ""));
    return users;
  });


export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; role: "admin" | "team" | "member"; grant: boolean }) =>
    z
      .object({
        user_id: z.string().uuid(),
        role: z.enum(["admin", "team", "member"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminUpsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id?: string;
      slug: string;
      title: string;
      description?: string;
      cover_url?: string;
      category?: string;
      starts_at: string;
      ends_at?: string;
      venue?: string;
      city?: string;
      price_cents: number;
      member_price_cents: number;
      capacity?: number;
      status: "draft" | "published" | "closed";
    }) =>
      z
        .object({
          id: z.string().uuid().optional(),
          slug: z.string().min(2).max(100),
          title: z.string().min(2).max(200),
          description: z.string().max(4000).optional(),
          cover_url: z.string().url().optional().or(z.literal("")),
          category: z.string().max(50).optional(),
          starts_at: z.string(),
          ends_at: z.string().optional(),
          venue: z.string().max(200).optional(),
          city: z.string().max(100).optional(),
          price_cents: z.number().int().min(0),
          member_price_cents: z.number().int().min(0),
          capacity: z.number().int().min(0).optional(),
          status: z.enum(["draft", "published", "closed"]),
        })
        .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const payload = { ...data, created_by: context.userId };
    const { error } = data.id
      ? await context.supabase.from("events").update(payload).eq("id", data.id)
      : await context.supabase.from("events").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("events").select("*").order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Team: check-in ----------
export const verifyCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => z.object({ code: z.string().min(4) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // parse possibly-JSON payload
    let code = data.code.trim();
    try {
      const parsed = JSON.parse(code);
      if (parsed?.code) code = parsed.code;
    } catch {
      // plain code
    }

    const ticketRes = await supabase
      .from("tickets")
      .select("id, ticket_code, checked_in_at, events(title, starts_at, venue), user_id")
      .eq("ticket_code", code)
      .maybeSingle();
    if (ticketRes.data) {
      let alreadyChecked = !!ticketRes.data.checked_in_at;
      if (!alreadyChecked) {
        await supabase
          .from("tickets")
          .update({ checked_in_at: new Date().toISOString(), checked_in_by: context.userId })
          .eq("id", ticketRes.data.id);
      }
      const profile = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", ticketRes.data.user_id)
        .maybeSingle();
      return {
        kind: "ticket" as const,
        alreadyChecked,
        event: (ticketRes.data as any).events,
        holder: profile.data?.full_name,
      };
    }

    const memRes = await supabase
      .from("memberships")
      .select("status, valid_until, user_id")
      .eq("card_code", code)
      .maybeSingle();
    if (memRes.data) {
      const profile = await supabase
        .from("profiles")
        .select("full_name, city")
        .eq("id", memRes.data.user_id)
        .maybeSingle();
      return {
        kind: "member" as const,
        status: memRes.data.status,
        valid_until: memRes.data.valid_until,
        holder: profile.data?.full_name,
        city: profile.data?.city,
      };
    }

    return { kind: "unknown" as const };
  });
