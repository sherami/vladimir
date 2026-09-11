# Changelog

## 1.0.0-rc.5
Calculation-engine completion and executable CI baseline.

- Single-date acquisitions now use 5-year periodic IRR for Required Return logic instead of Net Yield.
- Exit Value grows from entry market value / purchase price, not TAC, and selling costs are deducted.
- Off-plan irregular payments continue to require exact-date XIRR; month-only dates remain blocked.
- Added Base / Downside / Severe scenario outputs using explicitly labeled MODEL proxies where granular ADR/occupancy/opex inputs are unavailable.
- Canonical fixed-category Data Confidence is exposed with per-field and per-category provenance.
- Exact normalized payment schedules can hydrate XIRR inputs; month-only schedules are never fabricated into dates.
- Public source disclosures are sanitized to prevent private URI/path leakage.
- Added explicit `001` migration baseline marker while preserving the historical 002–006 schema chain.
- Added PostgreSQL-backed publication immutability regression coverage.
- Fixed JSONB evidence persistence for string, number and structured values.
- Added and executed a real authenticated Layan Verde vertical slice in GitHub CI against PostgreSQL 16.
- Canonical API contract updated to `contracts/openapi-v1.0-rc5.yaml`.

CI now proves migrations, backend typecheck/tests, Layan Verde vertical slice, Analyst Workspace build and Public Web build. A cloud staging deployment and Production Golden Dataset are still not declared.

## 1.0.0-rc.4
Stabilization release for first real GitHub CI/staging execution.

- Fixed CONSIDER return threshold to Required Return minus 2 percentage points.
- JWT secret validation now fails closed when missing or too short.
- Data Confidence follows the frozen fixed-category methodology.
- Off-plan XIRR requires exact dated cash flows; month-only dates are rejected.
- Frontend dependency versions pinned.
- Regression tests added for corrected policy invariants.
