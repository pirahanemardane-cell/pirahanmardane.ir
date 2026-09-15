-- =============================================================================
-- فروشگاه پیراهن مردانه — اسکمای اولیه Supabase
-- اجرا: supabase db push   یا از SQL Editor پنل Supabase
-- =============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type public.user_role as enum ('buyer', 'seller', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.seller_status as enum ('pending', 'approved', 'suspended', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.product_status as enum ('draft', 'pending', 'active', 'rejected', 'inactive');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'pending_payment', 'paid', 'preparing', 'shipped', 'delivered',
    'cancelled', 'returned', 'refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_status as enum ('open', 'pending', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ticket_type as enum ('buyer', 'seller', 'system');
exception when duplicate_object then null;
end $$;

-- ---------- Profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'buyer',
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_phone_idx on public.profiles (phone);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------- Sellers ----------
create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  shop_name text not null,
  slug text unique,
  status public.seller_status not null default 'pending',
  about text,
  city text,
  address text,
  phone text,
  sheba text,
  logo_url text,
  banner_url text,
  rating numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sellers_owner_idx on public.sellers (owner_id);
create index if not exists sellers_status_idx on public.sellers (status);

-- ---------- Categories & brands ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  name text not null,
  slug text,
  description text,
  status public.product_status not null default 'draft',
  base_price int not null default 0 check (base_price >= 0),
  compare_at_price int,
  currency text not null default 'IRT',
  is_amazing boolean not null default false,
  deal_ends_at timestamptz,
  rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  seo_title text,
  seo_description text,
  product_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);

-- Variants: color + size (+ stock/price override)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text,
  color_name text,
  color_hex text,
  size text,
  price int,
  stock int not null default 0 check (stock >= 0),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, color_name, size)
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Addresses ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  receiver_name text,
  phone text,
  province text,
  city text,
  address_line text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------- Cart ----------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  qty int not null default 1 check (qty > 0),
  unit_price int not null default 0,
  created_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles (id) on delete restrict,
  status public.order_status not null default 'pending_payment',
  subtotal int not null default 0,
  shipping_cost int not null default 0,
  tax int not null default 0,
  discount int not null default 0,
  payable int not null default 0,
  currency text not null default 'IRT',
  coupon_code text,
  shipping_method text,
  payment_method text,
  address_snapshot jsonb,
  contact_snapshot jsonb,
  note text,
  tracking_code text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  seller_id uuid references public.sellers (id) on delete set null,
  name text not null,
  color_name text,
  size text,
  image_url text,
  qty int not null check (qty > 0),
  unit_price int not null,
  line_total int not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_seller_idx on public.order_items (seller_id);

-- ---------- Wishlist ----------
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- Reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id, order_id)
);

-- ---------- Tickets ----------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  type public.ticket_type not null default 'buyer',
  status public.ticket_status not null default 'open',
  subject text not null,
  user_id uuid references public.profiles (id) on delete set null,
  seller_id uuid references public.sellers (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_role text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- Blog ----------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  excerpt text,
  body text,
  cover_url text,
  status text not null default 'draft',
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Coupons ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'amount')),
  value int not null check (value > 0),
  min_cart int not null default 0,
  max_uses int,
  max_per_user int,
  used_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists sellers_updated_at on public.sellers;
create trigger sellers_updated_at
  before update on public.sellers
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- Auto profile on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name, role)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.coupons enable row level security;

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- Categories / brands: public read
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (active = true or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands_public_read" on public.brands;
create policy "brands_public_read" on public.brands
  for select using (active = true or public.is_admin());

drop policy if exists "brands_admin_write" on public.brands;
create policy "brands_admin_write" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

-- Products: public read active; seller manages own; admin all
drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
  for select using (
    status = 'active'
    or public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

drop policy if exists "products_seller_insert" on public.products;
create policy "products_seller_insert" on public.products
  for insert with check (
    public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid() and status = 'approved')
  );

drop policy if exists "products_seller_update" on public.products;
create policy "products_seller_update" on public.products
  for update using (
    public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

-- Variants / images: follow product visibility
drop policy if exists "variants_read" on public.product_variants;
create policy "variants_read" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (
          p.status = 'active'
          or public.is_admin()
          or p.seller_id in (select id from public.sellers where owner_id = auth.uid())
        )
    )
  );

drop policy if exists "images_read" on public.product_images;
create policy "images_read" on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.status = 'active' or public.is_admin())
    )
  );

-- Sellers: public read approved
drop policy if exists "sellers_public_read" on public.sellers;
create policy "sellers_public_read" on public.sellers
  for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "sellers_owner_update" on public.sellers;
create policy "sellers_owner_update" on public.sellers
  for update using (owner_id = auth.uid() or public.is_admin());

-- Addresses: own only
drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Carts
drop policy if exists "carts_own" on public.carts;
create policy "carts_own" on public.carts
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "cart_items_own" on public.cart_items;
create policy "cart_items_own" on public.cart_items
  for all using (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.carts c where c.id = cart_id and (c.user_id = auth.uid() or public.is_admin()))
  );

-- Orders: buyer sees own; seller sees items for their shop (via order_items); admin all
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

-- Wishlists
drop policy if exists "wishlists_own" on public.wishlists;
create policy "wishlists_own" on public.wishlists
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Reviews: public read; auth insert own
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (user_id = auth.uid());

-- Tickets
drop policy if exists "tickets_own" on public.tickets;
create policy "tickets_own" on public.tickets
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

drop policy if exists "tickets_insert_own" on public.tickets;
create policy "tickets_insert_own" on public.tickets
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "ticket_messages_read" on public.ticket_messages;
create policy "ticket_messages_read" on public.ticket_messages
  for select using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (
          t.user_id = auth.uid()
          or public.is_admin()
          or t.seller_id in (select id from public.sellers where owner_id = auth.uid())
        )
    )
  );

-- Blog: public read published
drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Coupons: authenticated read active (validation server-side recommended)
drop policy if exists "coupons_read_active" on public.coupons;
create policy "coupons_read_active" on public.coupons
  for select using (active = true or public.is_admin());

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());
