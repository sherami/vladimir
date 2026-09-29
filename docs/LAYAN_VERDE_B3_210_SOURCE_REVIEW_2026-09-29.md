# Layan Verde B3-210 - source review (2026-09-29)

## Decision

Unit B3-210 is the current Production Golden Dataset candidate. It is **not**
Production Golden yet. The existing `Studio 37.4 sqm` staging fixture remains
unchanged because its regression values describe a different control unit.

## Reviewed documents

### Project price list

- Document creation date: 2026-02-04.
- Price stated as current on: 2026-02-02.
- Premium studios: 37.2 sqm and above.
- Advertised range: 8,172,180-9,430,920 THB.
- Classification: `VERIFIED_DOCUMENT` for the dated project price range only.
- Current-price status: `DEVELOPER_CLAIM`, because the analyst reports that
  prices have not changed but no September 2026 price list has been supplied.

### Commercial offer B3-210

- Offer validity: through 2026-02-28.
- Unit: Studio 210, Building B3, Floor 2.
- Area: 37.35 sqm.
- View: pool.
- Ownership in this offer: Leasehold.
- Apartment price: 8,172,180 THB.
- Furniture package: 373,500 THB.
- Apartment plus furniture: 8,545,680 THB.
- Rental program: Rental pool 40%-60%.
- Classification: `VERIFIED_DOCUMENT` as a dated offer, not as proof of
  September 2026 availability or current transaction terms.

## Documented payment options

All percentages in the offer are applied to the 8,345,680 THB balance after
the 200,000 THB reservation payment.

### 100% payment

- Reservation: 200,000 THB within 3 business days after reservation signing.
- Balance: 8,345,680 THB within 14 days after reservation.

### 50% first instalment

- Reservation: 200,000 THB.
- First payment: 4,172,840 THB within 14 days after reservation.
- Four payments: 1,043,210 THB each; the offer says every six months and gives
  only the final date, 2027-12-31.

### 35% first instalment

- Reservation: 200,000 THB.
- First payment: 2,920,988 THB within 14 days after reservation.
- Four payments: 1,356,173 THB each; the offer says every six months and gives
  only the final date, 2027-12-31.

The instalment options remain `MONTH_KNOWN` / `TO_VERIFY` for XIRR purposes.
The exact reservation date and the four exact calendar dates are required.

## Documented additional costs

| Input | Amount | Classification | Treatment |
|---|---:|---|---|
| Water/electric meters | 15,000 THB | `VERIFIED_DOCUMENT` | TAC |
| Sinking fund | 31,748 THB | `VERIFIED_DOCUMENT` | TAC |
| Leasehold registration | 94,002 THB | `VERIFIED_DOCUMENT` | TAC for Leasehold case |
| Common-area fee | 33,615 THB/year | `VERIFIED_DOCUMENT` | Operating expense, not TAC |

Document-backed Leasehold TAC before legal due diligence costs is
**8,686,430 THB**:

`8,172,180 + 373,500 + 15,000 + 31,748 + 94,002`.

## Analyst-supplied information and model treatment

- Furniture is separate; only optional decor may be added. The 373,500 THB
  package is document-backed for B3-210. Optional decor remains excluded.
- Freehold within the 49% foreign quota may be available, or Leasehold may be
  selected. B3-210 is Leasehold in the supplied offer; Freehold availability
  and its price require a current unit-specific offer or contract.
- Target completion is December 2028: `DEVELOPER_CLAIM`. The analyst considers
  delay risk material because substantial construction work remains.
- No actual rental statements exist. Developer guidance of 10%+ is
  `DEVELOPER_CLAIM` and is not used as historical performance.
- A 6%-7% return is a `PP_ESTIMATE`. If interpreted as net yield on the
  document-backed TAC, the draft annual NOI range is 521,185.80-608,050.10 THB;
  midpoint 564,617.95 THB. This range must not be promoted to `ACTUAL`.
- Utilities/common-area charges are deducted before rental profit is paid to
  the owner. The rental agreement or operator statement is still required to
  prevent double-counting operating costs.
- Exit agent commission: approximately 5%, `PP_ESTIMATE`.
- Leasehold transfer tax: 1.1%, analyst-supplied and `TO_VERIFY` against a
  current legal/tax source.
- Freehold transfer/tax basis: 6.3%, analyst-supplied and `TO_VERIFY`; payer
  allocation is transaction-specific.
- Document re-registration: approximately 100,000 THB, `PP_ESTIMATE`.
- Developer forecast: +30% value growth, `DEVELOPER_CLAIM`.
- PrivatePhuket cap: +20% total growth, `PP_ESTIMATE`. For a five-year hold this
  corresponds to approximately 3.71% annual compound growth. The hold horizon
  must be confirmed before this conversion is used in a calculation.

## Conflicting payment schedule

The separately reported schedule (100,000 THB reservation; 35% = 2,849,700;
55% = 4,478,100; 10% = 814,200) totals 8,142,000 THB before considering how
the reservation is credited. It does not reconcile to B3-210's documented
8,172,180 THB apartment price or 8,545,680 THB apartment-plus-furniture total.
It is retained as `TO_VERIFY` and is not used in the candidate calculation.

## Remaining Golden blockers

1. Current unit-specific offer confirming availability and September 2026 price.
2. Draft SPA/reservation agreement and official payment schedule with exact dates.
3. Confirmation of Leasehold or Freehold for the selected transaction.
4. Current legal quote for registration, tax and document costs, including payer split.
5. Rental-pool agreement defining the 40/60 split, deductible expenses and payout basis.
6. Actual owner/PMS operating statement when available; until then NOI remains estimated.
7. Confirmed exit horizon for the +20% PrivatePhuket growth cap.

Until these gates close, B3-210 remains a documented **production candidate**,
not a Production Golden Dataset object and not publishable with a final verdict.
