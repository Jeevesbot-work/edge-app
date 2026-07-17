-- Protein Pace push notifications.
-- Web Push subscriptions (one row per browser/device per user) + a per-day
-- guard column so a client is nudged at most once per day.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Clients manage only their own subscriptions. The cron job reads every row
-- via the service-role key (which bypasses RLS), so no broad read policy here.
create policy "own push_subscriptions select" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "own push_subscriptions insert" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "own push_subscriptions delete" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Once-per-day guard for the protein nudge. Simpler than a separate sent-log
-- table and enough for the "at most one nudge per day" rule.
alter table public.profiles
  add column if not exists last_protein_nudge_date date;
