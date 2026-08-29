package api

import (
	"encoding/json"
	"net/http"
)

type projectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *Handlers) ListProjects(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Pool.Query(r.Context(),
		`SELECT id, name, description, created_at FROM projects ORDER BY created_at DESC`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list projects")
		return
	}
	defer rows.Close()

	var projects []map[string]any
	for rows.Next() {
		var id, name, description, createdAt string
		if err := rows.Scan(&id, &name, &description, &createdAt); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan project")
			return
		}
		projects = append(projects, map[string]any{
			"id":          id,
			"name":        name,
			"description": description,
			"created_at":  createdAt,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{"projects": projects})
}

func (h *Handlers) CreateProject(w http.ResponseWriter, r *http.Request) {
	var req projectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	var id string
	err := h.Pool.QueryRow(r.Context(),
		`INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id`,
		req.Name, req.Description,
	).Scan(&id)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":          id,
		"name":        req.Name,
		"description": req.Description,
	})
}

func (h *Handlers) GetProject(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement with chi.URLParam for id
	writeJSON(w, http.StatusOK, map[string]string{"status": "not implemented"})
}
