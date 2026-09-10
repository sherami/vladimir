# DB-backed integration suite

CI must provision a disposable PostgreSQL database, apply migrations 002–005, boot API with JWT_SECRET, then execute the staging vertical slice.

Required assertions:
1. Source and Evidence persist.
2. Latest Evidence materializes into calculation inputs.
3. Verification blockers persist and resolve.
4. Calculation run is immutable.
5. PROVISIONAL cannot publish.
6. FINAL without APPROVED cannot publish.
7. FINAL + APPROVED publishes.
8. Later calculation does not move public pointer.
9. Public endpoint returns exact published run.
10. Audit log contains source/evidence/review/publish actors.
