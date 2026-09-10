# PrivatePhuket v0.7 — Staging Vertical Slice

## Reference object
Layan Verde · Studio 37.4 sqm.

This fixture is selected because the purchase price and developer rental-pool model are known, while remaining PP estimates make the Confidence/Provisional behavior useful to test.

## Expected arithmetic
- Purchase: THB 8,591,740
- Furniture PP estimate: THB 561,000
- Other acquisition PP estimate: THB 141,299.14
- TAC: THB 9,294,039.14
- Developer-model owner income: THB 749,745/year
- Net Yield on TAC: about 8.0669%

These are staging calibration values, not a production Golden Verdict.

## Run
1. Apply DB migrations through `005_staging_controls.sql`.
2. Start API and obtain an ANALYST JWT.
3. `PP_TOKEN=... node staging/scripts/seed-layan-verde.mjs`
4. Set returned property id:
   `PP_PROPERTY_ID=... PP_TOKEN=... node staging/scripts/verify-vertical-slice.mjs`
5. Inspect Verification Queue.
6. Confirm PP_ESTIMATE / DEVELOPER_MODEL provenance is visible.
7. Confirm calculation arithmetic passes.
8. Confirm the run does NOT silently become a production FINAL recommendation.
9. Replace PP estimates with primary-source evidence as documents arrive.
10. Only after gates are satisfied: analyst review → editor publish → public endpoint.

## Pass condition
The platform reproduces the reference arithmetic while preserving uncertainty and refusing to turn incomplete evidence into false certainty.
