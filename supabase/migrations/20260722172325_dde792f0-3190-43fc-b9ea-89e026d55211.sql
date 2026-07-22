
-- Fix: has_role executed by anon (public event reads hit RLS policy referencing has_role)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  percent_off int check (percent_off is null or (percent_off between 1 and 100)),
  amount_off_cents int check (amount_off_cents is null or amount_off_cents >= 0),
  max_uses int,
  uses_count int not null default 0,
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads active coupons" ON public.coupons;
CREATE POLICY "Anyone reads active coupons" ON public.coupons FOR SELECT
  TO anon, authenticated USING (active = true);

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Track coupon + seat/quantity metadata on tickets
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS seat_label text;
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS booking_group uuid;
