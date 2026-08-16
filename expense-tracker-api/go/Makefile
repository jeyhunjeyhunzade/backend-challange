.PHONY: build run dev test test-verbose test-coverage clean install fmt vet check \
        db-up db-down db-reset db-logs db-shell env help \
        migrate-install guard-migrate migrate-create migrate-up migrate-down \
        migrate-version migrate-force migrate-drop

# Binary name
BINARY_NAME=expense-tracker-api
BINARY_PATH=bin/$(BINARY_NAME)
MAIN_PATH=./cmd/server

# Compose service name for Postgres (see docker-compose.yml)
DB_SERVICE=db

# Migrations are shared across language implementations, so they live at the
# repo root rather than inside this Go folder.
MIGRATIONS_DIR=../../infra/db/migrations/expense-tracker-api

# Prefer a migrate binary on PATH; otherwise fall back to GOPATH/bin, which is
# where `make migrate-install` puts it and which is often not on PATH.
MIGRATE ?= $(shell command -v migrate 2>/dev/null || echo $(shell go env GOPATH)/bin/migrate)

# make does not read .env (only Compose does), so migration targets source it
# themselves and assemble the URL golang-migrate expects.
MIGRATE_ENV=set -a; [ -f .env ] && . ./.env; set +a; \
	DB_URL="postgres://$${DB_USER:-expense}:$${DB_PASSWORD:-expense}@$${DB_HOST:-localhost}:$${DB_PORT:-5433}/$${DB_NAME:-expense_tracker}?sslmode=disable"

# ---------------------------------------------------------------- application

# Build the application
build:
	@echo "Building $(BINARY_NAME)..."
	@go build -o $(BINARY_PATH) $(MAIN_PATH)
	@echo "Build complete: $(BINARY_PATH)"

# Build and run
run: build
	@./$(BINARY_PATH)

# Start the database, wait until it is healthy, then run from source
dev: db-up
	@echo "Starting server..."
	@go run $(MAIN_PATH)

# ------------------------------------------------------------------- quality

# Run tests
test:
	@echo "Running tests..."
	@go test ./...

# Run tests with verbose output
test-verbose:
	@echo "Running tests (verbose)..."
	@go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test -cover ./...
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Format code
fmt:
	@echo "Formatting code..."
	@go fmt ./...

# Run go vet
vet:
	@echo "Running go vet..."
	@go vet ./...

# Everything CI should agree with, in one target
check: fmt vet test

# ------------------------------------------------------------------ database

# Start Postgres and block until it accepts connections
db-up:
	@echo "Starting $(DB_SERVICE)..."
	@docker compose up -d --wait $(DB_SERVICE)

# Stop Postgres (the named volume, and therefore the data, survives)
db-down:
	@echo "Stopping $(DB_SERVICE)..."
	@docker compose down

# Destroy the database including its volume, then start a fresh one
db-reset:
	@echo "Resetting $(DB_SERVICE) — ALL DATA WILL BE DELETED."
	@printf "Continue? [y/N] " && read ans && [ "$$ans" = "y" ] || exit 1
	@docker compose down -v
	@docker compose up -d --wait $(DB_SERVICE)
	@echo "Database reset."

# Tail Postgres logs
db-logs:
	@docker compose logs -f $(DB_SERVICE)

# Open a psql shell inside the container.
# .env is sourced here because make does not see it — only Compose reads it
# automatically — so the credentials must come from the same file.
db-shell:
	@set -a; [ -f .env ] && . ./.env; set +a; \
	docker compose exec $(DB_SERVICE) psql -U $${DB_USER:-expense} -d $${DB_NAME:-expense_tracker}

# ---------------------------------------------------------------- migrations

# Install the golang-migrate CLI into GOPATH/bin. The postgres build tag is
# required — without it the binary has no postgres driver registered.
migrate-install:
	@echo "Installing golang-migrate..."
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "Installed: $(shell go env GOPATH)/bin/migrate"

# Fail early with a useful message instead of "no such file or directory"
guard-migrate:
	@[ -x "$(MIGRATE)" ] || command -v migrate >/dev/null 2>&1 || \
		{ echo "migrate not found — run: make migrate-install"; exit 1; }

# Create a new migration pair:  make migrate-create name=create_users
migrate-create: guard-migrate
	@[ -n "$(name)" ] || { echo "usage: make migrate-create name=create_users"; exit 1; }
	@mkdir -p $(MIGRATIONS_DIR)
	@$(MIGRATE) create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)

# Apply all pending migrations
migrate-up: guard-migrate
	@echo "Applying migrations..."
	@$(MIGRATE_ENV); $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$$DB_URL" up

# Roll back the most recent migration only
migrate-down: guard-migrate
	@echo "Rolling back one migration..."
	@$(MIGRATE_ENV); $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$$DB_URL" down 1

# Show the current schema version (and whether it is dirty)
migrate-version: guard-migrate
	@$(MIGRATE_ENV); $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$$DB_URL" version

# Clear the dirty flag after a failed migration:  make migrate-force version=1
# It does NOT run any SQL — fix the database by hand first, then force.
migrate-force: guard-migrate
	@[ -n "$(version)" ] || { echo "usage: make migrate-force version=1"; exit 1; }
	@$(MIGRATE_ENV); $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$$DB_URL" force $(version)

# Drop every table in the database
migrate-drop: guard-migrate
	@echo "This DROPS EVERY TABLE in the database."
	@printf "Continue? [y/N] " && read ans && [ "$$ans" = "y" ] || exit 1
	@$(MIGRATE_ENV); $(MIGRATE) -path $(MIGRATIONS_DIR) -database "$$DB_URL" drop -f

# --------------------------------------------------------------------- setup

# Install dependencies
install:
	@echo "Installing dependencies..."
	@go mod download
	@go mod tidy

# Create .env from the example if it does not exist yet
env:
	@if [ -f .env ]; then \
		echo ".env already exists — leaving it untouched."; \
	else \
		cp .env.example .env; \
		echo "Created .env from .env.example — review the values before running."; \
	fi

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@echo "Clean complete!"

# Default target
help:
	@echo "Available targets:"
	@echo ""
	@echo "  Application:"
	@echo "    make build         - Build the application into bin/"
	@echo "    make run           - Build and run the binary"
	@echo "    make dev           - Start the database, then run from source"
	@echo ""
	@echo "  Quality:"
	@echo "    make test          - Run tests"
	@echo "    make test-verbose  - Run tests with verbose output"
	@echo "    make test-coverage - Run tests with coverage report"
	@echo "    make fmt           - Format code"
	@echo "    make vet           - Run go vet"
	@echo "    make check         - Run fmt, vet and test"
	@echo ""
	@echo "  Database:"
	@echo "    make db-up         - Start Postgres and wait until healthy"
	@echo "    make db-down       - Stop Postgres (data is kept)"
	@echo "    make db-reset      - Delete the volume and start fresh (asks first)"
	@echo "    make db-logs       - Tail Postgres logs"
	@echo "    make db-shell      - Open a psql shell in the container"
	@echo ""
	@echo "  Migrations:"
	@echo "    make migrate-install          - Install the golang-migrate CLI"
	@echo "    make migrate-create name=xxx  - Create a new .up/.down migration pair"
	@echo "    make migrate-up               - Apply all pending migrations"
	@echo "    make migrate-down             - Roll back the most recent migration"
	@echo "    make migrate-version          - Show current schema version"
	@echo "    make migrate-force version=N  - Clear the dirty flag (runs no SQL)"
	@echo "    make migrate-drop             - Drop every table (asks first)"
	@echo ""
	@echo "  Setup:"
	@echo "    make install       - Download and tidy dependencies"
	@echo "    make env           - Create .env from .env.example"
	@echo "    make clean         - Remove build artifacts"
	@echo "    make help          - Show this help message"

.DEFAULT_GOAL := help
