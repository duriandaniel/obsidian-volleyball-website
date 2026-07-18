-- Human-readable program category, independent of the constrained `type`
-- ('term'/'camp') which drives booking/routing logic. Nullable + additive so
-- existing rows and all term/camp code paths are unaffected. Used to group
-- offerings (e.g. the Men's Development Squad) for dashboards and reporting.
--
-- Apply in the Supabase SQL editor (DDL can't be run from the app environment).

alter table programs
  add column if not exists category text;

-- Backfill the Men's Development Squad trial + squad as adult development.
update programs
  set category = 'adult_development'
  where slug in ('mens-dev-squad-trial', 'mens-dev-squad-winter26');
