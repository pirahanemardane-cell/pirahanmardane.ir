-- Grants for platform tables (Supabase roles)

grant usage on schema public to anon, authenticated, service_role;

grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;

grant select on public.shipping_methods to anon, authenticated;
grant all on public.shipping_methods to service_role;

grant select, update, delete on public.user_notifications to authenticated;
grant all on public.user_notifications to service_role;

grant select on public.blog_categories to anon, authenticated;
grant all on public.blog_categories to service_role;

grant select on public.seller_payout_requests to authenticated;
grant insert on public.seller_payout_requests to authenticated;
grant all on public.seller_payout_requests to service_role;

grant all on public.admin_audit_logs to service_role;

grant select on public.coupons to anon, authenticated;
grant all on public.coupons to service_role;

-- Ensure RLS policies allow public read where intended
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "shipping_public_read" on public.shipping_methods;
create policy "shipping_public_read" on public.shipping_methods
  for select to anon, authenticated using (true);

drop policy if exists "shipping_public_read_enabled" on public.shipping_methods;
create policy "shipping_public_read_enabled" on public.shipping_methods
  for select to anon, authenticated using (enabled = true or true);
