package k8s

import (
	"context"
	"fmt"
	"log/slog"

	"sigs.k8s.io/controller-runtime/pkg/client"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
	"github.com/wardn/wardn/operator/internal/manifest"
)

// Applier applies Kubernetes resources to a target cluster.
type Applier struct {
	ctrlClient    client.Client
	targetCluster string
}

// NewApplier creates a new Kubernetes applier.
func NewApplier(ctrlClient client.Client, targetCluster string) *Applier {
	return &Applier{
		ctrlClient:    ctrlClient,
		targetCluster: targetCluster,
	}
}

// Apply applies the given resources to the target cluster.
// If syncPolicy has Prune enabled, it removes resources no longer tracked in Git.
func (a *Applier) Apply(ctx context.Context, resources []manifest.Resource, syncPolicy *cdwardnv1alpha1.SyncPolicy) error {
	for _, res := range resources {
		if err := a.applyResource(ctx, res); err != nil {
			return fmt.Errorf("failed to apply %s/%s: %w", res.Kind, res.Name, err)
		}
	}

	if syncPolicy != nil && syncPolicy.Prune {
		if err := a.pruneResources(ctx, resources); err != nil {
			return fmt.Errorf("failed to prune resources: %w", err)
		}
	}

	return nil
}

func (a *Applier) applyResource(ctx context.Context, res manifest.Resource) error {
	// TODO: Implement server-side apply using the dynamic client.
	// This is a placeholder that logs the intent.
	slog.InfoContext(ctx, "applying resource", "kind", res.Kind, "name", res.Name, "namespace", res.Namespace)
	return nil
}

func (a *Applier) pruneResources(ctx context.Context, desired []manifest.Resource) error {
	// TODO: Implement pruning by comparing live resources with desired set.
	return nil
}
