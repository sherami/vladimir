# PrivatePhuket v1.0 RC4 — Stabilized

RC4 is a code-stabilization release before first real CI/staging.

Important inherited defects were corrected:
- CONSIDER threshold is exactly Required Return − 2 percentage points;
- JWT secret fails closed;
- Data Confidence follows the frozen category-weight methodology;
- month-only payment dates cannot pass the production XIRR gate;
- frontend dependency versions are pinned;
- new regression tests cover the corrected policies.

No live staging deployment or successful npm/test/build run is claimed by this package.
GitHub/CI remains the next execution environment.
