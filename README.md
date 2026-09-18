# PrivatePhuket v1.0 RC5 — Calculation & CI Baseline

PrivatePhuket is a Property Intelligence platform for Phuket real estate. The system separates FACT, MODEL and analyst OPINION and keeps calculation, review and publication as distinct steps.

## RC5 status

The GitHub CI pipeline executes against PostgreSQL 16 and now proves the current code path end to end:

- migrations from an explicit `001` baseline marker through `006`;
- reproducible `npm ci` installs from committed lockfiles;
- moderate-or-higher dependency audit gates for backend, Analyst Workspace and Public Web;
- backend TypeScript typecheck and regression suite;
- RBAC negative-path checks plus JWT issuer/audience validation;
- authenticated Layan Verde vertical slice through the real API;
- production IRR for single-date acquisitions and exact-date XIRR gate for off-plan;
- Base / Downside / Severe MODEL scenarios;
- canonical fixed-category Data Confidence provenance;
- immutable publication pointer behavior;
- PostgreSQL backup / restore smoke verification against non-empty property and calculation-run data;
- Analyst Workspace production build;
- Public Web production build.

## Frozen calculation rules

- Net Yield is a display metric, not the Required Return verdict metric.
- Single-date acquisitions use IRR; irregular off-plan payment schedules use XIRR.
- XIRR requires exact dates; month-only schedules do not pass the production gate.
- Exit Value grows from entry market value / purchase price, not TAC.
- Risk is applied once after the raw Investment Score.
- Missing inputs remain missing; they are never silently converted to zero.
- Publication is explicit and pins a frozen calculation snapshot.

## Current deployment and limitations

RC5 is deployed to Render staging with PostgreSQL, API, Analyst Workspace and Public Web. Live acceptance covers service availability, authentication, persistence and the public client flows for catalog, property analysis, comparison and calculator.

The remaining production release blocker is the Production Golden Dataset. Layan Verde remains a staging calibration fixture and includes PP_ESTIMATE / DEVELOPER_MODEL inputs that prevent a production-final evidence status. Closing this gate requires primary-source evidence for the critical acquisition, cost, payment-timing and rental inputs.

Canonical API contract: `contracts/openapi-v1.0-rc5.yaml`.
