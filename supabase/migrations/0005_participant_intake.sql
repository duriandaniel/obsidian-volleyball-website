-- Player intake for the Men's Development Squad positional tryout (and reusable
-- for any program that needs it). Captured at trial signup, read when selecting
-- the squad. Nullable + additive so existing rows and other flows are unaffected.
--
-- Apply in the Supabase SQL editor (DDL can't be run from the app environment).

alter table participants
  add column if not exists nominated_positions text[],       -- e.g. {'setter','outside'}
  add column if not exists volleyball_experience text,        -- e.g. '3-5 years'
  add column if not exists highest_level text;                -- e.g. 'state_league'
