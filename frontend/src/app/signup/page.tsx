"use client"

import { SignupForm } from "@/components/signup-form"
import { AuroraBackground } from "@/components/aurora-background"
import { RocketIcon } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <RocketIcon className="size-5" />
            Wardn
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <AuroraBackground />
      </div>
    </div>
  )
}
