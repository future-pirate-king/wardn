package rbac

import (
	"context"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Role string

const (
	RoleRead  Role = "read"
	RoleSync  Role = "sync"
	RoleAdmin Role = "admin"
)

type Service struct {
	pool *pgxpool.Pool
}

func NewService(pool *pgxpool.Pool) *Service {
	return &Service{pool: pool}
}

func (s *Service) GetUserRole(ctx context.Context, userID, projectID string) (Role, error) {
	var role string
	err := s.pool.QueryRow(ctx,
		`SELECT role FROM project_users WHERE user_id = $1 AND project_id = $2`,
		userID, projectID,
	).Scan(&role)

	if err != nil {
		return RoleRead, fmt.Errorf("get user role: %w", err)
	}

	return Role(role), nil
}

func (s *Service) RequireRole(minRole Role) func(http.Handler) http.Handler {
	roleLevel := func(r Role) int {
		switch r {
		case RoleRead:
			return 1
		case RoleSync:
			return 2
		case RoleAdmin:
			return 3
		default:
			return 0
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID := getUserID(r.Context())
			if userID == "" {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			projectID := r.URL.Query().Get("project_id")
			if projectID == "" {
				http.Error(w, `{"error":"project_id required"}`, http.StatusBadRequest)
				return
			}

			role, err := s.GetUserRole(r.Context(), userID, projectID)
			if err != nil {
				http.Error(w, `{"error":"forbidden"}`, http.StatusForbidden)
				return
			}

			if roleLevel(role) < roleLevel(minRole) {
				http.Error(w, `{"error":"insufficient permissions"}`, http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

type contextKey string

const userIDKey contextKey = "user_id"

func getUserID(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
