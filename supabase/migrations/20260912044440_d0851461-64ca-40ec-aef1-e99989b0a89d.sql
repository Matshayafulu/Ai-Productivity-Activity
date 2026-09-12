CREATE OR REPLACE FUNCTION public.email_exists(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE LOWER(profiles.email) = LOWER(email_input)
  );
$$;

GRANT EXECUTE ON FUNCTION public.email_exists(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.email_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.email_exists(TEXT) TO service_role;