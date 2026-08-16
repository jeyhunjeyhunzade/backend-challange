package app

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"expense-tracker-api/internal/config"
	"expense-tracker-api/internal/pkg/postgresql"
	transporthttp "expense-tracker-api/internal/transport/http"
)

const (
	// shutdownTimeout bounds how long in-flight requests get to finish once a
	// shutdown signal arrives. Past this deadline the server drops them.
	shutdownTimeout = 10 * time.Second

	// readHeaderTimeout caps how long a client may take to send request
	// headers. Without it a client can hold a connection open indefinitely
	// by trickling bytes (Slowloris).
	readHeaderTimeout = 5 * time.Second

	// readTimeout caps reading the entire request, headers plus body.
	readTimeout = 15 * time.Second

	// writeTimeout caps how long a handler has to write its response. Keep
	// this above the slowest expected handler — it is not a graceful limit,
	// the connection is simply cut.
	writeTimeout = 15 * time.Second

	// idleTimeout caps how long an idle keep-alive connection is retained.
	idleTimeout = 60 * time.Second
)

// Run is the composition root: it loads configuration, opens the shared
// infrastructure dependencies, assembles the HTTP transport, serves until a
// termination signal arrives, then drains in-flight requests before returning.
func Run() error {
	cfg, err := config.LoadConfig()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	client, err := postgresql.NewClient(postgresql.Postgres{
		Host:     cfg.DBHost,
		Port:     cfg.DBPort,
		User:     cfg.DBUser,
		Password: cfg.DBPassword,
		Database: cfg.DBName,
	})
	if err != nil {
		return fmt.Errorf("init postgres client: %w", err)
	}
	// Deferred first, so the pool closes last — after the server has drained.
	defer client.Close()

	// TODO: feature slices are constructed here as they come online, e.g.
	//   signupService := signup.New(client.DB)
	// and then handed to the router for route registration.
	router := transporthttp.NewRouter()

	addr := fmt.Sprintf(":%d", cfg.HTTPPort)
	server := &http.Server{
		Addr:              addr,
		Handler:           router,
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	// Signal delivery is armed before the server starts, so a signal arriving
	// during startup is not missed.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// ListenAndServe blocks, so it runs in its own goroutine and reports a
	// startup failure (e.g. port already in use) back over this channel.
	// Buffered so the goroutine never leaks if nobody is left to receive.
	serverErr := make(chan error, 1)
	go func() {
		log.Printf("http server listening on %s", addr)
		// Shutdown makes ListenAndServe return ErrServerClosed; that is the
		// expected path, not a failure.
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	select {
	case err := <-serverErr:
		return fmt.Errorf("http server: %w", err)
	case <-ctx.Done():
		// Stop trapping signals so a second Ctrl-C kills the process
		// immediately instead of being swallowed by a slow drain.
		stop()
		log.Printf("shutdown signal received, draining for up to %s", shutdownTimeout)
	}

	// A fresh context: ctx is already cancelled by the signal above.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("graceful shutdown: %w", err)
	}

	log.Println("shutdown complete")
	return nil
}
