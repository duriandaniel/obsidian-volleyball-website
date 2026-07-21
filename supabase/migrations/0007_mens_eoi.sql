-- Men's Development Squad expressions of interest.
--
-- The squad is postponed (Jul 2026): trials no longer bookable, the program
-- sells nothing. Instead /mens-squad collects EOIs so we can email everyone
-- when a future batch opens. One active row per email; re-registering updates
-- the existing row.

create table if not exists mens_eoi (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_position text, -- setter | outside | middle | opposite | libero | flex
  created_at timestamptz not null default now(),
  contacted_at timestamptz, -- set when we email them about a batch opening
  deleted_at timestamptz
);

create unique index if not exists mens_eoi_email_uniq
  on mens_eoi (lower(email)) where deleted_at is null;

-- Service role only (same posture as waitlist): RLS on, no policies.
alter table mens_eoi enable row level security;
