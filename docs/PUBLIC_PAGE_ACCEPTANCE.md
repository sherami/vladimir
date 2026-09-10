# Public Property Page v0.8 — Acceptance

The page must read only `/properties/{id}/public`.

It must never:
- request draft evidence directly;
- calculate TAC, Yield, IRR/XIRR or Score in browser;
- show PROVISIONAL as FINAL;
- remove provenance/version information;
- describe DEVELOPER_MODEL as actual historical performance.

Current v0.8 page renders published metrics and calculation provenance. Why Buy / Why Not Buy are placeholders until structured analyst narrative fields are added to the publication snapshot.
