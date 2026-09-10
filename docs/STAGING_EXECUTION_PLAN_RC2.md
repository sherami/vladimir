# Staging Execution Plan — RC2

## Phase A — Infrastructure
1. Provision PostgreSQL/Supabase staging.
2. Create least-privilege application DB role.
3. Store JWT/database credentials in secret manager.
4. Configure private source-document storage.
5. Configure HTTPS and CORS allowlist.

## Phase B — Build gate
1. Install backend dependencies.
2. Apply migrations.
3. Run backend typecheck + tests.
4. Build Analyst Workspace.
5. Build Public Web.
6. Validate OpenAPI.
7. Fail deployment on any failed gate.

## Phase C — Layan Verde vertical slice
1. Create ANALYST identity/token.
2. Run `staging/scripts/seed-layan-verde.mjs`.
3. Run `staging/scripts/verify-vertical-slice.mjs`.
4. Confirm TAC = 9,294,039.14 THB ±1.
5. Confirm Net Yield ≈ 8.0669447%.
6. Confirm DEVELOPER_MODEL and PP_ESTIMATE labels survive materialization.
7. Confirm object is not promoted to production FINAL solely because arithmetic passes.

## Phase D — Publication control
1. Resolve only issues backed by actual sources.
2. Recalculate to a new immutable run.
3. Analyst approves exact run.
4. Editor publishes exact run.
5. Public page reads frozen snapshot.
6. Recalculate again and confirm published pointer remains unchanged.

## Phase E — Release evidence
Archive:
- migration log;
- test/build logs;
- calculation run ID/hash;
- publication ID;
- screenshot/PDF of public page;
- audit-log extract;
- backup/restore smoke-test result.

Only after these are captured can staging be called successfully deployed.
