-- Seller profile/cover media approval (run once in Supabase SQL)
alter table public.sellers add column if not exists logo_pending_url text;
alter table public.sellers add column if not exists banner_pending_url text;
alter table public.sellers add column if not exists logo_status text default 'approved';
alter table public.sellers add column if not exists banner_status text default 'approved';

-- existing published images stay approved
update public.sellers set logo_status = 'approved' where logo_status is null;
update public.sellers set banner_status = 'approved' where banner_status is null;
