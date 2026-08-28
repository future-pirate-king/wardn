package git

import (
	"context"
	"fmt"
	"hash/fnv"
	"os"
	"path/filepath"
	"sync"

	"sigs.k8s.io/controller-runtime/pkg/log"
)

// Client handles Git operations for cloning and pulling repositories.
type Client struct {
	mu        sync.Mutex
	basePath  string
	repoPaths map[string]string
}

// NewClient creates a new Git client with a temp directory for clones.
func NewClient() *Client {
	return &Client{
		basePath:  filepath.Join(os.TempDir(), "wardn-git"),
		repoPaths: make(map[string]string),
	}
}

// CloneOrPull clones the repository if it doesn't exist, or pulls if it does.
// Returns the current commit hash (revision).
func (c *Client) CloneOrPull(ctx context.Context, repoURL, branch string) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	logger := log.FromContext(ctx)

	repoDir := c.repoPath(repoURL)
	c.repoPaths[repoURL] = repoDir

	if _, err := os.Stat(filepath.Join(repoDir, ".git")); os.IsNotExist(err) {
		logger.Info("cloning repository", "url", repoURL, "branch", branch)
		if err := runGit(ctx, "clone", "--branch", branch, "--single-branch", "--depth", "1", repoURL, repoDir); err != nil {
			return "", fmt.Errorf("failed to clone %s: %w", repoURL, err)
		}
	} else {
		logger.Info("pulling repository", "url", repoURL, "branch", branch)
		if err := runGitInDir(ctx, repoDir, "fetch", "origin", branch, "--depth", "1"); err != nil {
			return "", fmt.Errorf("failed to fetch %s: %w", repoURL, err)
		}
		if err := runGitInDir(ctx, repoDir, "checkout", branch); err != nil {
			return "", fmt.Errorf("failed to checkout %s: %w", branch, err)
		}
		if err := runGitInDir(ctx, repoDir, "reset", "--hard", fmt.Sprintf("origin/%s", branch)); err != nil {
			return "", fmt.Errorf("failed to reset %s: %w", repoURL, err)
		}
	}

	revision, err := runGitInDirOutput(ctx, repoDir, "rev-parse", "HEAD")
	if err != nil {
		return "", fmt.Errorf("failed to get revision: %w", err)
	}

	return revision, nil
}

// LocalPath returns the local filesystem path for a cloned repository.
func (c *Client) LocalPath(repoURL string) string {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.repoPaths[repoURL]
}

func (c *Client) repoPath(repoURL string) string {
	hash := simpleHash(repoURL)
	return filepath.Join(c.basePath, hash)
}

func simpleHash(s string) string {
	h := fnv.New32a()
	h.Write([]byte(s))
	return fmt.Sprintf("%x", h.Sum32())
}
