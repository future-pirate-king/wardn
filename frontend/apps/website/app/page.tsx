import { RocketIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { AuroraBackground } from "@repo/ui/aurora-background";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <AuroraBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-medium">
            <RocketIcon className="size-5" />
            Wardn
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a href="https://docs.wardn.space" className="text-muted-foreground hover:text-foreground transition-colors">Docs</a>
            <Button size="sm" variant="ghost" nativeButton={false} render={<a href="https://platform.wardn.space/login" />}>
              Login
            </Button>
            <Button size="sm" nativeButton={false} render={<a href="https://platform.wardn.space/signup" />}>
              Sign Up
            </Button>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex flex-col items-center gap-6 max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              GitOps CD, simplified.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Wardn is a GitOps continuous delivery operator for Kubernetes.
              Simpler to set up, simpler to maintain.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" nativeButton={false} render={<a href="https://platform.wardn.space" />}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" nativeButton={false} render={<a href="https://docs.wardn.space" />}>
                Read the Docs
              </Button>
            </div>
          </div>
        </main>

        <footer className="px-6 py-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Wardn. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
