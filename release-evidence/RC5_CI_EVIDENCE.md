# RC5 CI Evidence

## Verified run

- Workflow: `PrivatePhuket Staging CI`
- Run: `#15`
- Run ID: `34562727685`
- Commit: `54abf284d830a4254deee190695784f98fe94262`
- URL: https://github.com/sherami/vladimir/actions/runs/34562727685
- Result: **SUCCESS**

## Gates proven by this run

1. PostgreSQL 16 service starts healthy.
2. Migration chain applies from `001_baseline_marker.sql` through `006_publication_narrative.sql` on an empty CI database.
3. Backend TypeScript typecheck passes.
4. Backend test suite passes, including PostgreSQL-backed tests for publication immutability and JSONB evidence persistence.
5. Authenticated Layan Verde vertical slice passes through the real API and database.
6. The Layan fixture preserves TAC and Net Yield calibration within frozen tolerances.
7. Production return metric for this single-date fixture is IRR.
8. Base / Downside / Severe scenarios are returned and ordered by IRR.
9. Layan Verde remains PROVISIONAL with Financial Data Confidence below the production threshold; no Final Verdict is fabricated.
10. Analyst Workspace production build passes.
11. Public Web production build passes.

## Important non-claims

This evidence proves the GitHub CI execution environment, not a deployed cloud staging environment. It does not promote Layan Verde to Production Golden Dataset status. The fixture intentionally contains `DEVELOPER_MODEL` and `PP_ESTIMATE` inputs, including a staging-only leasehold ownership assumption that must be replaced by primary-source verification before production freeze.
