
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS message_id text,
  ADD COLUMN IF NOT EXISTS handled_at timestamptz,
  ADD COLUMN IF NOT EXISTS handled_by uuid;

CREATE INDEX IF NOT EXISTS enquiries_message_id_idx ON public.enquiries(message_id);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON public.enquiries(created_at DESC);

-- Backfill default status if null
UPDATE public.enquiries SET status = 'new' WHERE status IS NULL;
ALTER TABLE public.enquiries ALTER COLUMN status SET DEFAULT 'new';
