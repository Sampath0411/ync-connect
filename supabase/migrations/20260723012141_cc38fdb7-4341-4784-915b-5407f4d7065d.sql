
-- Switch has_role to SECURITY INVOKER so it no longer runs with elevated privileges.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Anon must be able to read user_roles (RLS still hides rows) so RLS policies
-- on events that call has_role() during anon reads don't fail on GRANT checks.
GRANT SELECT ON public.user_roles TO anon;

-- Keep EXECUTE for the roles that need to call it from policies / RPC.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
