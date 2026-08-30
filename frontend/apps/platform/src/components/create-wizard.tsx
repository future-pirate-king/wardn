"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  PlusIcon,
  ServerIcon,
  GitBranchIcon,
  RefreshCwIcon,
  KeyRoundIcon,
  CheckIcon,
  ChevronRightIcon,
} from "lucide-react"

const steps = [
  { id: 1, title: "Target", description: "Pick cluster & deployment", icon: ServerIcon },
  { id: 2, title: "Source", description: "Connect your repository", icon: GitBranchIcon },
  { id: 3, title: "Sync Policy", description: "Automated or manual", icon: RefreshCwIcon },
  { id: 4, title: "Secrets", description: "How secrets are managed", icon: KeyRoundIcon },
]

export function CreateWizard() {
  const { isMobile, state } = useSidebar()
  const [open, setOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (!value) {
      setCurrentStep(1)
    }
  }

  const button = (
    <Button
      className="w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      onClick={() => setOpen(true)}
    >
      <PlusIcon />
      <span className="group-data-[collapsible=icon]:hidden">Create</span>
    </Button>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {state === "collapsed" && !isMobile ? (
          <Tooltip>
            <TooltipTrigger render={button} />
            <TooltipContent side="right">Create</TooltipContent>
          </Tooltip>
        ) : (
          button
        )}
      </SidebarMenuItem>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
            <DialogDescription>
              Deploy a new application to your cluster. Follow the steps below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1 py-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isComplete = currentStep > step.id
              const isCurrent = currentStep === step.id
              const isLast = index === steps.length - 1
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={
                        "flex size-8 items-center justify-center rounded-full border-2 transition-colors " +
                        (isComplete
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground")
                      }
                    >
                      {isComplete ? (
                        <CheckIcon className="size-4" />
                      ) : (
                        <StepIcon className="size-4" />
                      )}
                    </div>
                    <span
                      className={
                        "text-xs " +
                        (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")
                      }
                    >
                      {step.title}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={
                        "h-0.5 flex-1 rounded-full transition-colors " +
                        (isComplete ? "bg-primary" : "bg-border")
                      }
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <div className="min-h-[200px] rounded-lg border border-border bg-muted/30 p-4">
            {currentStep === 1 && <StepTarget />}
            {currentStep === 2 && <StepSource />}
            {currentStep === 3 && <StepSyncPolicy />}
            {currentStep === 4 && <StepSecrets />}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Step {currentStep} of {steps.length}
              </span>
              {currentStep < steps.length ? (
                <Button
                  size="sm"
                  onClick={() => setCurrentStep((s) => Math.min(steps.length, s + 1))}
                >
                  Next
                  <ChevronRightIcon className="size-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => handleOpenChange(false)}>
                  <CheckIcon className="size-4" />
                  Create Application
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  )
}

function StepTarget() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Cluster</label>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
          <option>prod-cluster (us-east-1)</option>
          <option>staging-cluster (us-east-1)</option>
          <option>prod-cluster-eu (eu-west-1)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Deployment</label>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
          <option>checkout-service (namespace: checkout)</option>
          <option>catalog-service (namespace: catalog)</option>
          <option>Create new deployment...</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        Choose where your application will be deployed. You can create a new deployment if needed.
      </p>
    </div>
  )
}

function StepSource() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Repository URL</label>
        <input
          type="text"
          placeholder="https://github.com/acme/checkout"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Branch</label>
          <input
            type="text"
            placeholder="main"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Path</label>
          <input
            type="text"
            placeholder="/services/api-gateway"
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        The repository must be accessible with your configured credentials.
      </p>
    </div>
  )
}

function StepSyncPolicy() {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="sync-policy" defaultChecked className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">Automated</p>
          <p className="text-xs text-muted-foreground">
            Automatically sync when new commits are pushed. Includes prune and self-heal.
          </p>
        </div>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="sync-policy" className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">Manual</p>
          <p className="text-xs text-muted-foreground">
            Only sync when manually triggered. You retain full control over when changes are applied.
          </p>
        </div>
      </label>
    </div>
  )
}

function StepSecrets() {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="secrets" defaultChecked className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">No secrets needed</p>
          <p className="text-xs text-muted-foreground">
            This application does not require any secret management.
          </p>
        </div>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="secrets" className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">SOPS-encrypted files in repo</p>
          <p className="text-xs text-muted-foreground">
            Decrypt at apply time using AWS KMS, GCP KMS, age, or Vault Transit.
          </p>
        </div>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="secrets" className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">External Secrets Operator</p>
          <p className="text-xs text-muted-foreground">
            Use ESO to sync secrets from Vault, AWS SM, GCP SM, and more.
          </p>
        </div>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
        <input type="radio" name="secrets" className="mt-0.5" />
        <div>
          <p className="text-sm font-medium">Plain Kubernetes Secrets</p>
          <p className="text-xs text-muted-foreground">
            Use existing Kubernetes Secrets in the target namespace.
          </p>
        </div>
      </label>
    </div>
  )
}
