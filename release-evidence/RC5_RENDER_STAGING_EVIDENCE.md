# RC5 Render Staging Evidence

## Verified environment

Verified on **2026-09-17** in Render workspace `Владимир's workspace`.

| Resource | Render name | Result |
|---|---|---|
| API | `privatephuket-staging-api` | **LIVE** |
| Analyst Workspace | `privatephuket-staging-workspace` | **LIVE** |
| Public Web | `privatephuket-staging-public` | **LIVE** |
| PostgreSQL | `privatephuket-staging-db` | **AVAILABLE** |

## Acceptance evidence

- API health endpoint returns `status: ok` and version `1.0.0-rc.5`.
- PostgreSQL migrations through workspace authentication are deployed.
- First persistent Analyst Workspace ADMIN was created through the one-time bootstrap flow.
- The one-time bootstrap token was cleared after initialization.
- Analyst Workspace authenticated successfully and loaded persisted portfolio data.
- The dashboard displayed 2 properties, 0 open verification items and 0 blockers at acceptance time.
- All three application services had a latest deploy status of `live`.
- No application-level error logs and no HTTP 500/502/503 responses were found during the post-initialization check.

## Boundaries

This evidence closes the external cloud-staging deployment gate. It does **not** close the Production Golden Dataset gate and does not promote any provisional calculation or verdict to FINAL.

The staging database uses Render's Free plan and expires on **2026-10-14** unless upgraded.
