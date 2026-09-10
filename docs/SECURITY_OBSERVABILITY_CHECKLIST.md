# Security & Observability — RC1

Before internet exposure:
- JWT secret/issuer outside repository; rotate secrets.
- Short-lived access tokens and chosen identity provider.
- CORS allowlist.
- HTTPS only.
- Rate limits on auth/mutation endpoints.
- Request IDs and structured JSON logs.
- Audit events for source/evidence/review/publish/workflow.
- Error tracking without leaking source documents or secrets.
- DB least-privilege role; calculation runs UPDATE/DELETE revoked.
- Encrypted backups + restore test.
- Source-document object storage with private ACL/signed access.
- Dependency/security scan.
- PII minimization.
- Monitoring: API 5xx, latency, DB availability, failed publication attempts, migration failures.
