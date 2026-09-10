# PrivatePhuket Analyst Workspace v0.4

Первый рабочий UI-каркас для внутреннего аналитика.

## Экраны
- Dashboard
- Properties
- Property Workspace
- Verification Queue
- Calculation Review
- Publication Review placeholder

## Запуск
Backend:
`cd backend && npm install && npm run dev`

Workspace:
`cd workspace && npm install && npm run dev`

Укажите `VITE_API_URL`, если API работает не на `http://localhost:3000/api/v1`.

## Принцип
Интерфейс не вычисляет authoritative metrics. Он показывает данные API и запускает backend operations.
