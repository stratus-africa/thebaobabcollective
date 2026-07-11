REVOKE EXECUTE ON FUNCTION public.increment_visitor_counter() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visitor_counter() TO service_role;