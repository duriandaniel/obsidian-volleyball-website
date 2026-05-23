# Supabase

Migrations and seeds for the OVA booking system database.

## Applying for the first time (one-off)

1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/advqzsvxwhrfidqitudd/sql/new).
2. Paste the contents of `migrations/0001_init.sql` and click **Run**. Should report success.
3. (Optional, dev only) Paste the contents of `seeds/0001_dev_seed.sql` and click **Run** to add a sample camp with 5 upcoming sessions.

## Applying subsequent migrations

Same as above: paste the new migration file in the SQL editor and run. Migrations are numbered and meant to be applied in order.

When we set up the Supabase CLI in the future, this becomes `supabase db push`.

## Verifying schema is ready

Visit `/api/health` on the deployed site. The response should include `"schemaReady": true`.
