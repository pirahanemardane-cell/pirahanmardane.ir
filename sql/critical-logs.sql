-- جدول لاگ خطاهای حیاتی (در SQL Editor سوپابیس اجرا کنید)
-- امن و idempotent است

CREATE TABLE IF NOT EXISTS public.critical_logs (
  id bigserial PRIMARY KEY,
  source text,
  message text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_critical_logs_created_at
  ON public.critical_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_critical_logs_source
  ON public.critical_logs (source);

ALTER TABLE public.critical_logs ENABLE ROW LEVEL SECURITY;

-- فقط service role از سرور می‌نویسد؛ policy عمومی ندهید
