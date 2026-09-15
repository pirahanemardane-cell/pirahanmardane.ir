-- Safe additive constraints for pirahanmardane.ir
-- Run in Supabase SQL Editor. Skips if already exists.
-- Does NOT drop data. Review before run on production.

-- Helpful indexes already applied in performance-indexes.sql

-- Ensure order_items has order_id index (idempotent)
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items (seller_id);

-- Partial unique-ish helpers (non-breaking)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_unique_helper ON profiles (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sellers_slug_unique_helper ON sellers (slug) WHERE slug IS NOT NULL;

-- Comment markers for ops
COMMENT ON TABLE orders IS 'marketplace orders — constraints managed via app + indexes';
