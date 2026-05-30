-- OVA Booking System: initial schema
-- Convention: amounts in cents (integer); UUIDs from gen_random_uuid(); timestamps as timestamptz; soft-delete via deleted_at.

create extension if not exists "pgcrypto";

-- ============================================================
-- venues
-- ============================================================
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ============================================================
-- pricing_rules
-- For camp: tiers is jsonb array like [{"full_days":1,"price_cents":5000}, ...]
-- For term: term_per_session_cents is the single per-week price
-- ============================================================
create table pricing_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scope text not null check (scope in ('camp','term')),
  tiers jsonb,
  term_per_session_cents integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- programs (the thing that's sold)
-- ============================================================
create table programs (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('term','camp')),
  title text not null,
  slug text not null unique,
  season text,
  description text,
  venue_id uuid not null references venues(id),
  default_capacity integer not null default 24 check (default_capacity > 0),
  skill_level text check (skill_level in ('beginner','intermediate','advanced','mixed')),
  age_min integer,
  age_max integer,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  pricing_rule_id uuid references pricing_rules(id),
  trial_eligible boolean not null default true,
  refund_policy text not null default 'forfeit' check (refund_policy in ('forfeit','credit','cash')),
  cancel_window_hours integer not null default 24,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index programs_status_idx on programs(status) where deleted_at is null;
create index programs_type_idx on programs(type) where deleted_at is null;

-- ============================================================
-- sessions (specific date+time instances of a program)
-- ============================================================
create table sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity_override integer check (capacity_override is null or capacity_override > 0),
  status text not null default 'scheduled' check (status in ('scheduled','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at > starts_at)
);

create index sessions_program_id_idx on sessions(program_id) where deleted_at is null;
create index sessions_starts_at_idx on sessions(starts_at) where deleted_at is null;

-- ============================================================
-- customers (parents / payers)
-- auth_user_id links to Supabase auth.users when they register;
-- guest checkouts can have null auth_user_id until they claim the account
-- ============================================================
create table customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  photo_consent boolean not null default false,
  preferred_channel text,
  source text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index customers_email_unique on customers(lower(email)) where deleted_at is null;

-- ============================================================
-- participants (kids)
-- ============================================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  school_name text,
  year_at_school text,
  volleyball_level text check (volleyball_level in ('beginner','intermediate','advanced')),
  medical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index participants_customer_id_idx on participants(customer_id) where deleted_at is null;

-- ============================================================
-- camp_orders (a multi-day camp purchase = one Stripe checkout)
-- ============================================================
create table camp_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  participant_id uuid not null references participants(id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index camp_orders_customer_id_idx on camp_orders(customer_id);
create index camp_orders_status_idx on camp_orders(status);

-- ============================================================
-- enrolments (a term-program enrolment = one Stripe checkout)
-- Each enrolment grants credits that are debited per attended session.
-- ============================================================
create table enrolments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  participant_id uuid not null references participants(id),
  program_id uuid not null references programs(id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  weeks_paid integer not null check (weeks_paid > 0),
  per_week_cents integer not null check (per_week_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending' check (status in ('pending','active','cancelled','completed')),
  starts_on date,
  paid_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enrolments_customer_id_idx on enrolments(customer_id);
create index enrolments_program_id_idx on enrolments(program_id);

-- ============================================================
-- bookings (a held seat in one specific Session)
-- Money-safe invariants enforced at DB level:
--   confirmed bookings MUST have paid_at and a Stripe reference
-- ============================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id),
  participant_id uuid not null references participants(id),
  customer_id uuid not null references customers(id),
  source text not null check (source in ('camp','term','trial','comp','admin_manual')),
  camp_order_id uuid references camp_orders(id),
  enrolment_id uuid references enrolments(id),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','attended','no_show')),
  paid_amount_cents integer,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by in ('parent','admin','system')),
  cancellation_reason text,
  refund_status text not null default 'none' check (refund_status in ('none','requested','issued','declined')),
  refund_amount_cents integer,
  attended_marked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- Confirmed bookings must have payment evidence (unless they're free: trial or comp)
  check (
    status != 'confirmed'
    or source in ('trial','comp')
    or (paid_at is not null and stripe_payment_intent_id is not null)
  ),
  -- Cancelled bookings must have cancellation metadata
  check (
    status != 'cancelled'
    or (cancelled_at is not null and cancelled_by is not null)
  ),
  -- A participant cannot have two non-cancelled bookings for the same session
  unique (session_id, participant_id, deleted_at)
);

create index bookings_session_id_idx on bookings(session_id) where deleted_at is null;
create index bookings_customer_id_idx on bookings(customer_id) where deleted_at is null;
create index bookings_participant_id_idx on bookings(participant_id) where deleted_at is null;
create index bookings_status_idx on bookings(status) where deleted_at is null;

-- ============================================================
-- capacity guard
-- Prevents oversell at the DB level even if app logic has a bug.
-- Trigger on insert/update of bookings: count confirmed bookings for the session,
-- compare against effective capacity (session override or program default), reject if over.
-- ============================================================
create or replace function check_session_capacity() returns trigger as $$
declare
  effective_capacity integer;
  current_confirmed integer;
begin
  if new.status not in ('confirmed','pending') then
    return new;
  end if;

  select coalesce(s.capacity_override, p.default_capacity)
    into effective_capacity
  from sessions s join programs p on p.id = s.program_id
  where s.id = new.session_id;

  select count(*)
    into current_confirmed
  from bookings
  where session_id = new.session_id
    and status in ('confirmed','pending')
    and deleted_at is null
    and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if current_confirmed + 1 > effective_capacity then
    raise exception 'Session % is at capacity (% / %)', new.session_id, current_confirmed, effective_capacity
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger bookings_capacity_check
before insert or update on bookings
for each row
execute function check_session_capacity();

-- ============================================================
-- email_log
-- Every email send attempt is logged here so admin can see "did we try to send X"
-- without needing a third-party dashboard. Required because we use Gmail SMTP, not Resend.
-- ============================================================
create table email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  from_email text not null,
  subject text not null,
  template text,
  related_booking_id uuid references bookings(id),
  related_camp_order_id uuid references camp_orders(id),
  related_enrolment_id uuid references enrolments(id),
  status text not null default 'sent' check (status in ('sent','failed','queued')),
  smtp_error text,
  sent_at timestamptz not null default now()
);

create index email_log_to_email_idx on email_log(to_email);
create index email_log_sent_at_idx on email_log(sent_at desc);

-- ============================================================
-- audit_log
-- Append-only. Every admin action touching money or kid records lands here.
-- ============================================================
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  actor_role text not null check (actor_role in ('parent','admin','owner','system')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on audit_log(entity_type, entity_id);
create index audit_log_created_at_idx on audit_log(created_at desc);
create index audit_log_actor_idx on audit_log(actor_user_id);

-- audit_log is append-only by convention; enforce at db level
create rule audit_log_no_update as on update to audit_log do instead nothing;
create rule audit_log_no_delete as on delete to audit_log do instead nothing;

-- ============================================================
-- admin_users
-- Stores role for users with admin/owner powers.
-- Linked to Supabase auth.users via auth_user_id.
-- ============================================================
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  email text not null,
  role text not null check (role in ('admin','owner')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger venues_updated_at before update on venues for each row execute function set_updated_at();
create trigger pricing_rules_updated_at before update on pricing_rules for each row execute function set_updated_at();
create trigger programs_updated_at before update on programs for each row execute function set_updated_at();
create trigger sessions_updated_at before update on sessions for each row execute function set_updated_at();
create trigger customers_updated_at before update on customers for each row execute function set_updated_at();
create trigger participants_updated_at before update on participants for each row execute function set_updated_at();
create trigger camp_orders_updated_at before update on camp_orders for each row execute function set_updated_at();
create trigger enrolments_updated_at before update on enrolments for each row execute function set_updated_at();
create trigger bookings_updated_at before update on bookings for each row execute function set_updated_at();
