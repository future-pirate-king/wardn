package v1alpha1

import (
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"sigs.k8s.io/controller-runtime/pkg/scheme"
)

var (
	// GroupVersion is group version used to register these objects.
	GroupVersion = schema.GroupVersion{Group: "cd.wardn.space", Version: "v1alpha1"}

	// SchemeBuilder is used to add go types to the GroupVersionKind scheme.
	SchemeBuilder = &scheme.Builder{GroupVersion: GroupVersion}

	// AddToScheme adds the types in this group-version to the given scheme.
	AddToScheme = SchemeBuilder.AddToScheme
)

// GitApplicationKind is the kind string for GitApplication.
const GitApplicationKind = "GitApplication"

// GitApplicationSingular and GitApplicationPlural are resource naming constants.
const (
	GitApplicationSingular = "gitapplication"
	GitApplicationPlural   = "gitapplications"
)

// Kind takes an unqualified kind and returns back a Group qualified GroupKind.
func Kind(kind string) schema.GroupKind {
	return GroupVersion.WithKind(kind).GroupKind()
}

// Resource takes an unqualified resource and returns a Group qualified GroupResource.
func Resource(resource string) schema.GroupResource {
	return GroupVersion.WithResource(resource).GroupResource()
}

// QualifiedKind returns the fully qualified kind for GitApplication.
func QualifiedKind() schema.GroupVersionKind {
	return GroupVersion.WithKind(GitApplicationKind)
}

// QualifiedResource returns the fully qualified resource for GitApplication.
func QualifiedResource() schema.GroupVersionResource {
	return GroupVersion.WithResource(GitApplicationPlural)
}
