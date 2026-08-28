"use client";

import { SignupForm } from "@/components/signup-form";
import { AuroraBackground } from "@repo/ui/aurora-background";
import { RocketIcon } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh">
      <div className="relative hidden flex-1 lg:flex">
        <AuroraBackground />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2 font-medium text-lg">
            <RocketIcon className="size-6" />
            Wardn
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Start deploying with GitOps.
            </h1>
            <p className="text-lg text-muted-foreground">
              Create an account to manage your Kubernetes deployments through Git.
              Free for open source projects.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Open Source GitOps CD
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-6 py-12">
        <div className="flex items-center justify-center gap-2 font-medium lg:hidden mb-8">
          <RocketIcon className="size-5" />
          Wardn
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
