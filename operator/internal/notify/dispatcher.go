package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
)

// Dispatcher sends notifications for sync and health events.
type Dispatcher struct {
	httpClient *http.Client
}

// NewDispatcher creates a new notification dispatcher.
func NewDispatcher() *Dispatcher {
	return &Dispatcher{
		httpClient: &http.Client{},
	}
}

// Dispatch sends notifications based on the app's notification config.
func (d *Dispatcher) Dispatch(ctx context.Context, app *cdwardnv1alpha1.GitApplication, syncSuccess bool, syncErr error) {
	cfg := app.Spec.Notifications
	if cfg == nil {
		return
	}

	if syncSuccess && cfg.OnSyncSuccess {
		d.sendSlack(ctx, cfg.Slack, fmt.Sprintf("✅ Sync succeeded for %s (revision: %s)", app.Name, app.Status.Revision))
	}

	if !syncSuccess && cfg.OnSyncFailure {
		msg := fmt.Sprintf("❌ Sync failed for %s: %v", app.Name, syncErr)
		d.sendSlack(ctx, cfg.Slack, msg)
	}
}

func (d *Dispatcher) sendSlack(ctx context.Context, cfg *cdwardnv1alpha1.SlackConfig, message string) {
	if cfg == nil || cfg.WebhookURL == "" {
		return
	}

	payload := map[string]string{
		"text": message,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(ctx, "POST", cfg.WebhookURL, bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := d.httpClient.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
}
