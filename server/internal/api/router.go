package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	"github.com/wardn/wardn/server/internal/audit"
	"github.com/wardn/wardn/server/internal/auth"
	"github.com/wardn/wardn/server/internal/rbac"
)

type Handlers struct {
	Auth    *auth.Service
	Session *auth.SessionManager
	RBAC    *rbac.Service
	Audit   *audit.Service
	Pool    *pgxpool.Pool
	RDB     *redis.Client
}

func NewRouter(h *Handlers) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.Health)

		r.Post("/auth/register", h.Register)
		r.Post("/auth/login", h.Login)
		r.Post("/auth/logout", h.Logout)
		r.Get("/auth/me", h.Session.Middleware(http.HandlerFunc(h.Me)).ServeHTTP)

		r.Group(func(r chi.Router) {
			r.Use(h.Session.Middleware)

			r.Get("/apps", h.ListApps)
			r.Get("/apps/{namespace}/{name}", h.GetApp)
			r.Post("/apps/{namespace}/{name}/sync", h.SyncApp)
			r.Get("/apps/{namespace}/{name}/history", h.AppHistory)

			r.Get("/projects", h.ListProjects)
			r.Post("/projects", h.CreateProject)
			r.Get("/projects/{id}", h.GetProject)

			r.Get("/clusters", h.ListClusters)
			r.Post("/clusters", h.RegisterCluster)

			r.Get("/audit", h.ListAudit)
		})
	})

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
