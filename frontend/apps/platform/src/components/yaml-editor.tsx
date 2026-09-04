"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Button } from "@repo/ui/button"
import {
  GitCompareIcon,
  EyeIcon,
} from "lucide-react"

const Editor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading diff editor...</p>
      </div>
    ),
  },
)

type ViewMode = "manifest" | "diff"

export function YamlEditor({
  manifest,
  liveManifest,
  readOnly = true,
}: {
  manifest: string
  liveManifest?: string
  readOnly?: boolean
}) {
  const [mode, setMode] = useState<ViewMode>(
    liveManifest ? "diff" : "manifest",
  )

  const hasDiff = !!liveManifest

  return (
    <div className="flex flex-col h-full gap-3">
      {hasDiff && (
        <div className="flex items-center gap-2">
          <Button
            variant={mode === "diff" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("diff")}
          >
            <GitCompareIcon className="size-3.5" />
            Diff
          </Button>
          <Button
            variant={mode === "manifest" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("manifest")}
          >
            <EyeIcon className="size-3.5" />
            Manifest
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-0 rounded-xl border border-border overflow-hidden">
        {mode === "diff" && hasDiff ? (
          <DiffEditor
            original={liveManifest}
            modified={manifest}
            language="yaml"
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <Editor
            value={manifest}
            language="yaml"
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              tabSize: 2,
            }}
          />
        )}
      </div>
    </div>
  )
}
