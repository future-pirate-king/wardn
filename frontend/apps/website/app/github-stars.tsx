import Image from "next/image";

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/wardn/wardn", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

function formatStars(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export async function GitHubStars() {
  const stars = await getGitHubStars();

  return (
    <a
      href="https://github.com/wardn/wardn"
      className="flex items-center gap-1.5 rounded-4xl border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Image src="/github.svg" alt="GitHub" width={16} height={16} className="size-4" />
      {stars !== null ? (
        <span className="tabular-nums">{formatStars(stars)}</span>
      ) : (
        <span>Star</span>
      )}
    </a>
  );
}
