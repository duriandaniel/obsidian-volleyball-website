-- Term enrolment signups: the "enrol now, try 2 weeks free, pay only if you stay"
-- model. NO payment is taken at signup. Dan follows up and sends a manual Stripe
-- payment link for the full term after lesson 2.
--
-- Run this in the Supabase SQL editor (DDL; the app service key cannot create tables).
create table if not exists term_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- which class they enrolled in
  program_id uuid references programs(id),
  program_slug text,
  program_title text,
  venue_name text,
  day_label text,
  time_label text,

  -- CRM linkage (also upserted into customers/participants like other bookings)
  customer_id uuid references customers(id),
  participant_id uuid references participants(id),

  -- parent
  parent_first_name text not null,
  parent_last_name text not null,
  parent_email text not null,
  parent_phone text not null,
  source text,

  -- child
  child_first_name text not null,
  child_last_name text not null,
  child_year_at_school text,
  child_level text,
  child_school_name text,
  medical_notes text,
  photo_consent boolean not null default false,
  injury_ack boolean not null default false,

  -- follow-up state (Dan works these on the dashboard)
  status text not null default 'new' check (status in ('new','contacted','enrolled','declined')),
  notes text
);

create index if not exists term_signups_created_idx on term_signups (created_at desc);
create index if not exists term_signups_status_idx on term_signups (status);

-- Writes/reads happen server-side via the service key (bypasses RLS). No public policies.
alter table term_signups enable row level security;
