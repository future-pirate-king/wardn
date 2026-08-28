package controller

import (
	"context"
	"time"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
	"github.com/wardn/wardn/operator/internal/git"
	"github.com/wardn/wardn/operator/internal/health"
	"github.com/wardn/wardn/operator/internal/k8s"
	"github.com/wardn/wardn/operator/internal/manifest"
	"github.com/wardn/wardn/operator/internal/notify"
)

// GitApplicationReconciler reconciles a GitApplication object.
type GitApplicationReconciler struct {
	client.Client
	Scheme         *runtime.Scheme
	GitClient      *git.Client
	Parser         *manifest.Parser
	HealthChecker  *health.Checker
	Notifier       *notify.Dispatcher
}

// +kubebuilder:rbac:groups=cd.wardn.space,resources=gitapplications,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=cd.wardn.space,resources=gitapplications/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=cd.wardn.space,resources=gitapplications/finalizers,verbs=update
// +kubebuilder:rbac:groups="",resources=secrets,verbs=get;list;watch
// +kubebuilder:rbac:groups="*",resources="*",verbs=get;list;watch;create;update;patch;delete

func (r *GitApplicationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	var app cdwardnv1alpha1.GitApplication
	if err := r.Get(ctx, req.NamespacedName, &app); err != nil {
		if errors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		return ctrl.Result{}, err
	}

	logger.Info("reconciling GitApplication", "name", app.Name, "repoURL", app.Spec.RepoURL)

	// Step 1: Clone/pull the Git repository.
	revision, err := r.GitClient.CloneOrPull(ctx, app.Spec.RepoURL, app.Spec.Branch)
	if err != nil {
		r.updateStatus(ctx, &app, cdwardnv1alpha1.SyncStatusUnknown, cdwardnv1alpha1.HealthStatusUnknown, revision, nil, err)
		return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
	}

	// Step 2: Parse manifests from the specified path.
	resources, err := r.Parser.Parse(ctx, r.GitClient.LocalPath(app.Spec.RepoURL), app.Spec.Path, app.Spec.ManifestType, app.Spec.Helm)
	if err != nil {
		r.updateStatus(ctx, &app, cdwardnv1alpha1.SyncStatusOutOfSync, cdwardnv1alpha1.HealthStatusUnknown, revision, nil, err)
		return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
	}

	// Step 3: Check if sync is needed (compare revision with last synced).
	if app.Status.Revision == revision && app.Status.SyncStatus == cdwardnv1alpha1.SyncStatusSynced {
		// Revision unchanged and already synced — just check health.
		healthStatus, resourceStatuses := r.HealthChecker.Check(ctx, &app, resources)
		r.updateHealthStatus(ctx, &app, healthStatus, resourceStatuses)
		return ctrl.Result{RequeueAfter: 60 * time.Second}, nil
	}

	// Step 4: Determine if we should sync.
	shouldSync := (app.Spec.SyncPolicy != nil && app.Spec.SyncPolicy.Automated) ||
		app.Status.SyncStatus == "" || app.Status.SyncStatus == cdwardnv1alpha1.SyncStatusOutOfSync

	if !shouldSync {
		r.updateStatus(ctx, &app, cdwardnv1alpha1.SyncStatusOutOfSync, cdwardnv1alpha1.HealthStatusUnknown, revision, resources, nil)
		return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
	}

	// Step 5: Apply manifests to the target cluster.
	r.updateStatus(ctx, &app, cdwardnv1alpha1.SyncStatusSyncing, cdwardnv1alpha1.HealthStatusProgressing, revision, resources, nil)

	applier := k8s.NewApplier(r.Client, app.Spec.TargetCluster)
	if err := applier.Apply(ctx, resources, app.Spec.SyncPolicy); err != nil {
		r.updateStatus(ctx, &app, cdwardnv1alpha1.SyncStatusOutOfSync, cdwardnv1alpha1.HealthStatusDegraded, revision, resources, err)
		r.sendNotification(ctx, &app, false, err)
		return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
	}

	// Step 6: Check health of deployed resources.
	healthStatus, resourceStatuses := r.HealthChecker.Check(ctx, &app, resources)

	// Step 7: Update status with sync success.
	previousRevisions := app.Status.PreviousRevisions
	if len(previousRevisions) >= 10 {
		previousRevisions = previousRevisions[1:]
	}
	if app.Status.Revision != "" && app.Status.Revision != revision {
		previousRevisions = append(previousRevisions, app.Status.Revision)
	}

	now := metav1.NewTime(time.Now())
	app.Status.SyncStatus = cdwardnv1alpha1.SyncStatusSynced
	app.Status.HealthStatus = healthStatus
	app.Status.LastSyncAt = &now
	app.Status.Revision = revision
	app.Status.PreviousRevisions = previousRevisions
	app.Status.Resources = resourceStatuses

	if err := r.Status().Update(ctx, &app); err != nil {
		return ctrl.Result{}, err
	}

	r.sendNotification(ctx, &app, true, nil)

	logger.Info("reconciliation complete", "name", app.Name, "revision", revision, "sync", "Synced", "health", healthStatus)
	return ctrl.Result{RequeueAfter: 60 * time.Second}, nil
}

func (r *GitApplicationReconciler) updateStatus(ctx context.Context, app *cdwardnv1alpha1.GitApplication, sync cdwardnv1alpha1.SyncStatus, health cdwardnv1alpha1.HealthStatus, revision string, resources []manifest.Resource, syncErr error) {
	app.Status.SyncStatus = sync
	app.Status.HealthStatus = health
	app.Status.Revision = revision

	if syncErr != nil {
		app.Status.Conditions = updateCondition(app.Status.Conditions, "SyncError", "True", syncErr.Error())
	} else {
		app.Status.Conditions = updateCondition(app.Status.Conditions, "SyncError", "False", "")
	}

	if resources != nil {
		statuses := make([]cdwardnv1alpha1.ResourceStatus, len(resources))
		for i, res := range resources {
			statuses[i] = cdwardnv1alpha1.ResourceStatus{
				Kind:          res.Kind,
				Name:          res.Name,
				Namespace:     res.Namespace,
				SyncStatus:    sync,
				HealthStatus:  health,
			}
		}
		app.Status.Resources = statuses
	}

	_ = r.Status().Update(ctx, app)
}

func (r *GitApplicationReconciler) updateHealthStatus(ctx context.Context, app *cdwardnv1alpha1.GitApplication, health cdwardnv1alpha1.HealthStatus, resources []cdwardnv1alpha1.ResourceStatus) {
	app.Status.HealthStatus = health
	app.Status.Resources = resources
	_ = r.Status().Update(ctx, app)
}

func (r *GitApplicationReconciler) sendNotification(ctx context.Context, app *cdwardnv1alpha1.GitApplication, success bool, err error) {
	if app.Spec.Notifications == nil {
		return
	}
	r.Notifier.Dispatch(ctx, app, success, err)
}

func (r *GitApplicationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&cdwardnv1alpha1.GitApplication{}).
		Complete(r)
}

func updateCondition(conditions []metav1.Condition, condType, status, message string) []metav1.Condition {
	for i := range conditions {
		if conditions[i].Type == condType {
			conditions[i].Status = metav1.ConditionStatus(status)
			conditions[i].Message = message
			conditions[i].LastTransitionTime = metav1.NewTime(time.Now())
			return conditions
		}
	}
	return append(conditions, metav1.Condition{
		Type:               condType,
		Status:             metav1.ConditionStatus(status),
		Message:            message,
		LastTransitionTime: metav1.NewTime(time.Now()),
	})
}
