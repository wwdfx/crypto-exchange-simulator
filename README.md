# Crypto Exchange Simulator

Полнофункциональный симулятор криптовалютной биржи на базе PocketBase (аутентификация и real-time), Node.js/Express (интеграция с внешними API) и React (современный фронтенд).

## Стек
- Backend: Node.js + Express, PocketBase SDK, CoinGecko API, node-cron
- Frontend: React + Vite, PocketBase SDK, Chart.js + react-chartjs-2, Headless UI
- БД и real-time: PocketBase
- Развертывание: Linux Mint (инструкции ниже)

## Основные возможности
- Аутентификация (PocketBase), роли user/admin
- Главная страница: топ криптовалют, поиск/сортировка, графики
- Кабинет пользователя: портфель, торговля (покупка/продажа с комиссией), история сделок, аналитика
- Админ-панель: управление пользователями, сделками, настройками (стартовый баланс, комиссии, список монет)
- Real-time обновления цен из PocketBase, live-обновление портфеля и уведомления

## Структура проекта
```
crypto-exchange-simulator/
├── pocketbase/              # (опционально) место для бинарника и данных PB
├── backend/                 # Node.js API для внешних данных и логики торгов
│   ├── services/            # CoinGecko, PocketBase сервисы
│   ├── jobs/                # Cron задачи (обновление цен)
│   ├── middleware/          # Аутентификация через токен PocketBase
│   ├── config/              # Конфиги и env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/                # React приложение (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/        # PocketBase SDK и API-клиент к backend
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Быстрый старт (локально)
1) Установите PocketBase и запустите:
```bash
wget https://github.com/pocketbase/pocketbase/releases/download/v0.20.0/pocketbase_0.20.0_linux_amd64.zip
unzip pocketbase_0.20.0_linux_amd64.zip
./pocketbase serve --http="0.0.0.0:8090"
```
Перейдите в админку `http://localhost:8090/_/`, создайте администратора, коллекции и правила доступа (см. раздел PocketBase ниже).

2) Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3) Frontend:
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Откройте фронтенд из консоли Vite (обычно `http://localhost:5173`).

## Переменные окружения
Backend (`backend/.env`):
```
PORT=3001
POCKETBASE_URL=http://localhost:8090
COINGECKO_API_URL=https://api.coingecko.com/api/v3
UPDATE_INTERVAL=30000
CORS_ORIGIN=http://localhost:5173
FEE_RATE=0.0015
START_BALANCE=10000
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=changeme
```

Frontend (`frontend/.env`):
```
VITE_POCKETBASE_URL=http://localhost:8090
VITE_API_URL=http://localhost:3001
```

## PocketBase: коллекции и правила
Создайте коллекции:

- users (расширение базовой):
  - name (text)
  - role (select: user, admin; default: user)
  - balance (number; default: 10000)
  - total_profit_loss (number; default: 0)

- portfolios:
  - user (relation -> users)
  - cryptocurrency (text)
  - amount (number)
  - average_price (number)
  - current_value (number)

- transactions:
  - user (relation -> users)
  - type (select: buy, sell)
  - cryptocurrency (text)
  - amount (number)
  - price (number)
  - total (number)
  - fee (number)
  - profit_loss (number)

- cryptocurrencies:
  - symbol (text)
  - name (text)
  - current_price (number)
  - price_change_24h (number)
  - market_cap (number)
  - volume_24h (number)
  - last_updated (dateTime)

Правила доступа (пример):
- users: read/update — только свои данные (`@request.auth.id = id`)
- portfolios: читать/писать — только владелец (`@request.auth.id = user.id`)
- transactions: читать/писать — только владелец (`@request.auth.id = user.id`)
- cryptocurrencies: read — все; write — только admin

Примечание: Backend использует админ-доступ (PB_ADMIN_EMAIL/PASSWORD) для обновления коллекций и проведения сделок по безопасным правилам.

## Безопасность
- Валидация входных данных (Zod)
- CORS (список разрешённых источников)
- Rate limiting
- Helmet (базовые заголовки безопасности)
- Логи подозрительной активности

## Торговый процесс (симуляция)
- Покупка/продажа рассчитывается по текущей цене из коллекции `cryptocurrencies`
- Комиссия задаётся `FEE_RATE` (0.1–0.25%)
- Обновляются: баланс пользователя, позиция в `portfolios`, запись в `transactions`, `total_profit_loss` (для sell)
- Никаких реальных денежных операций

## Развертывание на Linux Mint
- Используйте PM2 для бэкенда: `pm2 start npm --name ces-backend -- run start`
- PocketBase как systemd сервис (см. пример в описании проекта)
- Vite сборка фронтенда: `npm run build` и раздача через Nginx/Serve/PM2

## Команды
Backend:
- `npm run dev` — dev сервер (nodemon)
- `npm start` — prod сервер

Frontend:
- `npm run dev` — dev режим
- `npm run build` — сборка
- `npm run preview` — локальный предпросмотр сборки
