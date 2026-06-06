-- Structured tracking for the optional jersey add-on on camp orders.
-- Until now the jersey was recorded in Stripe (a line item) and in audit_log
-- JSON only. These columns give a clean, queryable home for fulfilment:
--   select c.first_name, c.last_name, p.first_name as kid, o.jersey_size, o.paid_at
--   from camp_orders o
--   join customers c on c.id = o.customer_id
--   join participants p on p.id = o.participant_id
--   where o.jersey_size is not null
--   order by o.paid_at desc;
alter table camp_orders
  add column if not exists jersey_size text,
  add column if not exists jersey_cents integer not null default 0;
