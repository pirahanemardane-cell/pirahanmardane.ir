-- ایندکس‌های پرتکرار مارکت‌پلیس پیراهن مردانه
-- در Supabase SQL Editor اجرا کن (یک‌بار)
-- IF NOT EXISTS برای اجرای امن مجدد

-- ----- orders -----
CREATE INDEX IF NOT EXISTS idx_orders_user_created
  ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders (order_number);

CREATE INDEX IF NOT EXISTS idx_orders_paid_at
  ON orders (paid_at DESC NULLS LAST);

-- ----- order_items -----
CREATE INDEX IF NOT EXISTS idx_order_items_seller
  ON order_items (seller_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_seller_order
  ON order_items (seller_id, order_id);

-- ----- products (کاتالوگ / جستجو) -----
CREATE INDEX IF NOT EXISTS idx_products_status_created
  ON products (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_seller_status
  ON products (seller_id, status);

CREATE INDEX IF NOT EXISTS idx_products_category
  ON products (category_id)
  WHERE category_id IS NOT NULL;

-- جستجوی متنی ساده روی title (اگر ستون title باشد)
CREATE INDEX IF NOT EXISTS idx_products_title_trgm
  ON products USING gin (title gin_trgm_ops);

-- اگر extension نباشد، خط بالا fail می‌شود — اختیاری:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- fallback btree برای prefix search
CREATE INDEX IF NOT EXISTS idx_products_title_lower
  ON products (lower(title));

-- ----- sellers -----
CREATE INDEX IF NOT EXISTS idx_sellers_owner
  ON sellers (owner_id);

CREATE INDEX IF NOT EXISTS idx_sellers_status
  ON sellers (status);

CREATE INDEX IF NOT EXISTS idx_sellers_slug
  ON sellers (slug);

-- ----- profiles -----
CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles (phone);

-- ----- cart -----
CREATE INDEX IF NOT EXISTS idx_carts_user
  ON carts (user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart
  ON cart_items (cart_id);

-- ----- tickets / returns (اختیاری) -----
CREATE INDEX IF NOT EXISTS idx_tickets_user
  ON tickets (user_id);

CREATE INDEX IF NOT EXISTS idx_tickets_seller
  ON tickets (seller_id);

CREATE INDEX IF NOT EXISTS idx_order_returns_order
  ON order_returns (order_id);
