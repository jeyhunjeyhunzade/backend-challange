package postgresql

import (
	"fmt"

	"github.com/jmoiron/sqlx"

	// Registers the "pgx" driver with database/sql so sqlx can open it in
	// stdlib mode.
	_ "github.com/jackc/pgx/v5/stdlib"
)

// Postgres is the connection configuration for the client. It is deliberately
// independent of internal/config so this package stays a reusable
// infrastructure adapter — the composition root maps one onto the other.
type Postgres struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
}

// Client is the database handle used by repositories. It embeds *sqlx.DB so
// callers get the full sqlx API while the concrete type stays ours to extend.
type Client struct {
	*sqlx.DB
}

// NewClient builds the DSN, opens the pool and verifies connectivity.
// sqlx.Connect pings the database, so a returned Client is ready to use.
func NewClient(cfg Postgres) (*Client, error) {
	dsn := fmt.Sprintf(
		"user=%s password=%s host=%s port=%d dbname=%s sslmode=disable",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Database,
	)

	db, err := sqlx.Connect("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("connect to postgres %s:%d/%s: %w", cfg.Host, cfg.Port, cfg.Database, err)
	}

	return &Client{DB: db}, nil
}
