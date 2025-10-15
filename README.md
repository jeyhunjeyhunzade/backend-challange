# 🏗️ Backend Challenge — Fullstack Learning Journey

Welcome to the **Backend Challenge** — a structured, hands-on roadmap to mastering backend development by **building real-world projects twice**:
first in **TypeScript (Node.js)**, then in **Go (Golang)**.

---

## 🎯 Goal

The goal of this challenge is to gain **deep backend engineering experience** by:

- Designing and implementing multiple backend projects.
- Building each project **first in TypeScript** for clarity, then **reimplementing in Go** for performance and systems-level understanding.
- Learning modern backend architecture, APIs, databases, CI/CD, and deployment practices.

---

## 🧩 Project Structure

Each project lives under its own folder inside `/backend-challenge/`:

```
/backend-challenge/
  ├── todo-app/
  │     ├── typescript/
  │     └── golang/
  ├── url-shortener/
  │     ├── typescript/
  │     └── golang/
  ├── ...
  ├── infra/
  │     ├── db/
  │     │     └── migrations/     # Shared SQL migrations used by both languages
  │     └── k8s/                  # Optional Kubernetes manifests (later)
  ├── .github/
  │     └── workflows/            # CI/CD automation (GitHub Actions)
  ├── templates/                  # Reusable Makefile / Dockerfile templates
  ├── tools/                      # Scripts, linters, formatters, etc.
  └── README.md                   # This file
```

---

## 🧱 Project Lifecycle

Each project follows this consistent cycle:

| Step                          | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| **1. Design**                 | Define endpoints, database schema, and architecture.            |
| **2. Implement (TypeScript)** | Use Node.js + Express/Fastify or NestJS.                        |
| **3. Reimplement (Go)**       | Rebuild with idiomatic Go practices.                            |
| **4. Test**                   | Write unit/integration tests for both versions.                 |
| **5. Dockerize**              | Add Dockerfile and docker-compose for local setup.              |
| **6. CI/CD**                  | Integrate build, test, and deploy pipelines via GitHub Actions. |
| **7. Deploy**                 | Deploy containers to Render, Fly.io, or Railway.                |

---

## 🧰 Tech Stack

### Core Languages

- **TypeScript (Node.js)** — productivity & ecosystem learning.
- **Go (Golang)** — performance, concurrency, and systems understanding.

### Databases

- **PostgreSQL** (primary)

### Tooling

| Purpose          | Tool                                                |
| ---------------- | --------------------------------------------------- |
| API              | Express / Fastify / Fiber / Gin                     |
| ORM              | Prisma (TS), GORM or sqlx (Go)                      |
| DB Migrations    | Shared SQL scripts in `/infra/db/migrations`        |
| Containerization | Docker & docker-compose                             |
| CI/CD            | GitHub Actions                                      |
| Testing          | Jest / Supertest (TS) · Go’s `testing` package (Go) |

---

## ⚙️ CI/CD Overview

The repository supports **per-project** and **per-language** CI workflows.

### Workflow Triggers

- Runs automatically on changes to relevant paths (e.g., `todo-app/**`).
- Can be triggered manually via **workflow_dispatch**.
- Builds, lints, and tests the service.
- Optionally builds and pushes Docker images.

### Example

```
.github/workflows/ci-todo-app.yml
```

Contains isolated pipelines for the `todo-app` TypeScript and Go services.

---

## 🧾 Makefile Commands

Each language folder includes its own **Makefile** for standardized local and CI usage:

### TypeScript

```bash
make install    # npm ci
make test       # npm test
make build      # npm run build
make docker     # docker build -t image .
```

### Go

```bash
make test       # go test ./...
make build      # go build ./cmd/api
make docker     # docker build -t image .
```

---

## 🧪 Local Development

Every project includes its own `docker-compose.yml` for running locally:

```bash
cd todo-app
docker-compose up --build
```

This spins up:

- App container (TypeScript or Go)
- Database (Postgres)
- Optional admin tools (pgAdmin, etc.)

---

## 🌍 Deployment

Once a project passes CI:

- Tag it (e.g., `v1.0.0`)
- GitHub Actions will build and push Docker images.
- Deploy to your preferred environment:

  - **Railway.app**
  - **Fly.io**
  - **Render**
  - or **Kubernetes** (when you reach that phase)

---

## 🧑‍💻 Learning Progression

| Stage                     | Focus        |
| ------------------------- | ------------ |
| **Beginner Projects**     | Task Tracker |
| **Intermediate Projects** |              |
| **Advanced Projects**     |              |
| **DevOps Expansion**      |              |

---

## 🧠 Learning Goals

By the end of this challenge, you will:

- Be comfortable designing and building backend systems from scratch.
- Understand both high-level TypeScript productivity and Go performance tuning.
- Use Docker, Postgres, and CI/CD like a professional.
- Have a strong portfolio of backend projects in two languages.

---

## 📜 License

This challenge is for **personal learning and portfolio purposes**.
You are free to modify and distribute your code under your preferred license.

---

## 🧩 Next Step

Pick your **first project** — recommended starting point:
👉 **`todo-app`**

Then:

1. Create its architecture plan.
2. Implement the TypeScript version.
3. Rebuild it in Go.
4. Commit and push — your CI/CD pipeline will handle the rest.

---
