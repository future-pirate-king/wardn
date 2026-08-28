package webhook

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"sigs.k8s.io/controller-runtime/pkg/client"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
)

// NewServer starts an HTTP server for Git provider webhook events.
func NewServer(k8sClient client.Client, addr string) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/webhook/github", handleGitHub(k8sClient))
	mux.HandleFunc("/webhook/gitlab", handleGitLab(k8sClient))

	srv := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	slog.Info("webhook server listening", "address", addr)
	return srv.ListenAndServe()
}

func handleGitHub(k8sClient client.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// TODO: Validate GitHub webhook signature using secret from SecretRef.
		// For now, just parse the payload and trigger reconciliation.

		var payload struct {
			Repository struct {
				CloneURL string `json:"clone_url"`
			} `json:"repository"`
			Ref string `json:"ref"`
		}

		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}

		branch := strings.TrimPrefix(payload.Ref, "refs/heads/")

		// Find GitApplications matching this repo and branch.
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var apps cdwardnv1alpha1.GitApplicationList
		if err := k8sClient.List(ctx, &apps); err != nil {
			http.Error(w, "internal error", http.StatusInternalServerError)
			return
		}

		matched := 0
		for _, app := range apps.Items {
			if app.Spec.RepoURL == payload.Repository.CloneURL && app.Spec.Branch == branch {
				// Trigger reconciliation by updating an annotation.
				if app.Annotations == nil {
					app.Annotations = make(map[string]string)
				}
				app.Annotations["wardn.space/webhook-trigger"] = time.Now().Format(time.RFC3339)
				if err := k8sClient.Update(ctx, &app); err != nil {
					slog.ErrorContext(ctx, "failed to update GitApplication annotation", "name", app.Name, "error", err)
					continue
				}
				matched++
			}
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"matched": %d}`, matched)
	}
}

func handleGitLab(k8sClient client.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// TODO: Validate GitLab webhook token.
		// Parse GitLab push event payload and trigger reconciliation.

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status": "ok"}`)
	}
}
