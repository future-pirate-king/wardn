package audit

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Entry struct {
	UserID       string
	Action       string
	ResourceType string
	ResourceName string
	Details      map[string]any
}

type Service struct {
	pool *pgxpool.Pool
}

func NewService(pool *pgxpool.Pool) *Service {
	return &Service{pool: pool}
}

func (s *Service) Log(ctx context.Context, entry Entry) error {
	details, err := json.Marshal(entry.Details)
	if err != nil {
		details = []byte("{}")
	}

	_, err = s.pool.Exec(ctx,
		`INSERT INTO audit_log (user_id, action, resource_type, resource_name, details_json)
		 VALUES ($1, $2, $3, $4, $5)`,
		entry.UserID, entry.Action, entry.ResourceType, entry.ResourceName, details,
	)
	if err != nil {
		return fmt.Errorf("write audit log: %w", err)
	}

	return nil
}

func (s *Service) List(ctx context.Context, limit, offset int) ([]map[string]any, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, user_id, action, resource_type, resource_name, details_json, timestamp
		 FROM audit_log ORDER BY timestamp DESC LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("query audit log: %w", err)
	}
	defer rows.Close()

	var entries []map[string]any
	for rows.Next() {
		var id, userID, action, resourceType, resourceName, timestamp string
		var detailsJSON []byte
		if err := rows.Scan(&id, &userID, &action, &resourceType, &resourceName, &detailsJSON, &timestamp); err != nil {
			return nil, fmt.Errorf("scan audit row: %w", err)
		}
		entries = append(entries, map[string]any{
			"id":            id,
			"user_id":       userID,
			"action":        action,
			"resource_type": resourceType,
			"resource_name": resourceName,
			"details":       json.RawMessage(detailsJSON),
			"timestamp":     timestamp,
		})
	}

	return entries, nil
}
