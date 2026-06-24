ALTER TABLE public.journal_articles
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS author TEXT;

CREATE INDEX IF NOT EXISTS journal_articles_scheduled_at_idx ON public.journal_articles (scheduled_at);
CREATE INDEX IF NOT EXISTS journal_articles_published_at_idx ON public.journal_articles (published_at);