-- فاز ۱۰: محدودیت‌های ایمن (بدون حذف داده)
-- در Supabase SQL Editor اجرا کنید
-- اگر بخشی به‌خاطر داده تکراری رد شد، بقیه معمولاً OK است

-- ----- ایندکس‌های عملکردی -----
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON public.order_items (seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_authority ON public.orders (payment_authority);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_sellers_owner ON public.sellers (owner_id);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON public.sellers (status);
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON public.sellers (slug);

-- ----- یکتایی شماره موبایل (فقط اگر تکراری نباشد) -----
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone IS NOT NULL AND btrim(phone) <> ''
    GROUP BY phone
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_phone
      ON public.profiles (phone)
      WHERE phone IS NOT NULL AND btrim(phone) <> '';
  ELSE
    RAISE NOTICE 'SKIP uq_profiles_phone: duplicate phones exist';
  END IF;
END $$;

-- ----- یکتایی اسلاگ فروشنده (فقط اگر تکراری نباشد) -----
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.sellers
    WHERE slug IS NOT NULL AND btrim(slug) <> ''
    GROUP BY slug
    HAVING COUNT(*) > 1
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS uq_sellers_slug
      ON public.sellers (slug)
      WHERE slug IS NOT NULL AND btrim(slug) <> '';
  ELSE
    RAISE NOTICE 'SKIP uq_sellers_slug: duplicate slugs exist';
  END IF;
END $$;

-- ----- یکتایی نسبی authority پرداخت (برای جلوگیری از دوباره‌کاری) -----
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_payment_authority
  ON public.orders (payment_authority)
  WHERE payment_authority IS NOT NULL AND btrim(payment_authority) <> '';

COMMENT ON TABLE public.orders IS 'marketplace orders — phase10 indexes/constraints applied';
