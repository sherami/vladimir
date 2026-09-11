# PrivatePhuket v1.0 RC5 — Calculation & CI Baseline

PrivatePhuket is a Property Intelligence platform for Phuket real estate. The system separates FACT, MODEL and analyst OPINION and keeps calculation, review and publication as distinct steps.

## RC5 status

The GitHub CI pipeline is now executing against PostgreSQL 16 and has proven the current code path end to end:

- migrations from an explicit `001` baseline marker through `006`;
- backend TypeScript typecheck;
- backend regression and PostgreSQL-backed tests;
- authenticated Layan Verde vertical slice through the real API;
- production IRR for single-date acquisitions and exact-date XIRR gate for off-plan;
- Base / Downside / Severe MODEL scenarios;
- canonical fixed-category Data Confidence provenance;
- immutable publication pointer behavior;
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

## Current limitations

This repository does **not** claim a deployed cloud staging environment or a Production Golden Dataset object. Layan Verde remains a staging calibration fixture and includes PP_ESTIMATE / DEVELOPER_MODEL inputs that prevent a production-final evidence status. Package audit warnings also remain to be remediated before production release.

Canonical API contract: `contracts/openapi-v1.0-rc5.yaml`.
