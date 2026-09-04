"use client"

import * as React from "react"
import { Input } from "@repo/ui/input"
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@repo/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/drawer"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/tabs"
import { DeploymentCard } from "@/components/deployment-card"
import { DeploymentList } from "@/components/deployment-list"
import { NumberedPagination } from "@/components/numbered-pagination"
import {
  mockDeployments,
  clusters,
  projects,
  syncStatuses,
  healthStatuses,
  type SyncStatus,
  type HealthStatus,
} from "@/lib/deployments"
import {
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  PlusIcon,
} from "lucide-react"

export type SortField = "name" | "syncStatus" | "healthStatus" | "targetCluster" | "lastSyncAt"
export type SortDirection = "asc" | "desc"
export type ViewMode = "card" | "list"

const sortFieldLabels: Record<SortField, string> = {
  name: "Name",
  syncStatus: "Sync Status",
  healthStatus: "Health Status",
  targetCluster: "Cluster",
  lastSyncAt: "Last Synced",
}


export function DeploymentView() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("card")
  const [search, setSearch] = React.useState("")
  const [sortField, setSortField] = React.useState<SortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [sortOpen, setSortOpen] = React.useState(false)

  const [selectedSyncStatuses, setSelectedSyncStatuses] = React.useState<Set<SyncStatus>>(new Set())
  const [selectedHealthStatuses, setSelectedHealthStatuses] = React.useState<Set<HealthStatus>>(new Set())
  const [selectedClusters, setSelectedClusters] = React.useState<Set<string>>(new Set())
  const [selectedProjects, setSelectedProjects] = React.useState<Set<string>>(new Set())
  const activeFilterCount =
    selectedSyncStatuses.size +
    selectedHealthStatuses.size +
    selectedClusters.size +
    selectedProjects.size

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
    setSelectedClusters(new Set())
    setSelectedProjects(new Set())
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filtered = React.useMemo(() => {
    let result = mockDeployments.filter((dep) => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          dep.name.toLowerCase().includes(q) ||
          dep.namespace.toLowerCase().includes(q) ||
          dep.project.toLowerCase().includes(q) ||
          dep.components.some((c) => c.name.toLowerCase().includes(q))
        if (!matches) return false
      }
      if (selectedSyncStatuses.size > 0 && !selectedSyncStatuses.has(dep.syncStatus)) return false
      if (selectedHealthStatuses.size > 0 && !selectedHealthStatuses.has(dep.healthStatus)) return false
      if (selectedClusters.size > 0 && !selectedClusters.has(dep.targetCluster)) return false
      if (selectedProjects.size > 0 && !selectedProjects.has(dep.project)) return false
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
        case "targetCluster":
          cmp = a.targetCluster.localeCompare(b.targetCluster)
          break
        case "lastSyncAt":
          cmp = (a.lastSyncAt ?? "0").localeCompare(b.lastSyncAt ?? "0")
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })

    return result
  }, [search, sortField, sortDirection, selectedSyncStatuses, selectedHealthStatuses, selectedClusters, selectedProjects])

  React.useEffect(() => {
    setPage(0)
  }, [search, selectedSyncStatuses, selectedHealthStatuses, selectedClusters, selectedProjects, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  const quickSyncFilters: SyncStatus[] = ["Synced", "Syncing", "OutOfSync"]
  const quickHealthFilters: HealthStatus[] = ["Healthy", "Degraded"]

  const syncCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of mockDeployments) counts[d.syncStatus] = (counts[d.syncStatus] ?? 0) + 1
    return counts
  }, [])
  const healthCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of mockDeployments) counts[d.healthStatus] = (counts[d.healthStatus] ?? 0) + 1
    return counts
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, namespace, repo, project..."
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
          <PlusIcon className="size-4" />
          New Deployment
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

      {
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-card gap-2">
            <p className="text-sm text-muted-foreground">No deployments match your filters</p>
            {(activeFilterCount > 0 || search) && (
              <Button variant="outline" size="sm" onClick={() => { clearAllFilters(); setSearch("") }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {paged.map((dep) => (
              <DeploymentCard key={dep.id} deployment={dep} />
            ))}
          </div>
        ) : (
          <DeploymentList
            deployments={paged}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )
      }

      {filtered.length > 0 && (
        <NumberedPagination
          page={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <FilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        activeFilterCount={activeFilterCount}
        onClearAll={clearAllFilters}
        selectedSyncStatuses={selectedSyncStatuses}
        selectedHealthStatuses={selectedHealthStatuses}
        selectedClusters={selectedClusters}
        selectedProjects={selectedProjects}
        onToggleSyncStatus={(s) => toggleFilter(selectedSyncStatuses, s, setSelectedSyncStatuses)}
        onToggleHealthStatus={(h) => toggleFilter(selectedHealthStatuses, h, setSelectedHealthStatuses)}
        onToggleCluster={(c) => toggleFilter(selectedClusters, c, setSelectedClusters)}
        onToggleProject={(p) => toggleFilter(selectedProjects, p, setSelectedProjects)}
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
  selectedClusters,
  selectedProjects,
  onToggleSyncStatus,
  onToggleHealthStatus,
  onToggleCluster,
  onToggleProject,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  onClearAll: () => void
  selectedSyncStatuses: Set<SyncStatus>
  selectedHealthStatuses: Set<HealthStatus>
  selectedClusters: Set<string>
  selectedProjects: Set<string>
  onToggleSyncStatus: (s: SyncStatus) => void
  onToggleHealthStatus: (h: HealthStatus) => void
  onToggleCluster: (c: string) => void
  onToggleProject: (p: string) => void
}) {
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
            {syncStatuses.map((s) => (
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
            {healthStatuses.map((h) => (
              <FilterCheckbox
                key={h}
                label={h}
                checked={selectedHealthStatuses.has(h)}
                onToggle={() => onToggleHealthStatus(h)}
              />
            ))}
          </FilterGroup>

          <div className="h-px bg-border" />

          <FilterGroup label="Cluster">
            {clusters.map((c) => (
              <FilterCheckbox
                key={c}
                label={c}
                checked={selectedClusters.has(c)}
                onToggle={() => onToggleCluster(c)}
              />
            ))}
          </FilterGroup>

          <div className="h-px bg-border" />

          <FilterGroup label="Project">
            {projects.map((p) => (
              <FilterCheckbox
                key={p}
                label={p}
                checked={selectedProjects.has(p)}
                onToggle={() => onToggleProject(p)}
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
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (field: SortField) => void
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
            {(Object.keys(sortFieldLabels) as SortField[]).map((field) => (
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
