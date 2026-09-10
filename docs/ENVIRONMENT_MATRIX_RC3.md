# Environment Matrix

| Setting | Local | CI | Staging | Production |
|---|---|---|---|---|
| NODE_ENV | development | test | staging | production |
| PostgreSQL | local/container | service container | managed | managed HA |
| JWT | dev token | CI secret | identity provider | identity provider |
| Source files | local/test | none | private bucket | private bucket |
| Public publish | disabled/restricted | test only | controlled | controlled |
| Audit retention | local | job lifetime | enabled | long-term |
| Backups | optional | none | daily + restore test | policy-driven |

No production environment should reuse CI or staging secrets.
