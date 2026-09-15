-- Auth harden: login_otps formal + profiles.phone unique + cleanup
create table if not exists public.login_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  role text null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='login_otps' and column_name='code_hash') then
    alter table public.login_otps add column code_hash text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='login_otps' and column_name='role') then
    alter table public.login_otps add column role text null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='login_otps' and column_name='expires_at') then
    alter table public.login_otps add column expires_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='login_otps' and column_name='consumed_at') then
    alter table public.login_otps add column consumed_at timestamptz null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='login_otps' and column_name='created_at') then
    alter table public.login_otps add column created_at timestamptz not null default now();
  end if;
end $$;

create index if not exists login_otps_phone_active_idx on public.login_otps (phone) where consumed_at is null;
create index if not exists login_otps_expires_idx on public.login_otps (expires_at);
alter table public.login_otps enable row level security;
revoke all on public.login_otps from anon, authenticated;
grant all on public.login_otps to service_role;

create or replace function public.cleanup_expired_login_otps()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  delete from public.login_otps
  where (expires_at < now() - interval '1 day')
     or (consumed_at is not null and consumed_at < now() - interval '1 day');
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.cleanup_expired_login_otps() from public;
grant execute on function public.cleanup_expired_login_otps() to service_role;

update public.profiles set phone = null
where phone is not null and length(regexp_replace(phone, '\D', '', 'g')) < 10;

with ranked as (
  select id, phone,
    row_number() over (
      partition by regexp_replace(coalesce(phone, ''), '\D', '', 'g')
      order by updated_at desc nulls last, created_at desc nulls last
    ) as rn
  from public.profiles
  where phone is not null and phone <> ''
)
update public.profiles p set phone = null, updated_at = now()
from ranked r where p.id = r.id and r.rn > 1;

create unique index if not exists profiles_phone_unique_idx
  on public.profiles (phone) where phone is not null and phone <> '';

create table if not exists public.rate_limit_buckets (
  key text primary key,
  count int not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.rate_limit_buckets enable row level security;
revoke all on public.rate_limit_buckets from anon, authenticated;
grant all on public.rate_limit_buckets to service_role;
