package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GitApplicationSpec defines the desired state of GitApplication.
type GitApplicationSpec struct {
	// RepoURL is the Git repository URL.
	//+kubebuilder:validation:Required
	RepoURL string `json:"repoURL"`

	// Branch is the Git branch to track.
	//+kubebuilder:validation:Required
	//+kubebuilder:default="main"
	Branch string `json:"branch"`

	// Path is the path within the repository containing manifests.
	//+kubebuilder:validation:Required
	//+kubebuilder:default="."
	Path string `json:"path"`

	// ManifestType specifies how manifests are structured.
	//+kubebuilder:validation:Enum=Raw;Helm
	//+kubebuilder:default="Raw"
	ManifestType ManifestType `json:"manifestType"`

	// Helm holds Helm-specific configuration when ManifestType is Helm.
	//+optional
	Helm *HelmConfig `json:"helm,omitempty"`

	// TargetCluster is the API server URL of the target cluster.
	// If empty, deploys to the cluster where the operator runs.
	//+optional
	TargetCluster string `json:"targetCluster,omitempty"`

	// SyncPolicy defines how syncing behaves.
	//+optional
	SyncPolicy *SyncPolicy `json:"syncPolicy,omitempty"`

	// Notifications configures alerting for sync and health events.
	//+optional
	Notifications *NotificationConfig `json:"notifications,omitempty"`

	// Webhook configures Git provider webhook triggers.
	//+optional
	Webhook *WebhookConfig `json:"webhook,omitempty"`
}

// ManifestType enumerates manifest rendering strategies.
//+kubebuilder:validation:Enum=Raw;Helm
type ManifestType string

const (
	ManifestTypeRaw  ManifestType = "Raw"
	ManifestTypeHelm ManifestType = "Helm"
)

// HelmConfig holds Helm-specific settings.
type HelmConfig struct {
	// ValuesFile is the path to a values.yaml file within the repo.
	//+optional
	ValuesFile string `json:"valuesFile,omitempty"`

	// ReleaseName is the Helm release name.
	//+optional
	ReleaseName string `json:"releaseName,omitempty"`

	// Namespace is the target namespace for Helm release.
	//+optional
	Namespace string `json:"namespace,omitempty"`

	// InlineValues is raw YAML values applied on top of ValuesFile.
	//+optional
	InlineValues string `json:"inlineValues,omitempty"`
}

// SyncPolicy controls automatic synchronization behavior.
type SyncPolicy struct {
	// Automated enables automatic syncing when Git state changes.
	//+optional
	Automated bool `json:"automated,omitempty"`

	// Prune removes resources that are no longer tracked in Git.
	//+optional
	Prune bool `json:"prune,omitempty"`

	// SelfHeal re-applies desired state if live state drifts.
	//+optional
	SelfHeal bool `json:"selfHeal,omitempty"`
}

// NotificationConfig configures event notifications.
type NotificationConfig struct {
	// Slack webhook URL for notifications.
	//+optional
	Slack *SlackConfig `json:"slack,omitempty"`

	// OnSyncSuccess triggers a notification when sync succeeds.
	//+optional
	OnSyncSuccess bool `json:"onSyncSuccess,omitempty"`

	// OnSyncFailure triggers a notification when sync fails.
	//+optional
	OnSyncFailure bool `json:"onSyncFailure,omitempty"`

	// OnHealthDegraded triggers a notification when health degrades.
	//+optional
	OnHealthDegraded bool `json:"onHealthDegraded,omitempty"`
}

// SlackConfig holds Slack notification settings.
type SlackConfig struct {
	// WebhookURL is the Slack incoming webhook URL.
	WebhookURL string `json:"webhookURL,omitempty"`
}

// WebhookConfig configures Git provider webhook integration.
type WebhookConfig struct {
	// Enabled allows webhook-triggered syncs.
	Enabled bool `json:"enabled,omitempty"`

	// SecretRef references a Secret containing the webhook secret for validation.
	//+optional
	SecretRef string `json:"secretRef,omitempty"`
}

// GitApplicationStatus defines the observed state of GitApplication.
type GitApplicationStatus struct {
	// SyncStatus is the current sync state.
	//+optional
	SyncStatus SyncStatus `json:"syncStatus,omitempty"`

	// HealthStatus is the current health state.
	//+optional
	HealthStatus HealthStatus `json:"healthStatus,omitempty"`

	// LastSyncAt is the timestamp of the last successful sync.
	//+optional
	LastSyncAt *metav1.Time `json:"lastSyncAt,omitempty"`

	// Revision is the current Git commit hash.
	//+optional
	Revision string `json:"revision,omitempty"`

	// PreviousRevisions stores recent sync revisions for rollback.
	//+optional
	PreviousRevisions []string `json:"previousRevisions,omitempty"`

	// Resources is the list of managed Kubernetes resources.
	//+optional
	Resources []ResourceStatus `json:"resources,omitempty"`

	// Conditions tracks operational conditions.
	//+optional
	Conditions []metav1.Condition `json:"conditions,omitempty"`
}

// SyncStatus enumerates sync states.
//+kubebuilder:validation:Enum=Synced;OutOfSync;Syncing;Unknown
type SyncStatus string

const (
	SyncStatusSynced    SyncStatus = "Synced"
	SyncStatusOutOfSync SyncStatus = "OutOfSync"
	SyncStatusSyncing   SyncStatus = "Syncing"
	SyncStatusUnknown   SyncStatus = "Unknown"
)

// HealthStatus enumerates health states.
//+kubebuilder:validation:Enum=Healthy;Degraded;Progressing;Missing;Unknown
type HealthStatus string

const (
	HealthStatusHealthy     HealthStatus = "Healthy"
	HealthStatusDegraded    HealthStatus = "Degraded"
	HealthStatusProgressing HealthStatus = "Progressing"
	HealthStatusMissing     HealthStatus = "Missing"
	HealthStatusUnknown     HealthStatus = "Unknown"
)

// ResourceStatus tracks the state of a single managed resource.
type ResourceStatus struct {
	// Kind is the Kubernetes resource kind.
	Kind string `json:"kind"`

	// Name is the resource name.
	Name string `json:"name"`

	// Namespace is the resource namespace.
	Namespace string `json:"namespace"`

	// SyncStatus is the sync state of this resource.
	SyncStatus SyncStatus `json:"syncStatus"`

	// HealthStatus is the health state of this resource.
	HealthStatus HealthStatus `json:"healthStatus"`

	// Message provides additional detail.
	//+optional
	Message string `json:"message,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// GitApplication is the Schema for the gitapplications API.
type GitApplication struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   GitApplicationSpec   `json:"spec,omitempty"`
	Status GitApplicationStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// GitApplicationList contains a list of GitApplication.
type GitApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []GitApplication `json:"items"`
}

func init() {
	SchemeBuilder.Register(&GitApplication{}, &GitApplicationList{})
}
