# Railway staging handoff — RC5

This file prepares a real PrivatePhuket staging environment. It does not mean staging has been deployed.

## Target services

Create four Railway services in one staging project:

1. `privatephuket-postgres` — Railway PostgreSQL.
2. `privatephuket-api` — repository `sherami/vladimir`, Root Directory `/backend`, Config as Code path `/backend/railway.json`.
3. `privatephuket-workspace` — same repository, Root Directory `/workspace`, Config as Code path `/workspace/railway.json`.
4. `privatephuket-public` — same repository, Root Directory `/public-web`, Config as Code path `/public-web/railway.json`.

Each application directory contains its own Dockerfile. The API image is compiled TypeScript and includes SQL migrations. Both frontends build to static assets and run behind nginx.

## API variables

Set these in `privatephuket-api` and never commit their real values:

- `DATABASE_URL` — reference the Railway PostgreSQL connection URL.
- `JWT_SECRET` — staging-only random secret, minimum 16 characters; use a materially longer generated value.
- `JWT_ISSUER` — e.g. `privatephuket-staging`.
- `JWT_AUDIENCE` — e.g. `privatephuket-api`.
- `CORS_ORIGINS` — comma-separated HTTPS origins for the deployed Analyst Workspace and Public Web.
- `NODE_ENV=production`.

Railway supplies `PORT`; the API already listens on `process.env.PORT`.

The API Config as Code runs `node dist/db/migrate.js` before deployment activation and uses `/api/v1/ready` as the healthcheck. The readiness endpoint must have a working database connection before traffic switches.

## Analyst Workspace variables

Set as a build variable on `privatephuket-workspace`:

- `VITE_API_URL=https://<api-domain>/api/v1`

Do not put JWTs in build variables. Analyst JWTs remain runtime user/session data in the current RC5 implementation.

## Public Web variables

Set as a build variable on `privatephuket-public`:

- `VITE_PUBLIC_API_URL=https://<api-domain>/api/v1`

The public frontend only reads the frozen `/properties/{id}/public` endpoint and must not receive an internal JWT.

## First deployment order

1. Provision PostgreSQL and confirm its connection variable.
2. Deploy API with temporary `CORS_ORIGINS` empty or the known future frontend domains if already assigned.
3. Generate an API public domain and verify `/api/v1/health` and `/api/v1/ready` return 2xx.
4. Set the API URL build variable on both frontends and deploy them.
5. Add the final Workspace and Public Web HTTPS origins to API `CORS_ORIGINS`, then redeploy API.
6. Verify browser CORS from both frontends.
7. Seed the Layan Verde staging fixture through authenticated API endpoints.
8. Re-run the vertical-slice assertions against the live staging API.

## Live acceptance gates

Staging is only considered deployed after all of these are true:

- API health and database readiness are green.
- migrations completed from the same repository revision as the running API.
- Analyst Workspace loads from its public staging URL.
- Public Web loads from its public staging URL.
- allowed CORS origins work and an unlisted origin is rejected.
- Layan Verde staging fixture reproduces TAC 9,294,039.14 THB and Net Yield 0.080669447 within frozen tolerances.
- production return metric is IRR and the fixture remains PROVISIONAL rather than silently becoming FINAL.
- a new immutable calculation run is persisted in staging PostgreSQL.
- no private source URI is exposed through the public snapshot endpoint.

## Explicit non-goals

A successful staging deploy does not make Layan Verde a Production Golden Dataset object. DEVELOPER_MODEL and PP_ESTIMATE inputs remain labeled as such until replaced by primary-source evidence. Staging also does not change the frozen scoring, confidence, risk, or verdict methodology.
