-- =============================================================================
-- پیراهن مردانه | https://pirahanemardane.ir
-- ALL-IN-ONE | کل اسکیما + RLS + Grants تا Stage 27 (امنیت/RLS harden + سبد/سفارش/آدرس/فروشنده)
-- تاریخ به‌روز: 2026-08-22 (checkout server)
-- کپی کامل این فایل → Supabase SQL Editor → Run
-- قابل اجرای چندباره (idempotent)
-- شامل: profiles, sellers, catalog, products, cart, orders, payments,
--        wishlist, tickets, reviews + RLS harden + grants
-- =============================================================================

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

-- ---------- Profiles ----------
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

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='role') then
      alter table public.profiles add column role public.user_role not null default 'buyer';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='full_name') then
      alter table public.profiles add column full_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='phone') then
      alter table public.profiles add column phone text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='email') then
      alter table public.profiles add column email text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='avatar_url') then
      alter table public.profiles add column avatar_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='created_at') then
      alter table public.profiles add column created_at timestamptz not null default now();
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='updated_at') then
      alter table public.profiles add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

create index if not exists profiles_phone_idx on public.profiles (phone);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------- Sellers ----------
create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete restrict,
  shop_name text,
  slug text,
  status text default 'pending',
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

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='sellers') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='owner_id') then
      alter table public.sellers add column owner_id uuid references public.profiles (id) on delete restrict;
      if exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='user_id') then
        execute 'update public.sellers set owner_id = user_id where owner_id is null';
      elsif exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='profile_id') then
        execute 'update public.sellers set owner_id = profile_id where owner_id is null';
      end if;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='shop_name') then
      alter table public.sellers add column shop_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='slug') then
      alter table public.sellers add column slug text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='status') then
      alter table public.sellers add column status text default 'pending';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='about') then
      alter table public.sellers add column about text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='city') then
      alter table public.sellers add column city text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='address') then
      alter table public.sellers add column address text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='phone') then
      alter table public.sellers add column phone text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='sheba') then
      alter table public.sellers add column sheba text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='logo_url') then
      alter table public.sellers add column logo_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='banner_url') then
      alter table public.sellers add column banner_url text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='rating') then
      alter table public.sellers add column rating numeric(3,2) not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='rating_count') then
      alter table public.sellers add column rating_count int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='created_at') then
      alter table public.sellers add column created_at timestamptz not null default now();
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='sellers' and column_name='updated_at') then
      alter table public.sellers add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

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

-- align categories/brands: ممکن است is_active به‌جای active باشد
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='categories') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categories' and column_name='active')
       and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='categories' and column_name='is_active') then
      alter table public.categories add column active boolean not null default true;
    end if;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='brands') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='brands' and column_name='active')
       and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='brands' and column_name='is_active') then
      alter table public.brands add column active boolean not null default true;
    end if;
  end if;
end $$;

-- ---------- Products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.sellers (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  name text not null default '',
  title text,
  slug text,
  description text,
  status text default 'draft',
  base_price int not null default 0,
  compare_at_price int,
  discount_percent int not null default 0,
  cover_image text,
  currency text not null default 'IRT',
  is_amazing boolean not null default false,
  deal_ends_at timestamptz,
  rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  seo_title text,
  seo_description text,
  product_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='products') then
    -- seller_id (critical for policies)
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seller_id') then
      alter table public.products add column seller_id uuid;
      begin
        alter table public.products
          add constraint products_seller_id_fkey
          foreign key (seller_id) references public.sellers (id) on delete set null;
      exception when duplicate_object then null;
      end;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='category_id') then
      alter table public.products add column category_id uuid references public.categories (id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='brand_id') then
      alter table public.products add column brand_id uuid references public.brands (id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='name') then
      alter table public.products add column name text not null default '';
    end if;
    -- اگر title هست و name خالی است، از title پر کن (بدون EXECUTE)
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='title')
       and exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='name') then
      update public.products
      set name = title
      where (name is null or btrim(name) = '')
        and title is not null
        and btrim(title) <> '';
    end if;

    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='title') then
      alter table public.products add column title text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='slug') then
      alter table public.products add column slug text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='description') then
      alter table public.products add column description text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='status') then
      alter table public.products add column status text default 'draft';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='base_price') then
      alter table public.products add column base_price int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='compare_at_price') then
      alter table public.products add column compare_at_price int;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='discount_percent') then
      alter table public.products add column discount_percent int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='cover_image') then
      alter table public.products add column cover_image text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='currency') then
      alter table public.products add column currency text not null default 'IRT';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='is_amazing') then
      alter table public.products add column is_amazing boolean not null default false;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='deal_ends_at') then
      alter table public.products add column deal_ends_at timestamptz;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='rating') then
      alter table public.products add column rating numeric(3,2) not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='reviews_count') then
      alter table public.products add column reviews_count int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_title') then
      alter table public.products add column seo_title text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_description') then
      alter table public.products add column seo_description text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='product_code') then
      alter table public.products add column product_code text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='created_at') then
      alter table public.products add column created_at timestamptz not null default now();
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='updated_at') then
      alter table public.products add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category_id);

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
  created_at timestamptz not null default now()
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
  full_name text,
  receiver_name text,
  phone text,
  province text,
  city text,
  address_line text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='addresses') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='full_name') then
      alter table public.addresses add column full_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='receiver_name') then
      alter table public.addresses add column receiver_name text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='address_line') then
      alter table public.addresses add column address_line text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='postal_code') then
      alter table public.addresses add column postal_code text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='phone') then
      alter table public.addresses add column phone text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='province') then
      alter table public.addresses add column province text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='city') then
      alter table public.addresses add column city text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='is_default') then
      alter table public.addresses add column is_default boolean not null default false;
    end if;
  end if;
end $$;

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------- Cart ----------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  qty int not null default 1 check (qty > 0),
  unit_price int not null default 0,
  created_at timestamptz not null default now()
);

-- هم‌ترازی cart_items قدیمی (user_id مستقیم) با مدل carts + cart_id
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='cart_items') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='cart_id') then
      alter table public.cart_items add column cart_id uuid;
      begin
        alter table public.cart_items
          add constraint cart_items_cart_id_fkey
          foreign key (cart_id) references public.carts (id) on delete cascade;
      exception when duplicate_object then null;
      end;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='user_id') then
      alter table public.cart_items add column user_id uuid references public.profiles (id) on delete cascade;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='product_id') then
      alter table public.cart_items add column product_id uuid references public.products (id) on delete cascade;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='variant_id') then
      alter table public.cart_items add column variant_id uuid;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='qty') then
      alter table public.cart_items add column qty int not null default 1;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='unit_price') then
      alter table public.cart_items add column unit_price int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='created_at') then
      alter table public.cart_items add column created_at timestamptz not null default now();
    end if;

    -- اگر ردیف‌هایی فقط user_id دارند، برایشان cart بساز و cart_id را پر کن
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='cart_items' and column_name='user_id') then
      insert into public.carts (user_id)
      select distinct ci.user_id
      from public.cart_items ci
      where ci.user_id is not null
        and not exists (select 1 from public.carts c where c.user_id = ci.user_id)
      on conflict (user_id) do nothing;

      update public.cart_items ci
      set cart_id = c.id
      from public.carts c
      where ci.cart_id is null
        and ci.user_id is not null
        and c.user_id = ci.user_id;
    end if;
  end if;
end $$;

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'pending_payment',
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

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='orders') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='order_number') then
      alter table public.orders add column order_number text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='status') then
      alter table public.orders add column status text not null default 'pending_payment';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='subtotal') then
      alter table public.orders add column subtotal int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='shipping_cost') then
      alter table public.orders add column shipping_cost int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='payable') then
      alter table public.orders add column payable int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='user_id') then
      alter table public.orders add column user_id uuid references public.profiles (id) on delete restrict;
    end if;
  end if;
end $$;

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  seller_id uuid references public.sellers (id) on delete set null,
  name text not null default '',
  title text not null default '',
  color_name text,
  size text,
  image_url text,
  qty int not null default 1 check (qty > 0),
  unit_price int not null default 0,
  line_total int not null default 0
);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='order_items') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='seller_id') then
      alter table public.order_items add column seller_id uuid;
      begin
        alter table public.order_items
          add constraint order_items_seller_id_fkey
          foreign key (seller_id) references public.sellers (id) on delete set null;
      exception when duplicate_object then null;
      end;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='product_id') then
      alter table public.order_items add column product_id uuid references public.products (id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='name') then
      alter table public.order_items add column name text not null default '';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='title') then
      alter table public.order_items add column title text not null default '';
    end if;
    begin
      update public.order_items
      set title = coalesce(nullif(title, ''), nullif(name, ''), 'product')
      where title is null or title = '';
    exception when others then null;
    end;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='qty') then
      alter table public.order_items add column qty int not null default 1;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='unit_price') then
      alter table public.order_items add column unit_price int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='order_items' and column_name='line_total') then
      alter table public.order_items add column line_total int not null default 0;
    end if;
  end if;
end $$;

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
  created_at timestamptz not null default now()
);

-- ---------- Tickets ----------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  type text not null default 'buyer',
  status text not null default 'open',
  subject text not null,
  user_id uuid references public.profiles (id) on delete set null,
  seller_id uuid references public.sellers (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='tickets') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='seller_id') then
      alter table public.tickets add column seller_id uuid;
      begin
        alter table public.tickets
          add constraint tickets_seller_id_fkey
          foreign key (seller_id) references public.sellers (id) on delete set null;
      exception when duplicate_object then null;
      end;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='user_id') then
      alter table public.tickets add column user_id uuid references public.profiles (id) on delete set null;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='subject') then
      alter table public.tickets add column subject text not null default '';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='status') then
      alter table public.tickets add column status text not null default 'open';
    end if;
  end if;
end $$;

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

do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='coupons') then
    -- always ensure column "active" (older DBs may only have is_active)
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='active') then
      alter table public.coupons add column active boolean not null default true;
      if exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='is_active') then
        execute 'update public.coupons set active = coalesce(is_active, true)';
      end if;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='code') then
      alter table public.coupons add column code text;
    end if;
  end if;
end $$;

-- ---------- Triggers ----------
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

-- Categories / brands
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (
    public.is_admin()
    or coalesce(
      (to_jsonb(categories)->>'active')::boolean,
      (to_jsonb(categories)->>'is_active')::boolean,
      true
    )
  );

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands_public_read" on public.brands;
create policy "brands_public_read" on public.brands
  for select using (
    public.is_admin()
    or coalesce(
      (to_jsonb(brands)->>'active')::boolean,
      (to_jsonb(brands)->>'is_active')::boolean,
      true
    )
  );

drop policy if exists "brands_admin_write" on public.brands;
create policy "brands_admin_write" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

-- Products (status compared as text for compatibility)
drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
  for select using (
    status::text = 'active'
    or public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

drop policy if exists "products_seller_insert" on public.products;
create policy "products_seller_insert" on public.products
  for insert with check (
    public.is_admin()
    or seller_id in (
      select id from public.sellers
      where owner_id = auth.uid() and status::text = 'approved'
    )
  );

drop policy if exists "products_seller_update" on public.products;
create policy "products_seller_update" on public.products
  for update using (
    public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

drop policy if exists "variants_read" on public.product_variants;
create policy "variants_read" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (
          p.status::text = 'active'
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
      where p.id = product_id
        and (p.status::text = 'active' or public.is_admin())
    )
  );

-- Sellers
drop policy if exists "sellers_public_read" on public.sellers;
create policy "sellers_public_read" on public.sellers
  for select using (
    status::text = 'approved' or owner_id = auth.uid() or public.is_admin()
  );

drop policy if exists "sellers_owner_update" on public.sellers;
create policy "sellers_owner_update" on public.sellers
  for update using (owner_id = auth.uid() or public.is_admin());

-- Addresses
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
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or user_id = auth.uid()
    or exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

-- Orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_update_own_limited" on public.orders;
create policy "orders_update_own_limited" on public.orders
  for update using (
    public.is_admin()
    or (user_id = auth.uid() and status::text = 'pending_payment')
  )
  with check (
    public.is_admin()
    or (user_id = auth.uid() and status::text in ('pending_payment', 'cancelled'))
  );

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

drop policy if exists "order_items_insert_own_order" on public.order_items;
create policy "order_items_insert_own_order" on public.order_items
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status::text = 'pending_payment'
    )
  );

drop policy if exists "order_items_update_admin_seller" on public.order_items;
create policy "order_items_update_admin_seller" on public.order_items
  for update using (
    public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  )
  with check (
    public.is_admin()
    or seller_id in (select id from public.sellers where owner_id = auth.uid())
  );

-- Wishlists
drop policy if exists "wishlists_own" on public.wishlists;
create policy "wishlists_own" on public.wishlists
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Reviews
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

drop policy if exists "tickets_update_own_or_admin" on public.tickets;
create policy "tickets_update_own_or_admin" on public.tickets
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

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

drop policy if exists "ticket_messages_insert_participant" on public.ticket_messages;
create policy "ticket_messages_insert_participant" on public.ticket_messages
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (
          t.user_id = auth.uid()
          or t.seller_id in (select id from public.sellers where owner_id = auth.uid())
        )
    )
  );

-- Blog
drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Coupons
drop policy if exists "coupons_read_active" on public.coupons;
create policy "coupons_read_active" on public.coupons
  for select using (
    public.is_admin()
    or coalesce(
      (to_jsonb(coupons)->>'active')::boolean,
      (to_jsonb(coupons)->>'is_active')::boolean,
      true
    )
  );

drop policy if exists "coupons_admin_write" on public.coupons;
create policy "coupons_admin_write" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- paid فقط با service_role در سرور (/api/payments/verify)

-- =============================================================================
-- GRANT قوی + مالکیت جداول سبد/سفارش
-- =============================================================================
grant usage on schema public to anon, authenticated, service_role;

-- مالکیت (برای جلوگیری از permission denied)
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','sellers','categories','brands','products','product_variants','product_images',
    'addresses','carts','cart_items','orders','order_items','wishlists','reviews',
    'tickets','ticket_messages','blog_posts','coupons'
  ]
  loop
    if exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      execute format('alter table public.%I owner to postgres', t);
    end if;
  end loop;
end $$;

grant select on public.categories to anon, authenticated, service_role;
grant select on public.brands to anon, authenticated, service_role;
grant select on public.products to anon, authenticated, service_role;
grant select on public.product_variants to anon, authenticated, service_role;
grant select on public.product_images to anon, authenticated, service_role;
grant select on public.blog_posts to anon, authenticated, service_role;
grant select on public.coupons to authenticated, service_role;

grant select, update on public.profiles to authenticated, service_role;
grant select, insert, update on public.sellers to authenticated, service_role;
grant select, insert, update, delete on public.products to authenticated, service_role;
grant select, insert, update, delete on public.product_variants to authenticated, service_role;
grant select, insert, update, delete on public.product_images to authenticated, service_role;

grant select, insert, update, delete on public.addresses to authenticated, service_role;
grant all on public.carts to anon, authenticated, service_role;
grant all on public.cart_items to anon, authenticated, service_role;
grant select, insert, update, delete on public.orders to authenticated, service_role;
grant select, insert, update, delete on public.order_items to authenticated, service_role;
grant select, insert, update, delete on public.wishlists to authenticated, service_role;
grant select, insert on public.reviews to authenticated, service_role;
grant select, insert, update on public.tickets to authenticated, service_role;
grant select, insert on public.ticket_messages to authenticated, service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all sequences in schema public to authenticated;
grant all on all sequences in schema public to anon;
grant execute on function public.is_admin() to authenticated, service_role, anon;

-- سوپر-GRANT صریح روی سبد (رفع permission denied حتی برای service_role)
grant select, insert, update, delete, references, trigger on table public.carts to service_role, authenticated, anon, postgres;
grant select, insert, update, delete, references, trigger on table public.cart_items to service_role, authenticated, anon, postgres;
grant select, insert, update, delete on table public.orders to service_role, authenticated, postgres;
grant select, insert, update, delete on table public.order_items to service_role, authenticated, postgres;
grant select on table public.products to service_role, authenticated, anon, postgres;
grant select on table public.product_variants to service_role, authenticated, anon, postgres;



-- ---------- Align orders for legacy API (discount_amount, total, pending, payment_ref) ----------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='orders') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='discount_amount') then
      alter table public.orders add column discount_amount int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='total') then
      alter table public.orders add column total int not null default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='payment_ref') then
      alter table public.orders add column payment_ref text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='payment_authority') then
      alter table public.orders add column payment_authority text;
    end if;
  end if;
end $$;

-- products.images (jsonb/text[]) برای کاتالوگ UI
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='products') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='images') then
      alter table public.products add column images jsonb default '[]'::jsonb;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='tags') then
      alter table public.products add column tags text[] default '{}';
    end if;
  end if;
end $$;

-- ---------- Payments (mock + zarinpal skeleton) ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  amount int not null default 0,
  authority text,
  ref_id text,
  status text not null default 'initiated',
  mode text not null default 'mock',
  gateway text default 'zarinpal',
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_idx on public.payments (order_id);
create index if not exists payments_authority_idx on public.payments (authority);

alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- insert/update فقط service_role از API
drop policy if exists "payments_insert_service" on public.payments;
-- no client insert policy on purpose

grant select on public.payments to authenticated, service_role;
grant select, insert, update, delete on public.payments to service_role;



-- ستون‌های اختیاری orders اگر در جدول قدیمی نبودند
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='orders') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='tracking_code') then
      alter table public.orders add column tracking_code text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='paid_at') then
      alter table public.orders add column paid_at timestamptz;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='payment_ref') then
      alter table public.orders add column payment_ref text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='payment_authority') then
      alter table public.orders add column payment_authority text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='discount_amount') then
      alter table public.orders add column discount_amount numeric(12,0) default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='total') then
      alter table public.orders add column total numeric(12,0) default 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='address_snapshot') then
      alter table public.orders add column address_snapshot jsonb;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='contact_snapshot') then
      alter table public.orders add column contact_snapshot jsonb;
    end if;
  end if;
end $$;

-- فعال‌سازی محصول تست (اگر وجود داشته باشد)
update public.products
set status = 'active'
where id = '80e52733-5866-4827-a9b5-ecb5921f3c8f';


-- ---------- Stage 17: bootstrap test seller for admin test user ----------
do $$
declare
  v_uid uuid := '3e07e775-07ff-4a83-821d-3248120deca5';
  v_seller uuid;
begin
  if exists (select 1 from public.profiles where id = v_uid) then
    select id into v_seller from public.sellers where owner_id = v_uid limit 1;
    if v_seller is null then
      insert into public.sellers (owner_id, shop_name, slug, status)
      values (v_uid, 'فروشگاه تست', 'test-shop', 'approved')
      returning id into v_seller;
    else
      update public.sellers set status = 'approved' where id = v_seller and (status is null or status <> 'approved');
    end if;

    -- link test product to this seller
    update public.products
    set seller_id = v_seller
    where id = '80e52733-5866-4827-a9b5-ecb5921f3c8f'
      and (seller_id is null or seller_id <> v_seller);
  end if;
exception when others then
  raise notice 'seller bootstrap skipped: %', SQLERRM;
end $$;



-- backfill order_items.seller_id from products
update public.order_items oi
set seller_id = p.seller_id
from public.products p
where oi.product_id = p.id
  and p.seller_id is not null
  and (oi.seller_id is null or oi.seller_id is distinct from p.seller_id);


-- =============================================================================
-- Stage 22 — RLS / Security harden
-- =============================================================================

-- تابع کمکی فروشنده
create or replace function public.is_seller_owner(p_seller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sellers s
    where s.id = p_seller_id
      and (s.owner_id = auth.uid() or s.user_id = auth.uid())
  );
$$;

-- پروفایل: کاربر عادی نتواند role را عوض کند
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      id = auth.uid()
      and role is not distinct from (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- جلوگیری از insert پروفایل جعلی توسط authenticated (فقط trigger / service)
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert
  with check (id = auth.uid() or public.is_admin());

-- payments: فقط خواندن سفارش خود؛ نوشتن فقط service_role
alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "payments_insert_service" on public.payments;
drop policy if exists "payments_no_client_write" on public.payments;
-- هیچ policy برای insert/update/delete روی authenticated → فقط service_role با bypass

revoke insert, update, delete on public.payments from authenticated;
revoke insert, update, delete on public.payments from anon;
grant select on public.payments to authenticated;
grant select, insert, update, delete on public.payments to service_role;

-- orders: کاربر نتواند status را به paid تغییر دهد (فقط pending_payment → cancelled)
drop policy if exists "orders_update_own_limited" on public.orders;
create policy "orders_update_own_limited" on public.orders
  for update
  using (
    public.is_admin()
    or (user_id = auth.uid() and status::text in ('pending', 'pending_payment'))
  )
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      and status::text in ('pending', 'pending_payment', 'cancelled')
    )
  );

-- order_items: خریدار بعد از ثبت نتواند دست بزند (فقط select)
drop policy if exists "order_items_delete_none" on public.order_items;
-- authenticated delete ممنوع مگر ادمین
drop policy if exists "order_items_delete_admin" on public.order_items;
create policy "order_items_delete_admin" on public.order_items
  for delete using (public.is_admin());

-- carts: anon هیچ دسترسی‌ای
revoke all on public.carts from anon;
revoke all on public.cart_items from anon;
grant select, insert, update, delete on public.carts to authenticated, service_role;
grant select, insert, update, delete on public.cart_items to authenticated, service_role;

-- addresses: فقط مالک
drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- wishlists: فقط مالک
drop policy if exists "wishlists_own" on public.wishlists;
create policy "wishlists_own" on public.wishlists
  for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- sellers: عمومی فقط approved
drop policy if exists "sellers_public_read" on public.sellers;
create policy "sellers_public_read" on public.sellers
  for select using (
    public.is_admin()
    or status = 'approved'
    or owner_id = auth.uid()
    or user_id = auth.uid()
  );

-- products: غیر فعال فقط صاحب/ادمین
drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active" on public.products
  for select using (
    public.is_admin()
    or status = 'active'
    or seller_id in (select id from public.sellers where owner_id = auth.uid() or user_id = auth.uid())
  );

-- force RLS
do $$
declare r record;
begin
  for r in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in (
        'profiles','sellers','categories','brands','products','product_variants','product_images',
        'addresses','carts','cart_items','orders','order_items','payments','wishlists','reviews',
        'tickets','ticket_messages','blog_posts','coupons'
      )
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    begin
      execute format('alter table public.%I force row level security', r.tablename);
    exception when others then
      raise notice 'force rls skip %: %', r.tablename, SQLERRM;
    end;
  end loop;
end $$;

-- service_role کامل روی جداول حساس (API سرور)
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_items to service_role;
grant select, insert, update, delete on public.carts to service_role;
grant select, insert, update, delete on public.cart_items to service_role;
grant select, insert, update, delete on public.addresses to service_role;
grant select, insert, update, delete on public.wishlists to service_role;
grant select, insert, update, delete on public.payments to service_role;

-- =============================================================================
-- Stage 27 — Storage bucket تصاویر محصول (اختیاری ولی توصیه‌شده)
-- =============================================================================
-- در Dashboard → Storage هم می‌توانی bucket بسازی؛ این SQL برای CLI/خودکار است.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- خواندن عمومی
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- آپلود: فروشنده/ادمین لاگین‌شده
drop policy if exists "product_images_auth_upload" on storage.objects;
create policy "product_images_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_auth_update" on storage.objects;
create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_auth_delete" on storage.objects;
create policy "product_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');



-- =============================================================================
-- Stage 32 — FAQ (سوالات متداول) سروری
-- =============================================================================
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  cat text not null default 'عمومی',
  q text not null,
  a text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faqs_cat_idx on public.faqs (cat);
create index if not exists faqs_published_idx on public.faqs (is_published);

alter table public.faqs enable row level security;
alter table public.faqs force row level security;

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read"
  on public.faqs for select
  using (is_published = true);

drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all"
  on public.faqs for all
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  );

grant select on public.faqs to anon, authenticated;
grant select, insert, update, delete on public.faqs to service_role;

-- seed پیش‌فرض فقط اگر خالی باشد
insert into public.faqs (cat, q, a, sort_order, is_published)
select * from (values
  ('سفارش', 'چطور سفارش ثبت کنم؟', 'محصول را به سبد اضافه کنید، آدرس و روش ارسال را انتخاب کنید و پرداخت کنید.', 10, true),
  ('سفارش', 'آیا می‌توانم سفارش را لغو کنم؟', 'تا قبل از آماده‌سازی توسط فروشنده، از بخش سفارش‌های من می‌توانید درخواست لغو بدهید.', 20, true),
  ('پرداخت', 'چه درگاه‌هایی پشتیبانی می‌شود؟', 'پرداخت آنلاین از طریق درگاه بانکی انجام می‌شود.', 30, true),
  ('پرداخت', 'اگر پرداخت ناموفق بود چه کنم؟', 'مبلغ تا ۷۲ ساعت به حساب برمی‌گردد. در صورت مشکل با پشتیبانی تماس بگیرید.', 40, true),
  ('ارسال', 'هزینه ارسال چقدر است؟', 'هزینه ارسال قبل از پرداخت در مرحله تسویه نمایش داده می‌شود.', 50, true),
  ('ارسال', 'چقدر طول می‌کشد سفارش برسد؟', 'معمولاً ۲ تا ۵ روز کاری بسته به شهر و روش ارسال.', 60, true),
  ('مرجوعی', 'شرایط مرجوعی چیست؟', 'تا ۷ روز پس از تحویل، با هماهنگی پشتیبانی امکان مرجوعی وجود دارد.', 70, true),
  ('حساب کاربری', 'چطور از حساب خارج شوم؟', 'از پروفایل → اطلاعات حساب، گزینه خروج را انتخاب کنید.', 80, true),
  ('فروشندگی', 'چطور فروشنده شوم؟', 'از صفحه «فروشنده شوید» ثبت‌نام کنید و پس از تأیید ادمین کالا اضافه کنید.', 90, true)
) as v(cat, q, a, sort_order, is_published)
where not exists (select 1 from public.faqs limit 1);


-- =============================================================================
-- Stage 33 — Compare + Recently Viewed (سروری، فقط کاربر لاگین)
-- =============================================================================
create table if not exists public.user_compare_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists user_compare_user_idx on public.user_compare_items (user_id);

create table if not exists public.user_recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists user_recent_user_idx on public.user_recently_viewed (user_id, viewed_at desc);

alter table public.user_compare_items enable row level security;
alter table public.user_recently_viewed enable row level security;
alter table public.user_compare_items force row level security;
alter table public.user_recently_viewed force row level security;

drop policy if exists "user_compare_own" on public.user_compare_items;
create policy "user_compare_own"
  on public.user_compare_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "user_recent_own" on public.user_recently_viewed;
create policy "user_recent_own"
  on public.user_recently_viewed for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_compare_items to authenticated, service_role;
grant select, insert, update, delete on public.user_recently_viewed to authenticated, service_role;

select
  has_table_privilege('service_role', 'public.carts', 'SELECT') as srv_cart_select,
  has_table_privilege('service_role', 'public.orders', 'INSERT') as srv_orders_insert,
  has_table_privilege('service_role', 'public.payments', 'INSERT') as srv_payments_insert,
  (select status::text from public.products where id = '80e52733-5866-4827-a9b5-ecb5921f3c8f') as test_product_status,
  (select count(*)::int from public.faqs) as faqs_count,
  to_regclass('public.user_compare_items') is not null as has_compare_table,
  to_regclass('public.user_recently_viewed') is not null as has_recent_table,
  'OK full schema through Stage 33 compare + recently viewed' as result;

-- =============================================================================
-- Stage 35 — Operational: brands admin write (categories already had admin policy)
-- =============================================================================
drop policy if exists "brands_admin_write" on public.brands;
create policy "brands_admin_write" on public.brands
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin'));

grant select, insert, update, delete on public.categories to service_role;
grant select, insert, update, delete on public.brands to service_role;

select
  to_regclass('public.categories') is not null as has_categories,
  to_regclass('public.brands') is not null as has_brands,
  'OK full schema through Stage 35 operational categories/brands admin' as result;




-- Stage 37: no new tables (uses product-images bucket from Stage 27 + seller upload API in app)
-- Run entire file once in SQL Editor.

-- Stage 38: app-only (seller panel server sync); no new SQL tables.

-- Stage 39: UI-only (cancel + seller publish buttons); no schema change.

-- Stage 40: admin taxonomy UI→API (categories/brands already in schema Stage 35).


-- =============================================================================
-- Stage 41 — Variants SEO full server + order returns
-- =============================================================================

-- Product SEO extras
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='products') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_keywords') then
      alter table public.products add column seo_keywords text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_og_image') then
      alter table public.products add column seo_og_image text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_noindex') then
      alter table public.products add column seo_noindex boolean not null default false;
    end if;
  end if;
end $$;

-- Variant note / attrs
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='product_variants') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='product_variants' and column_name='note') then
      alter table public.product_variants add column note text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='product_variants' and column_name='attrs') then
      alter table public.product_variants add column attrs jsonb not null default '{}'::jsonb;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='product_variants' and column_name='updated_at') then
      alter table public.product_variants add column updated_at timestamptz not null default now();
    end if;
  end if;
end $$;

-- Seller write variants of own products (service_role also used by API)
drop policy if exists "variants_seller_write" on public.product_variants;
create policy "variants_seller_write" on public.product_variants
  for all to authenticated
  using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_variants.product_id
        and (s.owner_id = auth.uid() or s.user_id = auth.uid())
    )
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role::text = 'admin')
  )
  with check (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_variants.product_id
        and (s.owner_id = auth.uid() or s.user_id = auth.uid())
    )
    or exists (select 1 from public.profiles pr where pr.id = auth.uid() and pr.role::text = 'admin')
  );

-- Order returns / refunds requests
create table if not exists public.order_returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','received','refunded','cancelled')),
  admin_note text,
  seller_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists order_returns_user_idx on public.order_returns (user_id);
create index if not exists order_returns_order_idx on public.order_returns (order_id);
create index if not exists order_returns_status_idx on public.order_returns (status);

alter table public.order_returns enable row level security;

drop policy if exists "returns_select_own" on public.order_returns;
create policy "returns_select_own" on public.order_returns
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  );

drop policy if exists "returns_insert_own" on public.order_returns;
create policy "returns_insert_own" on public.order_returns
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "returns_update_admin" on public.order_returns;
create policy "returns_update_admin" on public.order_returns
  for update to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  );

grant select, insert, update on public.order_returns to authenticated;
grant all on public.order_returns to service_role;

select
  to_regclass('public.order_returns') is not null as has_order_returns,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='products' and column_name='seo_keywords') > 0 as has_seo_keywords,
  'OK full schema through Stage 41 variants SEO + returns' as result;

-- =============================================================================
-- Stage 42 — Coupons (validate + redemptions + admin)
-- =============================================================================
create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  amount int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists coupon_redemptions_user_idx on public.coupon_redemptions (user_id);
create index if not exists coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id);

alter table public.coupon_redemptions enable row level security;
alter table public.coupon_redemptions force row level security;

drop policy if exists "coupon_redemptions_select_own" on public.coupon_redemptions;
create policy "coupon_redemptions_select_own" on public.coupon_redemptions
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
  );

-- writes via service_role only from API
grant select on public.coupon_redemptions to authenticated;
grant all on public.coupon_redemptions to service_role;
grant select, insert, update, delete on public.coupons to service_role;

-- ensure coupons columns for older DBs (legacy discount_* + new type/value)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='type') then
    alter table public.coupons add column type text default 'amount';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='value') then
    alter table public.coupons add column value int default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='min_cart') then
    alter table public.coupons add column min_cart int not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='max_uses') then
    alter table public.coupons add column max_uses int;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='max_per_user') then
    alter table public.coupons add column max_per_user int;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='used_count') then
    alter table public.coupons add column used_count int not null default 0;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='starts_at') then
    alter table public.coupons add column starts_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='ends_at') then
    alter table public.coupons add column ends_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='active') then
    alter table public.coupons add column active boolean not null default true;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='is_active') then
      execute 'update public.coupons set active = coalesce(is_active, true)';
    end if;
  end if;
  -- legacy columns used by older schema (NOT NULL discount_type caused seed failure)
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='discount_type') then
    alter table public.coupons add column discount_type text default 'percent';
  else
    begin
      alter table public.coupons alter column discount_type set default 'percent';
    exception when others then null;
    end;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='coupons' and column_name='discount_value') then
    alter table public.coupons add column discount_value numeric default 0;
  else
    begin
      alter table public.coupons alter column discount_value set default 0;
    exception when others then null;
    end;
  end if;
  -- backfill nulls so NOT NULL never breaks seed
  begin
    execute 'update public.coupons set discount_type = coalesce(discount_type, type, ''percent'') where discount_type is null';
  exception when others then null;
  end;
  begin
    execute 'update public.coupons set discount_value = coalesce(discount_value, value, 0) where discount_value is null';
  exception when others then null;
  end;
  begin
    execute 'update public.coupons set type = coalesce(type, discount_type, ''amount'') where type is null';
  exception when others then null;
  end;
  begin
    execute 'update public.coupons set value = coalesce(value, discount_value::int, 0) where value is null';
  exception when others then null;
  end;
end $$;

-- seed WELCOME10 (fills both new + legacy columns)
do $$
begin
  if not exists (select 1 from public.coupons where code = 'WELCOME10') then
    insert into public.coupons (
      code, type, value, min_cart, max_uses, max_per_user, active,
      discount_type, discount_value
    ) values (
      'WELCOME10', 'percent', 10, 100000, 1000, 1, true,
      'percent', 10
    );
  end if;
exception when not_null_violation then
  -- last-resort: only columns that must exist on every variant
  if not exists (select 1 from public.coupons where code = 'WELCOME10') then
    execute $i$
      insert into public.coupons (code, type, value, min_cart, max_uses, max_per_user, active, discount_type, discount_value)
      values ('WELCOME10', 'percent', 10, 100000, 1000, 1, true, 'percent', 10)
    $i$;
  end if;
when undefined_column then
  if not exists (select 1 from public.coupons where code = 'WELCOME10') then
    insert into public.coupons (code, type, value, min_cart, max_uses, max_per_user, active)
    values ('WELCOME10', 'percent', 10, 100000, 1000, 1, true);
  end if;
end $$;

select
  to_regclass('public.coupons') is not null as has_coupons,
  to_regclass('public.coupon_redemptions') is not null as has_coupon_redemptions,
  (select count(*)::int from public.coupons) as coupons_count,
  'OK full schema through Stage 42 coupons' as result;

-- =============================================================================
-- Stage 43 — Tickets E2E (priority, last_message_at, grants)
-- =============================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='tickets') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='priority') then
      alter table public.tickets add column priority text not null default 'normal';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='last_message_at') then
      alter table public.tickets add column last_message_at timestamptz;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='closed_at') then
      alter table public.tickets add column closed_at timestamptz;
    end if;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='ticket_messages') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='ticket_messages' and column_name='is_staff') then
      alter table public.ticket_messages add column is_staff boolean not null default false;
    end if;
  end if;
end $$;

-- ensure trigger updated_at on tickets
drop trigger if exists tickets_updated_at on public.tickets;
create trigger tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

grant select, insert, update on public.tickets to authenticated, service_role;
grant select, insert on public.ticket_messages to authenticated, service_role;
grant all on public.tickets to service_role;
grant all on public.ticket_messages to service_role;

select
  to_regclass('public.tickets') is not null as has_tickets,
  to_regclass('public.ticket_messages') is not null as has_ticket_messages,
  (select count(*) from information_schema.columns where table_schema='public' and table_name='tickets' and column_name='priority') > 0 as has_priority,
  'OK full schema through Stage 43 tickets E2E' as result;

-- =============================================================================
-- Stage 44 — Product tags (taxonomy + product_tags)
-- =============================================================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

create index if not exists product_tags_tag_idx on public.product_tags (tag_id);

alter table public.tags enable row level security;
alter table public.product_tags enable row level security;

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags
  for select to anon, authenticated
  using (is_active = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin'
  ));

drop policy if exists "tags_admin_write" on public.tags;
create policy "tags_admin_write" on public.tags
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin'));

drop policy if exists "product_tags_public_read" on public.product_tags;
create policy "product_tags_public_read" on public.product_tags
  for select to anon, authenticated
  using (true);

drop policy if exists "product_tags_admin_write" on public.product_tags;
create policy "product_tags_admin_write" on public.product_tags
  for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
    or exists (
      select 1 from public.products pr
      join public.sellers s on s.id = pr.seller_id
      where pr.id = product_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role::text = 'admin')
    or exists (
      select 1 from public.products pr
      join public.sellers s on s.id = pr.seller_id
      where pr.id = product_id and s.user_id = auth.uid()
    )
  );

-- ensure products.tags array
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='tags') then
    alter table public.products add column tags text[] default '{}';
  end if;
end $$;

grant select on public.tags to anon, authenticated, service_role;
grant select on public.product_tags to anon, authenticated, service_role;
grant all on public.tags to service_role;
grant all on public.product_tags to service_role;
grant insert, update, delete on public.tags to authenticated;
grant insert, update, delete on public.product_tags to authenticated;

-- seed sample tags
insert into public.tags (name, slug, sort_order)
select v.name, v.slug, v.sort_order
from (values
  ('جدید', 'new', 1),
  ('پرفروش', 'bestseller', 2),
  ('تخفیف‌دار', 'sale', 3),
  ('رسمی', 'formal', 4),
  ('روزمره', 'casual', 5)
) as v(name, slug, sort_order)
where not exists (select 1 from public.tags t where t.slug = v.slug);

select
  to_regclass('public.tags') is not null as has_tags,
  to_regclass('public.product_tags') is not null as has_product_tags,
  (select count(*)::int from public.tags) as tags_count,
  'OK full schema through Stage 44 product tags' as result;

-- =============================================================================
-- Stage 45 — Blog E2E (extra columns + trigger)
-- =============================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='blog_posts') then
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='blog_posts' and column_name='cover_image') then
      alter table public.blog_posts add column cover_image text;
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='blog_posts' and column_name='views') then
      alter table public.blog_posts add column views int not null default 0;
    end if;
  end if;
end $$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

grant select on public.blog_posts to anon, authenticated, service_role;
grant all on public.blog_posts to service_role;

-- seed one published post if empty
insert into public.blog_posts (title, slug, excerpt, body, status, published_at)
select
  'راهنمای انتخاب پیراهن مردانه',
  'rahnama-pirahan',
  'چطور پیراهن مناسب فرم بدن و موقعیت انتخاب کنیم؟',
  E'انتخاب پیراهن مناسب به فرم بدن، فصل و موقعیت بستگی دارد.\n\nبرای محیط رسمی، پارچه‌های مات و رنگ‌های خنثی پیشنهاد می‌شود.',
  'published',
  now()
where not exists (select 1 from public.blog_posts limit 1);

select
  to_regclass('public.blog_posts') is not null as has_blog_posts,
  (select count(*)::int from public.blog_posts) as blog_count,
  'OK full schema through Stage 45 blog E2E' as result;

-- =============================================================================
-- Stage 46 — Operational close (no new tables; ensure grants)
-- =============================================================================
grant select, insert on public.coupon_redemptions to service_role;
grant select on public.product_tags to anon, authenticated, service_role;
grant select on public.tags to anon, authenticated, service_role;

select
  to_regclass('public.coupon_redemptions') is not null as has_coupon_redemptions,
  to_regclass('public.product_tags') is not null as has_product_tags,
  'OK full schema through Stage 46 operational close' as result;
