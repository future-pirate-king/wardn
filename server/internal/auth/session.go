package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const sessionTTL = 24 * time.Hour

type SessionManager struct {
	rdb *redis.Client
}

func NewSessionManager(rdb *redis.Client) *SessionManager {
	return &SessionManager{rdb: rdb}
}

func (sm *SessionManager) CreateSession(ctx context.Context, userID, email string) (string, error) {
	sessionID := NewUserID()
	key := sessionKey(sessionID)

	data := fmt.Sprintf(`{"user_id":"%s","email":"%s"}`, userID, email)

	if err := sm.rdb.Set(ctx, key, data, sessionTTL).Err(); err != nil {
		return "", fmt.Errorf("create session: %w", err)
	}

	return sessionID, nil
}

func (sm *SessionManager) GetSession(ctx context.Context, sessionID string) (userID, email string, err error) {
	key := sessionKey(sessionID)
	data, err := sm.rdb.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return "", "", ErrInvalidCredentials
		}
		return "", "", fmt.Errorf("get session: %w", err)
	}

	// Simple parsing — in production use JSON unmarshal
	parts := strings.SplitN(data, "\"", -1)
	if len(parts) < 6 {
		return "", "", ErrInvalidCredentials
	}

	return parts[3], parts[7], nil
}

func (sm *SessionManager) DestroySession(ctx context.Context, sessionID string) error {
	key := sessionKey(sessionID)
	return sm.rdb.Del(ctx, key).Err()
}

func sessionKey(id string) string {
	return "session:" + id
}

func (sm *SessionManager) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		userID, _, err := sm.GetSession(r.Context(), token)
		if err != nil {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		ctx := contextWithUserID(r.Context(), userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}

	cookie, err := r.Cookie("wardn_session")
	if err == nil {
		return cookie.Value
	}

	return ""
}

type contextKey string

const userIDKey contextKey = "user_id"

func contextWithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func UserIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(userIDKey).(string); ok {
		return v
	}
	return ""
}
