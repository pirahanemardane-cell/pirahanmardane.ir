-- =============================================================================
-- Harden RLS: order_items insert, orders status update (restricted),
-- tickets update, ticket_messages insert
-- فروشگاه پیراهن مردانه — امنیت بدون باز کردن سطح دسترسی اضافه
-- =============================================================================

-- ---------- order_items: buyer can insert only for their own new orders ----------
drop policy if exists "order_items_insert_own_order" on public.order_items;
create policy "order_items_insert_own_order" on public.order_items
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'pending_payment'
    )
  );

-- Sellers/admins may update line items later (e.g. fulfillment notes) — optional tight policy
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

-- ---------- orders: buyer may cancel only while pending_payment ----------
drop policy if exists "orders_update_own_limited" on public.orders;
create policy "orders_update_own_limited" on public.orders
  for update using (
    public.is_admin()
    or (
      user_id = auth.uid()
      and status = 'pending_payment'
    )
  )
  with check (
    public.is_admin()
    or (
      user_id = auth.uid()
      -- buyer can only keep pending_payment or move to cancelled
      and status in ('pending_payment', 'cancelled')
    )
  );

-- Note: marking paid must use service_role (admin client) in /api/payments/verify
-- Buyers cannot set status = 'paid' via this policy (with check blocks it).

-- ---------- tickets: owner or admin can update status ----------
drop policy if exists "tickets_update_own_or_admin" on public.tickets;
create policy "tickets_update_own_or_admin" on public.tickets
  for update using (
    user_id = auth.uid() or public.is_admin()
  )
  with check (
    user_id = auth.uid() or public.is_admin()
  );

-- ---------- ticket_messages: participants can insert ----------
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

-- ---------- payments safety helper: prevent client from setting paid ----------
-- (Documented) Use SUPABASE_SERVICE_ROLE_KEY only in verify route.
