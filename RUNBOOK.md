# Runbook — OVA Booking System

Common things that can break and how to fix them. Add new entries as we hit them.

## "Schema not ready" or "relation does not exist" errors on the deployed site

The Supabase migration hasn't been applied to the live database.

**Fix:** Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/advqzsvxwhrfidqitudd/sql/new), paste the contents of `supabase/migrations/0001_init.sql`, click **Run**. Verify with `/api/health` (should return `"schemaReady": true`).

## Stripe webhook events not landing

Symptoms: parent pays, no booking created, no confirmation email.

**Diagnose:**
1. Stripe dashboard → Developers → Webhooks → check the endpoint's event log. Look for failed deliveries with 4xx/5xx.
2. Vercel logs for `/api/stripe/webhook` route.
3. Confirm `STRIPE_WEBHOOK_SECRET` env var matches the signing secret shown in Stripe dashboard for that endpoint.

**Fix typical causes:**
- Secret rotated in Stripe but not updated in Vercel env: copy new secret, redeploy.
- Webhook URL pointing at the wrong deployment (e.g. preview URL that's been replaced): update URL in Stripe dashboard.
- Handler threw an error: read Vercel logs, fix root cause, re-deliver event from Stripe dashboard.

## Confirmation emails not arriving

**Diagnose:**
1. Check the `email_log` table for the booking's email — does it show `status = 'sent'` or `'failed'`?
2. If failed: `smtp_error` column has the SMTP server response. Often "Username and password not accepted" = app password revoked.
3. If sent: check Gmail Sent folder for the from address. If present there but not in recipient inbox, likely a deliverability / spam issue.

**Fix typical causes:**
- App password revoked: regenerate at https://myaccount.google.com/apppasswords for `obsidianvolleyball@gmail.com`, update `SMTP_PASSWORD` env var in Vercel + `~/.config/obsidian/smtp_password` locally.
- 2FA disabled on Gmail account: re-enable (required for app passwords).
- Going over daily limit (500/day regular Gmail, 2000/day Workspace): wait 24h or upgrade to Resend.

## Parent says they paid but don't see the booking

**Diagnose:**
1. Find the Stripe payment: Stripe dashboard → Payments → search by amount, email, or last 4 of card.
2. Get the `payment_intent` ID. Look in `bookings.stripe_payment_intent_id` and `camp_orders.stripe_payment_intent_id`.
3. If payment exists in Stripe but not in our DB: webhook either failed or hasn't been processed yet.

**Fix:**
- Re-deliver the `checkout.session.completed` event from the Stripe dashboard. Webhook handler is idempotent, safe to redeliver.
- If the webhook handler had a bug at the time, deploy the fix first, then redeliver.

## Session full but parent insists they should be in

**Diagnose:**
- Check the `bookings` table for that session: `select * from bookings where session_id = '...' and deleted_at is null`.
- Count vs `programs.default_capacity` (or `sessions.capacity_override` if set).

**Fix:**
- If admin needs to add manually beyond capacity, update `sessions.capacity_override` to a higher number, then add the booking. (Capacity is enforced by a DB trigger — there's no way to manually bypass.)

## Vercel deploy fails

**Diagnose:**
- Read Vercel build log. If "type check failed", run `npm run build` locally first to see the error in full.
- If env vars missing: `vercel env ls --scope duriandaniels-projects` to confirm all booking system vars are present.

## Live Stripe key accidentally committed or pasted somewhere

1. Stripe dashboard → Developers → API keys → revoke the leaked key immediately.
2. Generate a new key.
3. Update `STRIPE_SECRET_KEY` env var in Vercel.
4. Redeploy.
5. Monitor Stripe dashboard for any unauthorized charges in the next 24h.
