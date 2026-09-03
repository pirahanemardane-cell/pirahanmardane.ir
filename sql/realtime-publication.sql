-- Realtime publication — یک‌بار در Supabase SQL Editor
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'products', 'product_variants', 'orders', 'order_items', 'order_returns',
    'sellers', 'profiles', 'user_notifications', 'carts', 'cart_items', 'wishlists',
    'coupons', 'campaigns', 'catalog_categories', 'catalog_brands', 'catalog_colors',
    'catalog_sizes', 'catalog_tags', 'catalog_attributes', 'reviews',
    'seller_payout_requests', 'site_settings', 'tickets', 'support_tickets',
    'addresses', 'user_addresses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN RAISE NOTICE 'skip missing table: %', t;
      WHEN OTHERS THEN RAISE NOTICE 'skip %: %', t, SQLERRM;
    END;
  END LOOP;
END $$;
