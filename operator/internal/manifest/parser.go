package manifest

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	cdwardnv1alpha1 "github.com/wardn/wardn/operator/api/v1alpha1"
)

// Resource represents a single Kubernetes resource parsed from manifests.
type Resource struct {
	Kind       string
	Name       string
	Namespace  string
	APIVersion string
	Content    string
}

// Parser parses Kubernetes manifests from a directory.
type Parser struct{}

// NewParser creates a new manifest parser.
func NewParser() *Parser {
	return &Parser{}
}

// Parse reads manifests from the given path and returns parsed resources.
// Depending on manifestType, it either reads raw YAML files or renders Helm charts.
func (p *Parser) Parse(ctx context.Context, repoPath, subPath string, manifestType cdwardnv1alpha1.ManifestType, helmCfg *cdwardnv1alpha1.HelmConfig) ([]Resource, error) {
	fullPath := filepath.Join(repoPath, subPath)

	switch manifestType {
	case cdwardnv1alpha1.ManifestTypeHelm:
		return p.parseHelm(ctx, fullPath, helmCfg)
	default:
		return p.parseRaw(ctx, fullPath)
	}
}

func (p *Parser) parseRaw(ctx context.Context, dir string) ([]Resource, error) {
	var resources []Resource

	err := filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		ext := strings.ToLower(filepath.Ext(path))
		if ext != ".yaml" && ext != ".yml" && ext != ".json" {
			return nil
		}

		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to read %s: %w", path, err)
		}

		parsed, err := parseYAMLDocuments(string(content))
		if err != nil {
			return fmt.Errorf("failed to parse %s: %w", path, err)
		}

		resources = append(resources, parsed...)
		return nil
	})

	if err != nil {
		return nil, err
	}

	return resources, nil
}

func (p *Parser) parseHelm(ctx context.Context, dir string, helmCfg *cdwardnv1alpha1.HelmConfig) ([]Resource, error) {
	// TODO: Implement Helm template rendering using the Helm Go SDK.
	// For now, return an error indicating Helm support is not yet implemented.
	return nil, fmt.Errorf("helm rendering not yet implemented")
}

func parseYAMLDocuments(content string) ([]Resource, error) {
	var resources []Resource

	docs := strings.Split(content, "\n---")
	for _, doc := range docs {
		doc = strings.TrimSpace(doc)
		if doc == "" {
			continue
		}

		res := extractResourceMeta(doc)
		if res.Kind == "" {
			continue
		}
		res.Content = doc
		resources = append(resources, res)
	}

	return resources, nil
}

func extractResourceMeta(content string) Resource {
	var res Resource
	for _, line := range strings.Split(content, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "apiVersion:") {
			res.APIVersion = strings.TrimSpace(strings.TrimPrefix(line, "apiVersion:"))
		}
		if strings.HasPrefix(line, "kind:") {
			res.Kind = strings.TrimSpace(strings.TrimPrefix(line, "kind:"))
		}
		if strings.HasPrefix(line, "name:") {
			res.Name = strings.TrimSpace(strings.TrimPrefix(line, "name:"))
		}
		if strings.HasPrefix(line, "namespace:") {
			res.Namespace = strings.TrimSpace(strings.TrimPrefix(line, "namespace:"))
		}
	}
	return res
}
