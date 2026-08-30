"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
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
  manifestTypes,
  syncPolicyTypes,
  type SyncStatus,
  type HealthStatus,
  type ManifestType,
  type SyncPolicyType,
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
} from "lucide-react"

export type SortField = "name" | "namespace" | "syncStatus" | "healthStatus" | "targetCluster" | "lastSyncAt"
export type SortDirection = "asc" | "desc"
export type ViewMode = "card" | "list"

const sortFieldLabels: Record<SortField, string> = {
  name: "Name",
  namespace: "Namespace",
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
  const [selectedManifestTypes, setSelectedManifestTypes] = React.useState<Set<ManifestType>>(new Set())
  const [selectedSyncPolicies, setSelectedSyncPolicies] = React.useState<Set<SyncPolicyType>>(new Set())

  const activeFilterCount =
    selectedSyncStatuses.size +
    selectedHealthStatuses.size +
    selectedClusters.size +
    selectedProjects.size +
    selectedManifestTypes.size +
    selectedSyncPolicies.size

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
    setSelectedManifestTypes(new Set())
    setSelectedSyncPolicies(new Set())
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
          dep.repoURL.toLowerCase().includes(q) ||
          dep.project.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (selectedSyncStatuses.size > 0 && !selectedSyncStatuses.has(dep.syncStatus)) return false
      if (selectedHealthStatuses.size > 0 && !selectedHealthStatuses.has(dep.healthStatus)) return false
      if (selectedClusters.size > 0 && !selectedClusters.has(dep.targetCluster)) return false
      if (selectedProjects.size > 0 && !selectedProjects.has(dep.project)) return false
      if (selectedManifestTypes.size > 0 && !selectedManifestTypes.has(dep.manifestType)) return false
      if (selectedSyncPolicies.size > 0 && !selectedSyncPolicies.has(dep.syncPolicy)) return false
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
        case "namespace":
          cmp = a.namespace.localeCompare(b.namespace)
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
  }, [search, sortField, sortDirection, selectedSyncStatuses, selectedHealthStatuses, selectedClusters, selectedProjects, selectedManifestTypes, selectedSyncPolicies])

  React.useEffect(() => {
    setPage(0)
  }, [search, selectedSyncStatuses, selectedHealthStatuses, selectedClusters, selectedProjects, selectedManifestTypes, selectedSyncPolicies, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-3 dark:ring-1 dark:ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center gap-2">
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
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>
          <button onClick={clearAllFilters} className="text-foreground hover:underline">
            Clear all
          </button>
        </div>
      )}

      {
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-card dark:ring-1 dark:ring-foreground/10 gap-2">
            <p className="text-sm text-muted-foreground">No deployments match your filters</p>
            {(activeFilterCount > 0 || search) && (
              <Button variant="outline" size="sm" onClick={() => { clearAllFilters(); setSearch("") }}>
                Clear filters
              </Button>
            )}
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
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
        selectedManifestTypes={selectedManifestTypes}
        selectedSyncPolicies={selectedSyncPolicies}
        onToggleSyncStatus={(s) => toggleFilter(selectedSyncStatuses, s, setSelectedSyncStatuses)}
        onToggleHealthStatus={(h) => toggleFilter(selectedHealthStatuses, h, setSelectedHealthStatuses)}
        onToggleCluster={(c) => toggleFilter(selectedClusters, c, setSelectedClusters)}
        onToggleProject={(p) => toggleFilter(selectedProjects, p, setSelectedProjects)}
        onToggleManifestType={(m) => toggleFilter(selectedManifestTypes, m, setSelectedManifestTypes)}
        onToggleSyncPolicy={(sp) => toggleFilter(selectedSyncPolicies, sp, setSelectedSyncPolicies)}
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
  selectedManifestTypes,
  selectedSyncPolicies,
  onToggleSyncStatus,
  onToggleHealthStatus,
  onToggleCluster,
  onToggleProject,
  onToggleManifestType,
  onToggleSyncPolicy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  onClearAll: () => void
  selectedSyncStatuses: Set<SyncStatus>
  selectedHealthStatuses: Set<HealthStatus>
  selectedClusters: Set<string>
  selectedProjects: Set<string>
  selectedManifestTypes: Set<ManifestType>
  selectedSyncPolicies: Set<SyncPolicyType>
  onToggleSyncStatus: (s: SyncStatus) => void
  onToggleHealthStatus: (h: HealthStatus) => void
  onToggleCluster: (c: string) => void
  onToggleProject: (p: string) => void
  onToggleManifestType: (m: ManifestType) => void
  onToggleSyncPolicy: (sp: SyncPolicyType) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow down deployments by status, cluster, project, and more.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 flex-1 overflow-y-auto">
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

          <div className="h-px bg-border" />

          <FilterGroup label="Manifest Type">
            {manifestTypes.map((m) => (
              <FilterCheckbox
                key={m}
                label={m}
                checked={selectedManifestTypes.has(m)}
                onToggle={() => onToggleManifestType(m)}
              />
            ))}
          </FilterGroup>

          <div className="h-px bg-border" />

          <FilterGroup label="Sync Policy">
            {syncPolicyTypes.map((sp) => (
              <FilterCheckbox
                key={sp}
                label={sp}
                checked={selectedSyncPolicies.has(sp)}
                onToggle={() => onToggleSyncPolicy(sp)}
              />
            ))}
          </FilterGroup>
        </div>

        <DrawerFooter className="flex-row items-center justify-between px-6 pb-6">
          <span className="text-xs text-muted-foreground">
            {activeFilterCount > 0
              ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
              : "No filters active"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={activeFilterCount === 0}
          >
            Clear all
          </Button>
        </DrawerFooter>
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
      <DrawerContent className="sm:max-w-sm">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle>Sort</DrawerTitle>
          <DrawerDescription>
            Choose how deployments are ordered.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-6 pb-6 flex-1 overflow-y-auto">
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
