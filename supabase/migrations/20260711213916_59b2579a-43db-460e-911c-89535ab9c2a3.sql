CREATE OR REPLACE FUNCTION public.increment_visitor_counter()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.visitor_counter
  SET total_count = total_count + 1,
      updated_at = now()
  WHERE id = (SELECT id FROM public.visitor_counter LIMIT 1);
$$;

REVOKE EXECUTE ON FUNCTION public.increment_visitor_counter() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visitor_counter() TO service_role;