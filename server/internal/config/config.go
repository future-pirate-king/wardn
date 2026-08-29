package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	HTTPAddr string

	PostgresURL string
	RedisURL    string

	JWTSecret string

	OIDCProviderURL string
	OIDCClientID    string
	OIDCClientSecret string

	OperatorAddr string
}

func Load() (*Config, error) {
	cfg := &Config{
		HTTPAddr:         getEnv("HTTP_ADDR", ":8080"),
		PostgresURL:      getEnv("POSTGRES_URL", "postgres://wardn:wardn@localhost:5432/wardn?sslmode=disable"),
		RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:        getEnv("JWT_SECRET", ""),
		OIDCProviderURL:  getEnv("OIDC_PROVIDER_URL", ""),
		OIDCClientID:     getEnv("OIDC_CLIENT_ID", ""),
		OIDCClientSecret: getEnv("OIDC_CLIENT_SECRET", ""),
		OperatorAddr:     getEnv("OPERATOR_ADDR", "localhost:8081"),
	}

	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
