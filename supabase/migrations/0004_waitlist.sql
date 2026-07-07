-- Waitlist for sold-out sessions (camps, term classes, trials, adult scrims).
-- One row = one parent/player waiting on one specific session.
--
-- Conventions match the rest of the schema: uuid PKs, timestamptz, soft-delete
-- via deleted_at, RLS enabled with no policies (service role only).
--
-- NOTE: the admin dashboard repo reads/writes this table — do not rename
-- columns without coordinating there.
--
-- Lifecycle:
--   join      -> row created (created_at orders the queue, oldest first)
--   spot opens -> top N active rows emailed, notified_at stamped (re-notified
--                on later openings; spots are first-come first-served)
--   they book -> converted_booking_id set by the Stripe webhook (email match)
--   removed   -> deleted_at set (admin action, dashboard)
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id),
  customer_name text not null,
  kid_name text, -- null for adult sessions (the player is the customer)
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  notified_at timestamptz, -- last time we emailed them about an opening
  converted_booking_id uuid references bookings(id), -- set once they book this session
  deleted_at timestamptz
);

create index if not exists waitlist_session_idx on waitlist(session_id) where deleted_at is null;
create index if not exists waitlist_email_idx on waitlist(lower(email)) where deleted_at is null;

-- One active waitlist entry per (session, email). Joining twice is a no-op.
create unique index if not exists waitlist_session_email_unique
  on waitlist(session_id, lower(email))
  where deleted_at is null;

-- Private table: no policies, so only the service role (server) can read/write.
alter table waitlist enable row level security;
