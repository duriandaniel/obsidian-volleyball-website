-- Dedicated, context-agnostic tracking for jersey purchases.
-- A jersey can be bought as a CAMP add-on, a TERM add-on, or STANDALONE on its
-- own, so jersey orders live in their own table rather than hanging off any one
-- order type. Optional links back to the originating order are kept for context.
--
-- Fulfilment list:
--   select c.first_name, c.last_name, p.first_name as kid,
--          j.size, j.quantity, j.context, j.fulfilled, j.paid_at
--   from jersey_orders j
--   join customers c on c.id = j.customer_id
--   left join participants p on p.id = j.participant_id
--   where j.deleted_at is null and j.status = 'paid'
--   order by j.paid_at desc;
create table if not exists jersey_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  participant_id uuid references participants(id), -- who it's for; null for standalone/adult
  size text not null,
  quantity integer not null default 1 check (quantity > 0),
  amount_cents integer not null check (amount_cents >= 0),
  context text not null default 'standalone' check (context in ('camp','term','standalone')),
  camp_order_id uuid references camp_orders(id), -- set when bought with a camp
  enrolment_id uuid references enrolments(id),    -- set when bought with a term enrolment
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  status text not null default 'paid' check (status in ('paid','refunded')),
  fulfilled boolean not null default false, -- flip true once the jersey is handed over
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists jersey_orders_customer_idx on jersey_orders (customer_id);
-- Idempotency: one jersey row per checkout session (webhook redelivery is safe).
create unique index if not exists jersey_orders_checkout_idx
  on jersey_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- Private table: anon/auth have no policies, so only the service role (server) can read/write.
alter table jersey_orders enable row level security;
