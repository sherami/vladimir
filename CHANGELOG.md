# Changelog

## 1.0.0-rc.4
Stabilization release for first real GitHub CI/staging execution.

- Fixed CONSIDER return threshold to Required Return minus 2 percentage points.
- JWT secret validation now fails closed when missing or too short.
- Data Confidence follows the frozen fixed-category methodology.
- Off-plan XIRR requires exact dated cash flows; month-only dates are rejected.
- Frontend dependency versions pinned.
- Regression tests added for corrected policy invariants.

The release still requires real CI execution and does not declare a production Golden Dataset object.
