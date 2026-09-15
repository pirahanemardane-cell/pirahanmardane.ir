-- کمپین‌ها
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'approved',
  active boolean NOT NULL DEFAULT true,
  seller_id uuid REFERENCES public.sellers(id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  discount_percent numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campaigns_public_read ON public.campaigns;
CREATE POLICY campaigns_public_read ON public.campaigns
  FOR SELECT TO anon, authenticated
  USING (active = true AND status = 'approved');

GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
