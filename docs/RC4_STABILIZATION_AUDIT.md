# RC4 Stabilization Audit

Fixed from inherited MVP line:
1. CONSIDER threshold: `requiredReturn * .75` → `requiredReturn - 0.02`.
2. JWT secret no longer silently falls back to empty string.
3. Data Confidence now uses fixed category weights from Production Freeze.
4. Missing Confidence categories contribute zero instead of disappearing from denominator.
5. Critical TO_VERIFY remains an independent gate.
6. Off-plan XIRR blocks `MONTH_KNOWN` / `TO_VERIFY` dates.
7. Frontend dependency declarations no longer use `latest`.
8. Regression tests added for verdict threshold, fixed confidence weights and exact-date gate.

Still requires networked execution:
- dependency install;
- TypeScript typecheck;
- Vitest;
- PostgreSQL migration test;
- frontend builds;
- DB-backed publication immutability test.
