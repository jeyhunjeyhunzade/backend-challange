
# 🧭 Architecture Name: **Hexagonal Architecture (a.k.a. Ports and Adapters)**

✅ **Also known as:**

* **Clean Architecture** (by Uncle Bob) — a layered evolution of hexagonal
* **Onion Architecture** (by Jeffrey Palermo) — another close variant
* **Domain-Driven / Layered Application Architecture** (used at Microsoft, Netflix, Spotify, etc.)

---

## 🧱 Core Concept

> The **domain** (your business logic) is at the center, completely independent of the outside world.
> Everything that touches the outside — CLI, database, filesystem, HTTP, etc. — becomes an **adapter** that plugs into well-defined **ports**.

So your CLI calls → **Application Service** → **Domain** → **Port (interface)** → **Adapter (JSON repo)**.

---

## 🧩 Layers in Your Current Scaffold

| Layer                           | Folder                   | Responsibility                                           | Example                                   |
| ------------------------------- | ------------------------ | -------------------------------------------------------- | ----------------------------------------- |
| **Interface / Entry Point**     | `src/app.ts`, `src/cli/` | The "outer shell" where user interacts (CLI, HTTP, etc.) | CLI commands, argument parsing            |
| **Application / Service Layer** | `src/services/`          | Coordinates use-cases, business flows                    | `TaskService.add()`, `TaskService.list()` |
| **Domain Layer (Core)**         | `src/domain/`            | Pure business rules, no dependencies                     | `Task` model, validation, domain errors   |
| **Ports (Interfaces)**          | `src/ports/`             | Abstract boundaries to outside world                     | `TaskRepo` interface                      |
| **Adapters (Implementations)**  | `src/adapters/`          | Concrete implementations of ports                        | `JsonTaskRepo` (filesystem-based)         |
| **Infrastructure**              | `src/infra/`             | Shared low-level tools                                   | file paths, logger, utilities             |

---

## 🏢 Used by Famous Companies

* **Netflix** → Uses **Hexagonal Architecture** heavily in their microservices (each service isolated via ports & adapters).
* **Spotify** → Adopts **Clean Architecture** for internal developer tools and CLI services.
* **Booking.com** → Mix of **Clean + DDD**, emphasizing isolated “core logic” behind well-defined interfaces.
* **Microsoft** → Recommends **Onion / Clean Architecture** for modern .NET projects.
* **Google Cloud** → Promotes similar layering in their service blueprints (“Adapters, Services, and Repositories”).

---

## ⚙️ Why It’s Ideal for You

| Benefit                    | What It Means for Task Tracker                                             |
| -------------------------- | -------------------------------------------------------------------------- |
| **Testability**            | You can unit test your logic without touching the file system.             |
| **Replaceable Adapters**   | Later, you can swap `JsonTaskRepo` for a database, API, or memory adapter. |
| **Separation of Concerns** | CLI/UI code never mixes with business logic.                               |
| **Scalability**            | Easy to grow from CLI → REST API → Cloud service.                          |
| **Industry-proven**        | Same principles scale from your CLI to Netflix’s streaming microservices.  |

---

## 🔁 Short Summary

> **You’re using:**
> **Hexagonal Architecture (Ports and Adapters)**
> → a form of **Clean Architecture**
> → grounded in **Domain-Driven Design (DDD)** principles.

So if someone asks about your design, you can confidently say:

> “This CLI follows a **Hexagonal (Ports and Adapters) Architecture** — a Clean Architecture style emphasizing isolation between core logic, interfaces, and infrastructure.”

---

# 🧱 TypeScript Scaffold — “Task Tracker” (entrypoint + data module)

Here’s a **production-style skeleton** inspired by patterns you’ll see at big orgs (Netflix/Spotify-style layering, ports & adapters, explicit domain, thin CLI). It gives you clean seams to grow while keeping **zero runtime deps** (only dev deps like TypeScript).

---

## 📁 Directory Layout

```
project-01-task-tracker/
└─ typescript/
   ├─ src/
   │  ├─ app.ts                      # CLI entrypoint (shebang-friendly)
   │  ├─ cli/
   │  │  ├─ router.ts               # maps parsed args -> command handlers
   │  │  └─ parse-args.ts           # minimal positional-args parser
   │  ├─ domain/
   │  │  ├─ task.ts                 # domain model + invariants
   │  │  └─ errors.ts               # domain & infra error types
   │  ├─ ports/
   │  │  └─ task-repo.ts            # PORT: storage interface (hex arch)
   │  ├─ adapters/
   │  │  └─ fs/
   │  │     └─ json-task-repo.ts    # ADAPTER: JSON file implementation
   │  ├─ services/
   │  │  └─ task-service.ts         # application service (use-cases)
   │  ├─ infra/
   │  │  ├─ paths.ts                # resolve data file path
   │  │  └─ logger.ts               # tiny logger wrapper (console)
   │  └─ utils/
   │     └─ time.ts                 # timestamp helpers
   ├─ tasks.json                    # created at runtime (can be empty file or missing)
   ├─ package.json
   ├─ tsconfig.json
   ├─ .gitignore
   └─ Makefile
```

> Architecture notes: **Ports & Adapters (Hexagonal)** + **Domain-first** layering.
> CLI → Service (use-cases) → Port (interface) → Adapter (JSON on fs). Swap adapter later (e.g., DB) with zero changes to CLI/service.
