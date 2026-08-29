package api

import (
	"encoding/json"
	"net/http"
)

type clusterRequest struct {
	Name          string `json:"name"`
	ServerURL     string `json:"serverUrl"`
	KubeconfigRef string `json:"kubeconfigSecretRef"`
	Namespace     string `json:"namespace"`
}

func (h *Handlers) ListClusters(w http.ResponseWriter, r *http.Request) {
	rows, err := h.Pool.Query(r.Context(),
		`SELECT id, name, server_url, namespace, status, created_at FROM clusters ORDER BY created_at DESC`,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list clusters")
		return
	}
	defer rows.Close()

	var clusters []map[string]any
	for rows.Next() {
		var id, name, serverURL, namespace, status, createdAt string
		if err := rows.Scan(&id, &name, &serverURL, &namespace, &status, &createdAt); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to scan cluster")
			return
		}
		clusters = append(clusters, map[string]any{
			"id":         id,
			"name":       name,
			"server_url": serverURL,
			"namespace":  namespace,
			"status":     status,
			"created_at": createdAt,
		})
	}

	writeJSON(w, http.StatusOK, map[string]any{"clusters": clusters})
}

func (h *Handlers) RegisterCluster(w http.ResponseWriter, r *http.Request) {
	var req clusterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" || req.ServerURL == "" || req.KubeconfigRef == "" {
		writeError(w, http.StatusBadRequest, "name, serverUrl, and kubeconfigSecretRef are required")
		return
	}

	var id string
	err := h.Pool.QueryRow(r.Context(),
		`INSERT INTO clusters (name, server_url, kubeconfig_secret_ref, namespace)
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		req.Name, req.ServerURL, req.KubeconfigRef, req.Namespace,
	).Scan(&id)

	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to register cluster")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":                  id,
		"name":                req.Name,
		"server_url":          req.ServerURL,
		"kubeconfig_secret_ref": req.KubeconfigRef,
		"namespace":           req.Namespace,
		"status":              "registered",
	})
}
