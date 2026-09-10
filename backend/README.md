# PrivatePhuket MVP Backend v0.3

Третий вертикальный срез: Source & Evidence Layer + Verification Queue.

## Что появилось
- Source Registry для документов, market data и developer materials.
- Field-level Evidence: каждое существенное значение хранится со `status`, `sourceId`, `asOf`, analyst comment и critical flag.
- Версионирование evidence через append-only записи + `supersedesId`.
- Автоматический расчёт Data Confidence из evidence.
- Автоматическое определение `criticalToVerify`.
- Verification Queue с BLOCKER / WARNING / INFO.
- Sync validation issues → verification tasks.
- Resolve verification item с actor/comment/source.
- Audit log для property/source/evidence/calculate/publish/resolve.
- Calculation теперь получает inputs из latest evidence, а не из «голого» объекта.

## API v0.3
- `POST /api/v1/properties/{id}/sources`
- `GET /api/v1/properties/{id}/sources`
- `POST /api/v1/properties/{id}/evidence`
- `GET /api/v1/properties/{id}/evidence`
- `POST /api/v1/properties/{id}/verification/sync`
- `GET /api/v1/verification`
- `POST /api/v1/verification/{id}/resolve`
- плюс validate / calculate / publish / public из v0.2.

## Ключевой принцип
Значение не считается production-grade только потому, что оно заполнено. Важны происхождение, статус и актуальность.

## Следующий шаг
v0.4 — первый Analyst Workspace: Dashboard, Properties, Property Workspace, Verification Queue, Calculation Review и Publication Review поверх текущего API.
