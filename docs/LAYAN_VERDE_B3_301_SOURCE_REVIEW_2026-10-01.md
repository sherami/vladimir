# Layan Verde B3-301 - source review (2026-10-01)

## Decision

Unit B3-301 supersedes B3-210 as the current Production Golden Dataset
candidate because the supplied commercial offer is current through 2026-10-25
and a Leasehold agreement draft has now been supplied. It is **not** Production
Golden yet: the agreement is an uncompleted template and its Annex B conflicts
with the commercial offer payment schedule.

## Current commercial offer

- Unit: Studio B3-301, Building B3, Floor 3.
- Area: 38.63 sqm.
- View: garden.
- Ownership: Leasehold.
- Program: Rental pool 40%-60%.
- Apartment price: 10,009,033 THB.
- Furniture package: included.
- Offer validity: through 2026-10-25.
- Classification: `VERIFIED_DOCUMENT` for the dated offer.

## Documented additional costs

| Input | Amount | Classification | Treatment |
|---|---:|---|---|
| Water/electric meters | 15,000 THB | `VERIFIED_DOCUMENT` | TAC |
| Sinking fund | 32,836 THB | `VERIFIED_DOCUMENT` | TAC |
| Leasehold registration | 110,099 THB | `VERIFIED_DOCUMENT` | TAC |
| Common-area fee | 34,767 THB/year | `VERIFIED_DOCUMENT` | Operating expense, not TAC |

Document-backed Leasehold TAC before independent legal due diligence is
**10,166,968 THB**:

`10,009,033 + 15,000 + 32,836 + 110,099`.

## Payment schedules in the current offer

The reservation payment is included in the total price.

### 100% payment

- Reservation: 200,000 THB within 3 business days after reservation signing.
- Balance: 9,809,033 THB within 14 days after reservation.

### 50% first instalment

- Reservation: 200,000 THB.
- First payment: 4,904,517 THB within 14 days after reservation.
- Payments 2-5: 980,903 THB each, every six months.
- Payment 6: 980,904 THB, six months after payment 5.

### 35% first instalment

- Reservation: 200,000 THB.
- First payment: 3,433,162 THB within 14 days after reservation.
- Payments 2-5: 1,275,174 THB each, every six months.
- Payment 6: 1,275,175 THB, six months after payment 5.

Both instalment schedules reconcile exactly to 10,009,033 THB.

## Model dates for XIRR

The developer does not insert calendar dates and describes later instalments as
payable every six months. Until the reservation is signed, the model may use a
clearly labelled `MODEL_ASSUMPTION` based on a reservation date of 2026-10-01:

| Event | Model date |
|---|---|
| Reservation | 2026-10-01 |
| First payment | 2026-10-15 |
| Second payment | 2027-04-15 |
| Third payment | 2027-10-15 |
| Fourth payment | 2028-04-15 |
| Fifth payment | 2028-10-15 |
| Sixth payment | 2029-04-15 |

The last model instalment falls after the contractual target completion in Q4
2028. Clause 3.5 of the draft also requires full payment by the earlier of the
inspection or registration date. The executed agreement must resolve this
timing conflict; the model must accelerate the remaining balance if inspection
or registration occurs earlier.

## Leasehold draft - verified terms

The supplied bilingual draft is a project template: unit number, buyer details,
price, dates and several annex fields are blank. It nevertheless documents the
following project terms:

- Lessor: Layan Best View Company Limited, registration no. 0835564009196.
- Initial Leasehold term: 30 years from Land Office registration.
- Clause 2.4 gives the lessee a right to request a new 30-year agreement with at
  least 90 working days' notice. Renewal mechanics and enforceability require
  independent Thai legal review; the model must not present 30+30+30 as a
  guaranteed registered term.
- Target completion: end of Q4 2028.
- Force majeure can extend completion; a separate suspension provision allows
  an extension of up to 12 months without constituting breach.
- Condominium registration is planned within 90 days after construction
  completion; Leasehold registration is stated as no later than six months
  after inspection.
- Registration fees, tax, stamp duty and related registration expenses are for
  the lessee unless the executed documents state otherwise.
- Late buyer payment: 5% per annum on overdue amounts, capped at 10% of the
  Lease Price.
- If the lessor misses completion or registration deadlines, the draft provides
  termination/damages alternatives, each capped as stated in clause 7.3.

## Rental pool

- Analyst confirmation: 40% of profit to the management company and 60% to the
  owner. Classification: `ANALYST_CONFIRMED`; the current offer displays
  `40%-60%`, but does not label the parties in the split.
- The draft requires the furniture package and permits short-term rental only
  through the project's operator/management structure.
- Profit is based on actually accumulated profit, paid in THB to a Thai bank
  account within 30 days after the annual profit statement; the statement is
  due by the end of February for the prior year.
- Applicable taxes are deducted before payout.
- Owner use is one 30-day period per year between May 1 and October 31, subject
  to coordination and advance notice.
- The draft says detailed rental-pool conditions will be agreed separately
  after registration. Therefore the definition of profit, full deductible-cost
  waterfall, reserve policy and audit rights remain open.

## Payment-schedule conflict in the draft

Annex B of the Leasehold template contains an uncompleted legacy structure:
35% + 20% + 20% + 15% + 10%. It also contains placeholder amounts and dates.
This conflicts with the current B3-301 commercial offer, whose 35% option is
followed by five 13% instalments. For modelling, the current commercial offer
controls. Before signature, Annex B must be replaced with a completed schedule
that matches the selected offer.

## Preliminary return treatment

No actual owner statements have been supplied. Developer claims must not be
treated as historical performance. A PrivatePhuket 6%-7% net-yield scenario on
document-backed TAC would imply annual owner NOI of approximately
610,018-711,688 THB. This is a `PP_ESTIMATE`, not an actual or guaranteed return,
and remains subject to the rental profit definition and expense waterfall.

## Remaining Golden blockers

1. Completed B3-301 Leasehold agreement with unit, price, buyer and dates filled.
2. Annex B aligned with the selected commercial-offer schedule.
3. Reservation date or signed reservation agreement for exact XIRR dates.
4. Separate rental-pool agreement defining profit, deductions, reserves and audit rights.
5. Independent Thai legal review of Leasehold renewal, delay and exit-transfer terms.
6. Actual owner/PMS statements when operations begin; until then NOI is estimated.
7. Confirmed exit horizon and resale-cost assumptions.

Until these gates close, B3-301 is a stronger documented production candidate,
but it is not publishable as Production Golden or with a final investment verdict.
