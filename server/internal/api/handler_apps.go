package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type appResponse struct {
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
	SyncStatus string `json:"syncStatus"`
	Health     string `json:"health"`
	Revision   string `json:"revision"`
}

func (h *Handlers) ListApps(w http.ResponseWriter, r *http.Request) {
	// TODO: Query GitApplication CRs from the cluster via operator client
	writeJSON(w, http.StatusOK, map[string]any{
		"apps": []appResponse{},
	})
}

func (h *Handlers) GetApp(w http.ResponseWriter, r *http.Request) {
	namespace := chi.URLParam(r, "namespace")
	name := chi.URLParam(r, "name")

	// TODO: Fetch GitApplication CR from the cluster
	writeJSON(w, http.StatusOK, map[string]any{
		"name":      name,
		"namespace": namespace,
		"status":    "not implemented",
	})
}

func (h *Handlers) SyncApp(w http.ResponseWriter, r *http.Request) {
	namespace := chi.URLParam(r, "namespace")
	name := chi.URLParam(r, "name")

	// TODO: Trigger sync via operator gRPC/REST call
	writeJSON(w, http.StatusAccepted, map[string]any{
		"message":   "sync triggered",
		"name":      name,
		"namespace": namespace,
	})
}

func (h *Handlers) AppHistory(w http.ResponseWriter, r *http.Request) {
	namespace := chi.URLParam(r, "namespace")
	name := chi.URLParam(r, "name")

	// TODO: Query sync_history table
	writeJSON(w, http.StatusOK, map[string]any{
		"name":      name,
		"namespace": namespace,
		"history":   []any{},
	})
}
