-- یک‌بار در Supabase → SQL Editor
-- رفع: permission denied for function is_admin

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

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- اگر جدول categories وجود دارد و public read لازم است:
do $$
begin
  if to_regclass('public.categories') is not null then
    execute $p$
      drop policy if exists "categories_public_read" on public.categories;
      create policy "categories_public_read" on public.categories
        for select using (true);
    $p$;
  end if;
exception when others then
  raise notice 'categories policy skip: %', SQLERRM;
end $$;
