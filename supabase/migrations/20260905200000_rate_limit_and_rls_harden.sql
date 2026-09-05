-- rate limit buckets (service_role only)
create table if not exists public.rate_limit_buckets (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.rate_limit_buckets enable row level security;

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='login_otps') then
    alter table public.login_otps enable row level security;
  end if;
end $$;

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    alter table public.profiles enable row level security;
    drop policy if exists "profiles_select_own" on public.profiles;
    create policy "profiles_select_own" on public.profiles
      for select using (id = auth.uid() or public.is_admin());
    drop policy if exists "profiles_update_own" on public.profiles;
    create policy "profiles_update_own" on public.profiles
      for update using (id = auth.uid() or public.is_admin())
      with check (id = auth.uid() or public.is_admin());
  end if;
end $$;
