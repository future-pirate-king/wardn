"use client"

import * as React from "react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/drawer"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { ComponentCard } from "@/components/component-card"
import { ComponentList } from "@/components/component-list"
import type { Deployment } from "@/lib/deployments"
import type { SyncStatus, HealthStatus } from "@/lib/deployments"
import {
  SearchIcon,
  XIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  RefreshCwIcon,
  LayoutGridIcon,
  ListIcon,
} from "lucide-react"

type ComponentSortField = "name" | "syncStatus" | "healthStatus" | "lastSyncAt"
type SortDirection = "asc" | "desc"
type ViewMode = "card" | "list"

const sortFieldLabels: Record<ComponentSortField, string> = {
  name: "Name",
  syncStatus: "Sync Status",
  healthStatus: "Health Status",
  lastSyncAt: "Last Synced",
}

const quickFilterUnselected: Record<string, string> = {
  green: "bg-green-500/10 text-green-700 dark:text-green-400 border-transparent hover:bg-green-500/20",
  red: "bg-red-500/10 text-red-700 dark:text-red-400 border-transparent hover:bg-red-500/20",
  yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-transparent hover:bg-yellow-500/20",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-transparent hover:bg-blue-500/20",
}

const quickFilterSelected: Record<string, string> = {
  green: "bg-green-500 text-white border-green-500",
  red: "bg-red-500 text-white border-red-500",
  yellow: "bg-yellow-500 text-white border-yellow-500",
  blue: "bg-blue-500 text-white border-blue-500",
}

function QuickFilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string
  count: number
  color: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex h-8 items-center gap-1.5 rounded-4xl px-3 py-1 text-sm font-medium transition-colors border " +
        (active
          ? quickFilterSelected[color] ?? quickFilterSelected.green
          : "font-light " + (quickFilterUnselected[color] ?? quickFilterUnselected.green))
      }
    >
      <span>{count}</span>
      <span>{label}</span>
    </button>
  )
}

function FilterCheckbox({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted transition-colors w-full text-left"
    >
      <span className={
        "flex size-4 shrink-0 items-center justify-center rounded-md border transition-colors " +
        (checked ? "bg-primary border-primary text-primary-foreground" : "border-border")
      }>
        {checked && <CheckIcon className="size-3" />}
      </span>
      <span className={checked ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground px-2 pt-2 pb-1">{label}</span>
      {children}
    </div>
  )
}

function FilterDrawer({
  open,
  onOpenChange,
  activeFilterCount,
  onClearAll,
  selectedSyncStatuses,
  selectedHealthStatuses,
  onToggleSyncStatus,
  onToggleHealthStatus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  onClearAll: () => void
  selectedSyncStatuses: Set<SyncStatus>
  selectedHealthStatuses: Set<HealthStatus>
  onToggleSyncStatus: (s: SyncStatus) => void
  onToggleHealthStatus: (h: HealthStatus) => void
}) {
  const allSyncStatuses: SyncStatus[] = ["Synced", "Syncing", "OutOfSync", "Unknown"]
  const allHealthStatuses: HealthStatus[] = ["Healthy", "Degraded", "Progressing", "Missing", "Unknown"]
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="sm:max-w-md border-border">
        <DrawerHeader className="px-6 py-0 h-14 flex-row items-center justify-between border-b border-border">
          <DrawerTitle>Filters</DrawerTitle>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear ({activeFilterCount})
            </Button>
          )}
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-6 py-3 flex-1 overflow-y-auto">
          <FilterGroup label="Sync Status">
            {allSyncStatuses.map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={selectedSyncStatuses.has(s)}
                onToggle={() => onToggleSyncStatus(s)}
              />
            ))}
          </FilterGroup>

          <div className="h-px bg-border" />

          <FilterGroup label="Health Status">
            {allHealthStatuses.map((h) => (
              <FilterCheckbox
                key={h}
                label={h}
                checked={selectedHealthStatuses.has(h)}
                onToggle={() => onToggleHealthStatus(h)}
              />
            ))}
          </FilterGroup>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SortDrawer({
  open,
  onOpenChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sortField: ComponentSortField
  sortDirection: SortDirection
  onSortFieldChange: (field: ComponentSortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="sm:max-w-sm border-border">
        <DrawerHeader className="px-6 py-0 h-14 flex-row items-center justify-between border-b border-border">
          <DrawerTitle>Sort</DrawerTitle>
          <Button variant="outline" size="sm" onClick={() => { onSortFieldChange("name"); onSortDirectionChange("asc") }}>
            Reset
          </Button>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-6 py-3 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground px-2 pb-1">Sort by</span>
            {(Object.keys(sortFieldLabels) as ComponentSortField[]).map((field) => (
              <button
                key={field}
                onClick={() => onSortFieldChange(field)}
                className={
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors " +
                  (sortField === field
                    ? "bg-primary/10 text-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground")
                }
              >
                {sortFieldLabels[field]}
                {sortField === field && <CheckIcon className="size-4" />}
              </button>
            ))}
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground px-2 pb-1">Direction</span>
            <button
              onClick={() => onSortDirectionChange("asc")}
              className={
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors " +
                (sortDirection === "asc"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "hover:bg-muted text-muted-foreground")
              }
            >
              <ArrowUpIcon className="size-4" />
              Ascending
              {sortDirection === "asc" && <CheckIcon className="size-4 ml-auto" />}
            </button>
            <button
              onClick={() => onSortDirectionChange("desc")}
              className={
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors " +
                (sortDirection === "desc"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "hover:bg-muted text-muted-foreground")
              }
            >
              <ArrowDownIcon className="size-4" />
              Descending
              {sortDirection === "desc" && <CheckIcon className="size-4 ml-auto" />}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export function DeploymentDetail({
  deployment,
}: {
  deployment: Deployment
}) {
  const [search, setSearch] = React.useState("")
  const [viewMode, setViewMode] = React.useState<ViewMode>("card")
  const [sortField, setSortField] = React.useState<ComponentSortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [sortOpen, setSortOpen] = React.useState(false)
  const [selectedSyncStatuses, setSelectedSyncStatuses] = React.useState<Set<SyncStatus>>(new Set())
  const [selectedHealthStatuses, setSelectedHealthStatuses] = React.useState<Set<HealthStatus>>(new Set())

  const activeFilterCount = selectedSyncStatuses.size + selectedHealthStatuses.size

  const toggleFilter = <T,>(set: Set<T>, value: T, setter: React.Dispatch<React.SetStateAction<Set<T>>>) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedSyncStatuses(new Set())
    setSelectedHealthStatuses(new Set())
  }

  const quickSyncFilters: SyncStatus[] = ["Synced", "Syncing", "OutOfSync"]
  const quickHealthFilters: HealthStatus[] = ["Healthy", "Degraded"]

  const syncCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of deployment.components) counts[c.syncStatus] = (counts[c.syncStatus] ?? 0) + 1
    return counts
  }, [deployment.components])
  const healthCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of deployment.components) counts[c.healthStatus] = (counts[c.healthStatus] ?? 0) + 1
    return counts
  }, [deployment.components])

  const filtered = React.useMemo(() => {
    let result = deployment.components.filter((comp) => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          comp.name.toLowerCase().includes(q) ||
          comp.namespace.toLowerCase().includes(q) ||
          comp.branch.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (selectedSyncStatuses.size > 0 && !selectedSyncStatuses.has(comp.syncStatus)) return false
      if (selectedHealthStatuses.size > 0 && !selectedHealthStatuses.has(comp.healthStatus)) return false
      return true
    })

    const syncOrder: Record<string, number> = { Synced: 0, Syncing: 1, OutOfSync: 2, Unknown: 3 }
    const healthOrder: Record<string, number> = { Healthy: 0, Progressing: 1, Degraded: 2, Missing: 3, Unknown: 4 }

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "syncStatus":
          cmp = (syncOrder[a.syncStatus] ?? 99) - (syncOrder[b.syncStatus] ?? 99)
          break
        case "healthStatus":
          cmp = (healthOrder[a.healthStatus] ?? 99) - (healthOrder[b.healthStatus] ?? 99)
          break
        case "lastSyncAt":
          cmp = (a.lastSyncAt ?? "0").localeCompare(b.lastSyncAt ?? "0")
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })

    return result
  }, [deployment.components, search, sortField, sortDirection, selectedSyncStatuses, selectedHealthStatuses])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search components by name, namespace, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-muted text-muted-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>

        <Button size="sm">
          <RefreshCwIcon className="size-3.5" />
          Sync All
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {quickSyncFilters.map((s) => (
            <QuickFilterChip
              key={s}
              label={s}
              count={syncCounts[s] ?? 0}
              color={s === "Synced" ? "green" : s === "Syncing" ? "blue" : "yellow"}
              active={selectedSyncStatuses.has(s)}
              onClick={() => toggleFilter(selectedSyncStatuses, s, setSelectedSyncStatuses)}
            />
          ))}
          {quickHealthFilters.map((h) => (
            <QuickFilterChip
              key={h}
              label={h}
              count={healthCounts[h] ?? 0}
              color={h === "Healthy" ? "green" : "red"}
              active={selectedHealthStatuses.has(h)}
              onClick={() => toggleFilter(selectedHealthStatuses, h, setSelectedHealthStatuses)}
            />
          ))}

          <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
            <FilterIcon className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setSortOpen(true)}>
            <ArrowUpDownIcon className="size-4" />
            Sort
          </Button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="card">
              <LayoutGridIcon className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="size-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-card gap-2">
          <p className="text-sm text-muted-foreground">No components match your filters</p>
          {(activeFilterCount > 0 || search) && (
            <Button variant="outline" size="sm" onClick={() => { clearAllFilters(); setSearch("") }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => (
            <ComponentCard
              key={comp.id}
              component={comp}
              deploymentId={deployment.id}
            />
          ))}
        </div>
      ) : (
        <ComponentList
          components={filtered}
          deploymentId={deployment.id}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={(field) => {
            if (sortField === field) {
              setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
            } else {
              setSortField(field)
              setSortDirection("asc")
            }
          }}
        />
      )}

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        activeFilterCount={activeFilterCount}
        onClearAll={clearAllFilters}
        selectedSyncStatuses={selectedSyncStatuses}
        selectedHealthStatuses={selectedHealthStatuses}
        onToggleSyncStatus={(s) => toggleFilter(selectedSyncStatuses, s, setSelectedSyncStatuses)}
        onToggleHealthStatus={(h) => toggleFilter(selectedHealthStatuses, h, setSelectedHealthStatuses)}
      />

      <SortDrawer
        open={sortOpen}
        onOpenChange={setSortOpen}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortFieldChange={(f) => { setSortField(f); setSortDirection("asc") }}
        onSortDirectionChange={setSortDirection}
      />
    </div>
  )
}
