# 🏨 Hotel Booking Backend — README (Skeleton)

> **Status:** WIP learning project built first in **TypeScript/Node.js**, then reimplemented in **Go (GORM)**. This file is a structured skeleton you will flesh out as you progress through phases.

---

## ✨ Overview

A minimal hotel booking CRUD API focused on **learning-by-building** backend fundamentals: auth, bookings with transactional integrity, indexing & query plans, idempotency, observability, and performance measurement.

- Languages: **TypeScript → Go (GORM)**
- Database: **PostgreSQL**
- Packaging: **Docker** / docker-compose
- CI/CD: **GitHub Actions** (per-language, per-project)
- Goals: ship a simple, correct MVP; add depth (idempotency, isolation, EXPLAIN); then port to Go.

---

## 🚀 Quick Start (TypeScript)

> _Fill in as you scaffold the TS service._

```bash
# 1) dependencies
make install

# 2) start local stack (api + postgres)
docker-compose up --build

# 3) run migrations & seed (customize targets)
make migrate
make seed

# 4) run tests
make test
```

Environment variables to set (example):

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/hotel?sslmode=disable
JWT_SECRET=change-me
PORT=3000
LOG_LEVEL=info
FEATURE_SMART_SORT=false
```

> **Note:** Go service quick start mirrors these steps with `make build/test/run` and GORM models.

---

## 🗺️ Architecture (Placeholder)

> Replace this section with your final diagram and a 1–2 paragraph explanation.

- **Pattern:** Layered modular monolith: **HTTP (transport)** → **Application (use-cases)** → **Domain** → **Persistence**
- **Cross-cutting:** config, auth, logging/metrics, error mapping, rate limiting, graceful shutdown.

### Diagram (placeholder)

```
+-----------+     +------------------+     +-------------+     +----------------+
|  HTTP     | --> | Application/use  | --> |   Domain    | --> |  Persistence   |
| (REST)    |     |   cases (TS/Go)  |     |  Entities   |     |  Postgres      |
+-----------+     +------------------+     +-------------+     +----------------+
      |                   |                        ^                    ^
      | middleware: auth  | validation (DTOs)      | rules              | repos/queries
      v                   v                        |                    |
 request-id logs   error mapping            idempotency / TXs     EXPLAIN / indexes
```

> Consider adding a PNG/SVG to `docs/architecture.png` and link it here.

---

## 📁 Repository Layout

```
/backend-challenge/
  └── hotel-booking/
      ├── typescript/
      │   ├── src/
      │   │   ├── app/               # use-cases
      │   │   ├── domain/            # entities, rules
      │   │   ├── infra/
      │   │   │   ├── http/          # routes, controllers, middlewares
      │   │   │   ├── db/            # prisma client, repositories
      │   │   │   ├── auth/          # jwt, password hashing
      │   │   │   └── observability/ # logs, metrics, tracing
      │   │   └── config/
      │   ├── prisma/
      │   ├── test/
      │   ├── Dockerfile
      │   ├── docker-compose.yml
      │   └── Makefile
      ├── golang/
      │   ├── cmd/api/
      │   ├── internal/{app,domain,http,db,pkg}
      │   ├── migrations/            # reuse from /infra/db/migrations
      │   ├── Dockerfile
      │   ├── docker-compose.yml
      │   └── Makefile
      ├── infra/
      │   └── db/migrations/         # SQL source of truth
      ├── .github/workflows/
      └── README.md (this)
```

---

## 🔐 Auth (Baseline)

- **Strategy:** JWT (access & refresh) _or_ secure cookies.
- **Passwords:** bcrypt/argon2.
- **Roles:** `guest`, `admin`.
- **Security headers:** Helmet/CORS; if cookies—CSRF strategy.

Endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /api/v1/auth/me`

---

## 🧾 API Outline (v1)

> **Note:** This is an outline. You will generate an OpenAPI spec and keep it in `docs/openapi.yaml`.

### Hotels

- `GET /api/v1/hotels?city=&price_min=&price_max=&limit=&offset=`

  - Filters: city, price range; **pagination: offset/limit** (document keyset migration)

- `GET /api/v1/hotels/:id`
- `POST /api/v1/hotels` _(admin)_
- `PATCH /api/v1/hotels/:id` _(admin)_
- `DELETE /api/v1/hotels/:id` _(admin)_
- `GET /api/v1/hotels/availability?from=&to=&city=` _(join + EXPLAIN exercise)_

### Rooms

- `POST /api/v1/hotels/:hotel_id/rooms` _(admin)_
- `GET /api/v1/hotels/:hotel_id/rooms`
- `GET /api/v1/rooms/:id`
- `PATCH /api/v1/rooms/:id` _(admin)_
- `DELETE /api/v1/rooms/:id` _(admin)_

### Bookings

- `POST /api/v1/bookings` _(guest/admin)_

  - **Validation:** zod (TS) / validator (Go)
  - **Idempotency:** `Idempotency-Key` header
  - **Transactions:** prevent overlap; start with READ COMMITTED

- `GET /api/v1/bookings/:id` _(owner/admin)_
- `GET /api/v1/bookings?hotel_id=&room_id=&user_id=` _(admin; owner sees own)_
- `PATCH /api/v1/bookings/:id`
- `POST /api/v1/bookings/:id/cancel`

### Events (analytics)

- `POST /api/v1/events` — body: `{ event_type, entity_id, metadata }`

### Feature Flags

- Backing: env or DB table; wire `smart_sort` into `GET /hotels`.

---

## 🧱 Data Model (Sketch)

> SQL-first migrations live in `infra/db/migrations`.

- `users(id, email, password_hash, role, created_at, updated_at)`
- `hotels(id, name, address, city, country, created_at, updated_at)`
- `rooms(id, hotel_id, name, capacity, price_per_night, created_at, updated_at)`
- `bookings(id, user_id, room_id, start_date, end_date, status, total_price, created_at, updated_at)`
- `idempotency_keys(key, user_id, request_hash, booking_id, created_at, expires_at)`
- `events(id, user_id, event_type, entity_id, metadata jsonb, created_at)`

Indexes (initial):

- FK indexes; `(room_id, start_date, end_date)`; partial index on `bookings(status='confirmed')`.

---

## 🧪 Testing

- **Unit/Integration (TS):** Jest + supertest + Testcontainers for Postgres.
- **Go:** `testing`, `httptest`, testify; Postgres with dockertest/testcontainers-go.
- Concurrency tests to prove **no double-booking**.

---

## 🛡️ Error Handling & Security

- **Error mapping:** uniform `{ code, message, details? }`.
- **Request-ID logging** (propagate `x-request-id`).
- **Rate limiting** (token bucket), **timeouts** on outbound calls, **backpressure** notes.
- **XSS/CSP/CSRF** strategy documented.

---

## 📈 Observability & Performance

- **Logs:** include `request_id`, `user_id`, route, status, latency_ms.
- **Metrics:** p50/p95, RPS, error_rate (optional Prometheus endpoint).
- **Load test:** `autocannon`/`k6` scripts in `perf/`.
- **p95**: record baseline numbers + environment in `PERF.md`.

---

## 🎯 SLOs & Error Budget (Draft)

- **SLOs** (example):

  - `GET /hotels`: p95 < **400ms**, error rate < **0.5%**
  - `POST /bookings`: p95 < **600ms**, error rate < **0.5%**

- **Error Budget:** 0.5% of requests may fail within the window; define alert thresholds.

---

## 🗄️ Pagination Strategy

- Start: **offset/limit** (simple).
- Later: **keyset pagination** for large datasets; document tradeoffs & migration plan.

---

## 🧰 SQL & Indexing Exercises

- `EXPLAIN/ANALYZE` for availability join; add covering/partial indexes and compare plans.
- Two example queries to showcase index use (document in `DB_NOTES.md`).
- Window functions demo: `RANK() OVER (ORDER BY price or rating)`; discuss when it’s appropriate.

---

## 🧯 Reliability Notes

- **Graceful shutdown:** drain HTTP, close DB pool.
- **Deadlocks & lock types:** keep TXs short, consistent ordering, retry on serialization failures.

---

## 🧭 Roadmap (Phases)

- Phase 0: Skeleton & Basics
- Phase 1: DB & Hotels MVP
- Phase 2: Auth & Security Baseline
- Phase 3: Bookings Core (TX + Idempotency)
- Phase 4: Perf & Observability (p95)
- Phase 5: Querying & Indexing Deep-Dive
- Phase 6: Feature Flags
- Phase 7: Analytics Events
- Phase 8: Advanced SQL & Caching
- Phase 9: SRE Notes
- Phase 10: Go (GORM) port

---

## 📜 License

Choose and add a license (MIT/Apache-2.0/etc.).

---

## 📝 Changelog

- `2025-11-01` — initialize skeleton README.
