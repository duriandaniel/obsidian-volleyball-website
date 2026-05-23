-- Development seed data for the OVA booking system.
-- Run this AFTER the 0001_init migration.
-- Safe to re-run: uses INSERT ... ON CONFLICT to be idempotent.

-- Venue: Baulkham Hills High School
insert into venues (id, name, address)
values
  ('11111111-1111-1111-1111-111111111111', 'Baulkham Hills High School', '419A Windsor Rd, Baulkham Hills NSW 2153'),
  ('22222222-2222-2222-2222-222222222222', 'West Ryde', 'West Ryde NSW (venue TBC)')
on conflict (id) do nothing;

-- Pricing rule for camps: default OVA tier table
insert into pricing_rules (id, name, scope, tiers)
values (
  '33333333-3333-3333-3333-333333333333',
  'Default Camp Tiers',
  'camp',
  '[
    {"full_days": 0.5, "price_cents": 3500},
    {"full_days": 1,   "price_cents": 5000},
    {"full_days": 2,   "price_cents": 9800},
    {"full_days": 3,   "price_cents": 14400},
    {"full_days": 4,   "price_cents": 18800},
    {"full_days": 5,   "price_cents": 20000}
  ]'::jsonb
)
on conflict (id) do nothing;

-- Sample camp program: 5-day camp at Baulkham Hills, published so it shows publicly
insert into programs (id, type, title, slug, season, description, venue_id, default_capacity, skill_level, age_min, age_max, status, pricing_rule_id, refund_policy)
values (
  '44444444-4444-4444-4444-444444444444',
  'camp',
  'Sample Holiday Camp (test)',
  'sample-holiday-camp-test',
  'Test Camp 2026',
  'Sample camp for testing the booking system. Replace with real camp before launch.',
  '11111111-1111-1111-1111-111111111111',
  24,
  'mixed',
  8,
  18,
  'published',
  '33333333-3333-3333-3333-333333333333',
  'credit'
)
on conflict (id) do nothing;

-- 5 camp sessions: Mon-Fri next week, 9am-1pm Sydney time
-- Using a CTE so we don't have to hardcode dates that go stale.
-- Sessions are scheduled for the upcoming Monday + 4 days.
with next_monday as (
  select
    (date_trunc('week', now() at time zone 'Australia/Sydney') + interval '1 week') at time zone 'Australia/Sydney' as start_date
)
insert into sessions (program_id, starts_at, ends_at, status)
select
  '44444444-4444-4444-4444-444444444444',
  (start_date + (i || ' days')::interval + interval '9 hours') at time zone 'Australia/Sydney',
  (start_date + (i || ' days')::interval + interval '13 hours') at time zone 'Australia/Sydney',
  'scheduled'
from next_monday, generate_series(0, 4) i
on conflict do nothing;
