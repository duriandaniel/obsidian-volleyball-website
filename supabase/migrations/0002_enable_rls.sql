-- 0002: Enable Row-Level Security on all tables.
-- No policies are added. Effect: the public/publishable (anon) key is fully
-- locked out of every table via the Data API. The server uses the SECRET key
-- (service_role), which bypasses RLS, so all app routes keep working unchanged.
-- Apply by pasting into the Supabase SQL editor and clicking Run.

alter table venues          enable row level security;
alter table pricing_rules   enable row level security;
alter table programs        enable row level security;
alter table sessions        enable row level security;
alter table customers       enable row level security;
alter table participants    enable row level security;
alter table camp_orders     enable row level security;
alter table enrolments      enable row level security;
alter table bookings        enable row level security;
alter table email_log       enable row level security;
alter table audit_log       enable row level security;
alter table admin_users     enable row level security;
