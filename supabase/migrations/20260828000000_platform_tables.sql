-- Platform tables: notifications, shipping, settings, payouts, audit, seller KYC fields, blog categories

-- ---------- Extend sellers (KYC / sheba / location) ----------
alter table public.sellers
  add column if not exists kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'approved', 'rejected')),
  add column if not exists sheba_status text not null default 'pending'
    check (sheba_status in ('pending', 'approved', 'rejected')),
  add column if not exists location_status text not null default 'pending'
    check (location_status in ('pending', 'approved', 'rejected')),
  add column if not exists national_id text,
  add column if not exists discount_quota int not null default 0;

-- ---------- Notifications ----------
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  type text default 'info',
  read boolean not null default false,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_user_idx on public.user_notifications (user_id, created_at desc);
alter table public.user_notifications enable row level security;
drop policy if exists "notif_select_own" on public.user_notifications;
create policy "notif_select_own" on public.user_notifications for select using (auth.uid() = user_id);
drop policy if exists "notif_update_own" on public.user_notifications;
create policy "notif_update_own" on public.user_notifications for update using (auth.uid() = user_id);
drop policy if exists "notif_delete_own" on public.user_notifications;
create policy "notif_delete_own" on public.user_notifications for delete using (auth.uid() = user_id);
-- insert only via service role (no public insert policy)

-- ---------- Shipping methods ----------
create table if not exists public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  price int not null default 0,
  eta text,
  enabled boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shipping_methods enable row level security;
drop policy if exists "shipping_public_read" on public.shipping_methods;
create policy "shipping_public_read" on public.shipping_methods for select using (enabled = true);
-- writes via service role only

-- ---------- Site settings (FAQ, CMS pages, etc.) ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
alter table public.site_settings enable row level security;
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select using (true);
-- writes via service role

insert into public.site_settings (key, value) values
  ('faqs', '[]'::jsonb),
  ('pages', '{}'::jsonb),
  ('general', '{}'::jsonb)
on conflict (key) do nothing;

-- ---------- Blog categories ----------
create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.blog_categories enable row level security;
drop policy if exists "blog_cat_public_read" on public.blog_categories;
create policy "blog_cat_public_read" on public.blog_categories for select using (active = true);

alter table public.blog_posts
  add column if not exists category_id uuid references public.blog_categories (id) on delete set null,
  add column if not exists cover_image text;
-- keep cover_url; API may use cover_image

-- ---------- Seller payout requests ----------
create table if not exists public.seller_payout_requests (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  amount int not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'paid')),
  note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists seller_payouts_seller_idx on public.seller_payout_requests (seller_id, created_at desc);
alter table public.seller_payout_requests enable row level security;
drop policy if exists "payout_seller_select" on public.seller_payout_requests;
create policy "payout_seller_select" on public.seller_payout_requests for select
  using (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));
drop policy if exists "payout_seller_insert" on public.seller_payout_requests;
create policy "payout_seller_insert" on public.seller_payout_requests for insert
  with check (exists (select 1 from public.sellers s where s.id = seller_id and s.owner_id = auth.uid()));

-- ---------- Admin audit log ----------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on public.admin_audit_logs (created_at desc);
alter table public.admin_audit_logs enable row level security;
-- only service role reads/writes (no policies for anon/authenticated)

-- ---------- Coupons: allow seller-scoped optional ----------
alter table public.coupons
  add column if not exists seller_id uuid references public.sellers (id) on delete cascade,
  add column if not exists title text;

-- ---------- Account deletion marker on profiles ----------
alter table public.profiles
  add column if not exists deleted_at timestamptz,
  add column if not exists is_super_admin boolean not null default false;
