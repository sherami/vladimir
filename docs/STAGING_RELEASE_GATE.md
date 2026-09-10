# PrivatePhuket Staging Release Gate

## Required
- [ ] Clean DB migrations succeed.
- [ ] JWT issuer/secret configured outside repository.
- [ ] RBAC negative tests pass.
- [ ] OpenAPI validates.
- [ ] Backend typecheck and unit tests pass.
- [ ] Workspace production build passes.
- [ ] One reference property completes Source → Evidence → Verification → Calculate → Review → Publish.
- [ ] Off-plan object without exact dated cash flows is blocked.
- [ ] PROVISIONAL run cannot publish.
- [ ] FINAL but unapproved run cannot publish.
- [ ] Published run stays pinned after later recalculation.
- [ ] Audit trail reconstructs actor/action/time.
- [ ] Backup/restore smoke test completed.

## Production is NOT allowed until
Golden Dataset blockers for production benchmark outputs are resolved and methodology/version fixtures are frozen.
