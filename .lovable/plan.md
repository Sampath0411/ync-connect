## Goal
Turn the current YNC demo site into a working full-stack platform: real auth with roles, membership approvals with downloadable QR cards, event tickets with Stripe payments and downloadable QR PDFs, and role-scoped dashboards. Remove all demo/placeholder pieces.

## Scope of this build

### 1. Backend (Lovable Cloud)
- Enable Lovable Cloud (Supabase).
- Tables (all with RLS + GRANTs):
  - `profiles` (id → auth.users, full_name, phone, city, dob, gender, avatar_url)
  - `user_roles` (user_id, role: `admin` | `team` | `member`) via enum + `has_role()` security-definer
  - `memberships` (user_id, status: pending/approved/rejected, approved_at, valid_until, card_code UUID)
  - `events` (id, title, slug, description, cover_url, starts_at, venue, price_cents, capacity, status)
  - `tickets` (id, event_id, user_id, status: pending/paid/cancelled, ticket_code UUID, stripe_session_id, amount_cents, created_at)
- Trigger: auto-create `profiles` + default `member` role on signup.
- RLS: users read/update own profile, own membership, own tickets; admins/team read all; only admins mutate events, approve memberships, assign roles.

### 2. Auth
- Real Supabase auth (email + password, Google OAuth via `lovable.auth.signInWithOAuth`).
- Rewrite `/login` and `/join` to use Supabase (remove fake multi-step demo — keep the visual style but wire real signup → profile insert → membership request).
- `/auth` public route (sign in / sign up tabs). `/reset-password` page.
- `_authenticated/route.tsx` gate (integration-managed).
- Root `onAuthStateChange` subscriber + session-aware navbar (avatar menu / Sign in).

### 3. Dashboards (all under `_authenticated/`)
- `/dashboard` — member: membership status, download card button, my tickets list with download.
- `/dashboard/team` — team: scan/verify card & ticket codes, view attendee lists (gated by `has_role('team')` or admin).
- `/dashboard/admin` — admin: pending memberships (approve/reject), events CRUD, users + roles, ticket sales overview.

### 4. Payments (Stripe seamless)
- Enable `enable_stripe_payments`. Products created per event via `batch_create_product` on admin event create.
- `POST /api/checkout` server fn: create Checkout Session for event, insert pending ticket.
- `POST /api/public/webhooks/stripe` server route: verify signature, mark ticket paid, generate `ticket_code`.

### 5. QR downloads (PDF + PNG)
- `qrcode` npm package for PNG data URLs, `pdf-lib` for PDFs (Worker-safe, both pure JS).
- `downloadMembershipCard(userId)` server fn → returns PDF bytes + PNG; card shows name, member code, valid_until, QR encoding `ync:card:<code>`.
- `downloadTicket(ticketId)` server fn → PDF + PNG with event details + QR `ync:ticket:<code>`.
- Client "Download PDF" / "Download PNG" buttons trigger the server fn and save via Blob.
- Verify endpoint `/api/verify?code=...` (team-gated) returns validity.

### 6. Cleanup
- Remove demo perks-only Membership CTA path; wire "Join Now" → real signup → auto-create pending membership.
- Remove hardcoded events; drive `/events` from `events` table (seeded via migration with real starter rows).
- Remove demo login form; keep visuals.

## Technical notes
- QR: `qrcode` (Worker-safe, no native deps). PDF: `pdf-lib` (pure JS).
- Stripe: seamless integration; use `managed_payments` (digital ticket = eligible).
- Role check on server via `context.supabase.rpc('has_role', ...)` before any privileged op.
- All server fns using auth use `requireSupabaseAuth` middleware; bearer attacher already in `src/start.ts` (add if missing).
- Storage bucket `avatars` (public) for profile pics; `event-covers` (public) for event images.

## Out of scope (ask if wanted)
- Email templates beyond Supabase defaults (auth emails work out of the box).
- Native mobile card wallet (Apple/Google Wallet passes).
- SMS OTP (email verification only).

## Confirmation
This is ~2–3 hours of focused build with many migrations, server fns, and UI wiring. Confirm and I'll execute end-to-end in one pass; the preview will be briefly noisy while Cloud + Stripe enable.
