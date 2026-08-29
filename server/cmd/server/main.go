package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/wardn/wardn/server/internal/api"
	"github.com/wardn/wardn/server/internal/audit"
	"github.com/wardn/wardn/server/internal/auth"
	"github.com/wardn/wardn/server/internal/cache"
	"github.com/wardn/wardn/server/internal/config"
	"github.com/wardn/wardn/server/internal/rbac"
	"github.com/wardn/wardn/server/internal/store"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Connect to Postgres
	db, err := store.New(ctx, cfg.PostgresURL)
	if err != nil {
		logger.Error("failed to connect to postgres", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(ctx); err != nil {
		logger.Error("failed to run migrations", "error", err)
		os.Exit(1)
	}
	logger.Info("database migrations complete")

	// Connect to Redis
	rdb, err := cache.New(ctx, cfg.RedisURL)
	if err != nil {
		logger.Error("failed to connect to redis", "error", err)
		os.Exit(1)
	}
	defer rdb.Close()

	// Initialize services
	handlers := &api.Handlers{
		Auth:    auth.NewService(db.Pool),
		Session: auth.NewSessionManager(rdb.Client),
		RBAC:    rbac.NewService(db.Pool),
		Audit:   audit.NewService(db.Pool),
		Pool:    db.Pool,
		RDB:     rdb.Client,
	}

	router := api.NewRouter(handlers)

	srv := &http.Server{
		Addr:         cfg.HTTPAddr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh

		logger.Info("shutting down server...")
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer shutdownCancel()

		if err := srv.Shutdown(shutdownCtx); err != nil {
			logger.Error("server shutdown error", "error", err)
		}
		cancel()
	}()

	logger.Info("starting wardn server", "addr", cfg.HTTPAddr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server error", "error", err)
		os.Exit(1)
	}

	fmt.Println("server stopped")
}
