# PrivatePhuket Architecture Freeze v1.0

## Authoritative boundaries
- PostgreSQL is system of record.
- Evidence is append-oriented and provenance-aware.
- Calculation Engine is authoritative for financial outputs.
- Browser/UI never calculates authoritative TAC/Yield/IRR/XIRR/Score.
- Calculation runs are immutable.
- Publication points to one approved FINAL calculation run.
- Public output is a frozen snapshot.
- Narrative explains calculations; it never modifies them.
- Risk is applied once.
- Exit growth starts from entry market value / purchase price, not TAC.
- Off-plan irregular payments require exact dated cash flows and XIRR.
- Missing data is null / TO_VERIFY, never silently zero.

## Investment Score v1
Rental 25%; Value 20%; Capital Growth 15%; Liquidity 15%; Location 10%; Supply 5%; Developer 5%; Legal 5%.

## BUY gate
Score >=80; production return >= required return; confidence >=75; return metric calculated; no critical TO_VERIFY/hard stop; analyst approval; explicit publication.

This file is the implementation freeze for RC1.
