# PrivatePhuket v1.0 RC3 — Deployment Handoff

## Goal
Move RC3 from packaged code to a real staging URL without changing the frozen financial methodology.

## Required staging services
1. PostgreSQL 16 or compatible managed PostgreSQL/Supabase.
2. Node.js 22 runtime for API.
3. Static hosting for Analyst Workspace.
4. Static hosting for Public Web.
5. HTTPS reverse proxy / managed ingress.
6. Private object storage for source documents.
7. Secret manager for DATABASE_URL and JWT credentials.

## DNS proposal
- api-staging.privatephuket.* → API
- analyst-staging.privatephuket.* → Analyst Workspace
- property-staging.privatephuket.* → Public Web

Actual domain names remain a deployment decision.

## Deployment order
1. Create DB and least-privilege app user.
2. Apply migrations 002–006 with migration runner.
3. Deploy API and pass `/api/v1/health` + `/api/v1/ready`.
4. Configure identity/JWT.
5. Deploy Analyst Workspace with API URL.
6. Deploy Public Web with public API URL.
7. Seed Layan Verde staging fixture.
8. Run vertical-slice verifier.
9. Capture calculation run ID and input hash.
10. Review/approve only if gates permit.
11. Publish controlled snapshot.
12. Confirm subsequent recalculation does not alter public pointer.

## Rollback
- Application: redeploy prior immutable image/artifact.
- Database: migrations are forward-only; restore staging snapshot for destructive rollback.
- Publication: never mutate a historical publication. Publish a new approved run or supersede it.
- Calculation runs: never edit/delete to “fix” a result.

## Go/No-Go
GO only when migrations, typecheck, tests, builds, vertical slice, RBAC negative tests, publication immutability and backup/restore smoke test are evidenced.
