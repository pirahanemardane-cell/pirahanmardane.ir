-- سایزهای استاندارد کامل
INSERT INTO public.catalog_sizes (id, name, slug, active, sort_order, updated_at)
VALUES
  ('size-s',   'S',   's',   true, 1, now()),
  ('size-m',   'M',   'm',   true, 2, now()),
  ('size-l',   'L',   'l',   true, 3, now()),
  ('size-xl',  'XL',  'xl',  true, 4, now()),
  ('size-2xl', '2XL', '2xl', true, 5, now()),
  ('size-3xl', '3XL', '3xl', true, 6, now()),
  ('size-4xl', '4XL', '4xl', true, 7, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  active = true,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- اطمینان publication realtime (اگر از قبل باشد skip)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'products', 'product_variants', 'orders', 'order_items', 'order_returns',
    'sellers', 'profiles', 'user_notifications', 'notifications',
    'carts', 'cart_items', 'wishlists', 'wishlist',
    'coupons', 'campaigns', 'catalog_categories', 'catalog_brands', 'catalog_colors',
    'catalog_sizes', 'catalog_tags', 'catalog_attributes', 'reviews',
    'seller_payout_requests', 'site_settings', 'tickets', 'support_tickets',
    'ticket_messages', 'addresses', 'user_addresses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN RAISE NOTICE 'skip missing: %', t;
      WHEN OTHERS THEN RAISE NOTICE 'skip %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;

SELECT id, name, active, sort_order FROM public.catalog_sizes ORDER BY sort_order;
