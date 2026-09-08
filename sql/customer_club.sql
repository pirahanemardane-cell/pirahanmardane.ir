create table if not exists public.customer_club (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  phone_normalized text not null,
  source text default 'home_newsletter',
  user_agent text,
  created_at timestamptz not null default now(),
  unique (phone_normalized)
);
create index if not exists customer_club_created_at_idx on public.customer_club (created_at desc);
alter table public.customer_club enable row level security;
