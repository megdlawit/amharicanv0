-- ═══════════════════════════════════════════════════════════════
-- AMHARICAN — Fix admin_update_user_role RPC
-- Run this if you see: "Could not find the function
-- public.admin_update_user_role(new_permissions, new_role, target_user_id)"
--
-- Root cause: Supabase resolves overloaded functions by sorting
-- parameter names alphabetically when matching the call signature.
-- This recreation uses explicit parameter names that match the JS call.
-- ═══════════════════════════════════════════════════════════════

-- Drop old version (any signature)
DROP FUNCTION IF EXISTS public.admin_update_user_role(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.admin_update_user_role(jsonb, text, uuid);

-- Recreate with correct parameter names and NULL-safe defaults
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id   uuid,
  new_role         text    DEFAULT NULL,
  new_permissions  jsonb   DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if calling user is an admin
  IF (SELECT role FROM public.users WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Access denied: caller is not an admin';
  END IF;

  UPDATE public.users
  SET
    role              = COALESCE(new_role, role),
    admin_permissions = COALESCE(new_permissions, admin_permissions)
  WHERE id = target_user_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_update_user_role TO authenticated;

SELECT 'admin_update_user_role RPC fixed ✓' AS status;
