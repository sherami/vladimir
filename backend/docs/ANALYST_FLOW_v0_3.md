# Analyst Flow v0.3

1. Создать property.
2. Добавить source.
3. Добавить evidence для полей.
4. Sync Verification Queue.
5. Закрыть BLOCKER / TO_VERIFY подтверждающими источниками.
6. Validate.
7. Calculate.
8. Получить immutable calculation run.
9. Review.
10. Publish только FINAL run.

## Пример
`annualNoi = 749745` без контекста недостаточно.
Правильная запись:
- field: annualNoi
- value: 749745
- status: DEVELOPER_MODEL
- sourceId: <rental pool PDF>
- asOf: <document date>
- analystComment: "Owner share in developer rental-pool model; not actual operating history."
