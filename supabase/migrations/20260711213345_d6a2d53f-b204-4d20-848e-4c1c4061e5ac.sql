CREATE TABLE public.visitor_counter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.visitor_counter TO authenticated;
GRANT ALL ON public.visitor_counter TO service_role;

ALTER TABLE public.visitor_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read visitor counter"
  ON public.visitor_counter
  FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.increment_visitor_counter()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.visitor_counter
  SET total_count = total_count + 1,
      updated_at = now();
$$;

INSERT INTO public.visitor_counter (total_count, updated_at)
VALUES (0, now());