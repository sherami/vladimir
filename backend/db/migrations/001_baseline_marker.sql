-- PrivatePhuket migration-chain baseline marker.
--
-- The executable MVP schema historically began at 002_mvp_persistence.sql.
-- This no-op migration preserves that history while making an empty-database
-- migration chain explicitly start at 001 for staging/production audits.
-- Do not move table DDL from 002 into this marker; existing databases may have
-- already recorded 002-006 as applied.

select 1;
