export async function apiTickets() {
  const res = await fetch('/api/tickets', { credentials: 'include', cache: 'no-store' })
  return res.json().catch(() => ({}))
}
export async function apiCreateTicket(body) {
  const res = await fetch('/api/tickets', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json().catch(() => ({}))
}
export async function apiTicketMessages(id) {
  const res = await fetch(`/api/tickets/${id}/messages`, { credentials: 'include', cache: 'no-store' })
  return res.json().catch(() => ({}))
}
export async function apiTicketReply(id, body) {
  const res = await fetch(`/api/tickets/${id}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json().catch(() => ({}))
}

/** ویرایش متن پیام — فقط نویسنده، تا ۱۵ دقیقه */
export async function updateTicketMessage(messageId, userId, body, opts = {}) {
  const text = String(body || '').trim()
  if (!messageId || !userId) return { error: 'پارامتر ناقص' }
  if (!text) return { error: 'متن پیام خالی است' }
  const admin = opts.admin || createAdminClient()
  const { data: msg, error } = await admin
    .from('ticket_messages')
    .select('id, ticket_id, sender_id, created_at, body')
    .eq('id', messageId)
    .maybeSingle()
  if (error) return { error: error.message }
  if (!msg) return { error: 'پیام یافت نشد' }
  if (String(msg.sender_id) !== String(userId) && !opts.asAdmin) {
    return { error: 'فقط نویسنده می‌تواند ویرایش کند' }
  }
  if (!opts.asAdmin) {
    const age = Date.now() - new Date(msg.created_at).getTime()
    if (age > 15 * 60 * 1000) return { error: 'مهلت ویرایش (۱۵ دقیقه) گذشته است' }
  }
  const { data, error: uErr } = await admin
    .from('ticket_messages')
    .update({ body: text, edited_at: new Date().toISOString() })
    .eq('id', messageId)
    .select('*')
    .single()
  if (uErr) return { error: uErr.message }
  return { data }
}

/** بستن یا بازگشایی تیکت */
export async function setTicketStatus(ticketId, status, opts = {}) {
  const st = String(status || '').toLowerCase()
  if (!['open', 'closed', 'answered', 'pending'].includes(st)) {
    return { error: 'وضعیت نامعتبر' }
  }
  const admin = opts.admin || createAdminClient()
  const patch = { status: st, updated_at: new Date().toISOString() }
  if (st === 'closed') patch.closed_at = new Date().toISOString()
  else patch.closed_at = null
  const { data, error } = await admin
    .from('tickets')
    .update(patch)
    .eq('id', ticketId)
    .select('*')
    .single()
  if (error) return { error: error.message }
  return { data }
}


/* PM_TICKETS_API_V1 — panel tickets (buyer / seller / admin) */
import { createClient } from '@supabase/supabase-js';

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('supabase env missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function listTicketsForUser(userId) {
  if (!userId) return [];
  const { data, error } = await sb()
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listTicketsForSeller(sellerId) {
  if (!sellerId) return [];
  const { data, error } = await sb()
    .from('tickets')
    .select('*')
    .eq('seller_id', sellerId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function listAllTickets(limit = 200) {
  const { data, error } = await sb()
    .from('tickets')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getTicket(ticketId) {
  if (!ticketId) return null;
  const { data, error } = await sb()
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createTicket({ userId, sellerId, subject, body, status = 'open' }) {
  const row = {
    user_id: userId,
    seller_id: sellerId || null,
    subject: subject || 'بدون موضوع',
    status: status || 'open',
  };
  const { data, error } = await sb().from('tickets').insert(row).select('*').single();
  if (error) throw error;
  if (body && data?.id) {
    try {
      await addTicketMessage(data.id, { senderId: userId, body, role: 'buyer' });
    } catch (_) {}
  }
  return data;
}

export async function addTicketMessage(ticketId, { senderId, body, role = 'buyer' }) {
  if (!ticketId || !body) throw new Error('ticketId and body required');
  const row = {
    ticket_id: ticketId,
    sender_id: senderId || null,
    body: String(body),
    role: role || 'buyer',
  };
  // ستون‌های رایج جایگزین
  const attempts = [
    row,
    { ticket_id: ticketId, user_id: senderId, message: String(body), sender_role: role },
    { ticket_id: ticketId, author_id: senderId, content: String(body) },
  ];
  let lastErr = null;
  let data = null;
  for (const r of attempts) {
    const res = await sb().from('ticket_messages').insert(r).select('*').maybeSingle();
    if (!res.error) {
      data = res.data;
      lastErr = null;
      break;
    }
    lastErr = res.error;
  }
  if (lastErr) throw lastErr;
  try {
    await sb().from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId);
  } catch (_) {}
  return data;
}

