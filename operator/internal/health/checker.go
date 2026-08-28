package health

import (
	"context"

	"sigs.k8s.io/controller-runtime/pkg/client"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
	"github.com/wardn/wardn/operator/internal/manifest"
)

// Checker checks the health of deployed Kubernetes resources.
type Checker struct {
	client client.Client
}

// NewChecker creates a new health checker.
func NewChecker(c client.Client) *Checker {
	return &Checker{client: c}
}

// Check evaluates the health of all resources and returns an aggregate health status
// along with per-resource health statuses.
func (c *Checker) Check(ctx context.Context, app *cdwardnv1alpha1.GitApplication, resources []manifest.Resource) (cdwardnv1alpha1.HealthStatus, []cdwardnv1alpha1.ResourceStatus) {
	var statuses []cdwardnv1alpha1.ResourceStatus
	aggregate := cdwardnv1alpha1.HealthStatusHealthy

	for _, res := range resources {
		rs := cdwardnv1alpha1.ResourceStatus{
			Kind:         res.Kind,
			Name:         res.Name,
			Namespace:    res.Namespace,
			HealthStatus: cdwardnv1alpha1.HealthStatusHealthy,
		}

		// TODO: Implement actual health checks per resource kind.
		// - Deployment: check available replicas
		// - StatefulSet: check ready replicas
		// - Service: check endpoints exist
		// - Job: check completion
		// etc.

		if rs.HealthStatus == cdwardnv1alpha1.HealthStatusDegraded {
			aggregate = cdwardnv1alpha1.HealthStatusDegraded
		} else if rs.HealthStatus == cdwardnv1alpha1.HealthStatusProgressing && aggregate != cdwardnv1alpha1.HealthStatusDegraded {
			aggregate = cdwardnv1alpha1.HealthStatusProgressing
		}

		statuses = append(statuses, rs)
	}

	return aggregate, statuses
}
