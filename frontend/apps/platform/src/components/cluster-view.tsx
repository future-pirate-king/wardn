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
import { ClusterCard } from "@/components/cluster-card"
import { ClusterList } from "@/components/cluster-list"
import { NumberedPagination } from "@/components/numbered-pagination"
import {
  mockClusters,
  clusterStatuses,
  clusterProviders,
  type Cluster,
  type ClusterStatus,
  type ClusterProvider,
} from "@/lib/clusters"
import type { SortDirection } from "@/components/deployment-view"
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

export type ClusterSortField = "name" | "status" | "region" | "nodeCount" | "lastSeen"
export type ClusterViewMode = "card" | "list"

const sortFieldLabels: Record<ClusterSortField, string> = {
  name: "Name",
  status: "Status",
  region: "Region",
  nodeCount: "Node Count",
  lastSeen: "Last Seen",
}

const statusOrder: Record<string, number> = { Connected: 0, Unknown: 1, Error: 2, Disconnected: 3 }


export function ClusterView() {
  const [viewMode, setViewMode] = React.useState<ClusterViewMode>("card")
  const [search, setSearch] = React.useState("")
  const [sortField, setSortField] = React.useState<ClusterSortField>("name")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [page, setPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [sortOpen, setSortOpen] = React.useState(false)

  const [selectedStatuses, setSelectedStatuses] = React.useState<Set<ClusterStatus>>(new Set())
  const [selectedProviders, setSelectedProviders] = React.useState<Set<ClusterProvider>>(new Set())

  const activeFilterCount = selectedStatuses.size + selectedProviders.size

  const toggleFilter = <T,>(set: Set<T>, value: T, setter: React.Dispatch<React.SetStateAction<Set<T>>>) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedStatuses(new Set())
    setSelectedProviders(new Set())
  }

  const handleSort = (field: ClusterSortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filtered = React.useMemo(() => {
    let result = mockClusters.filter((cluster) => {
      if (search) {
        const q = search.toLowerCase()
        const matches =
          cluster.name.toLowerCase().includes(q) ||
          cluster.serverUrl.toLowerCase().includes(q) ||
          cluster.region.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (selectedStatuses.size > 0 && !selectedStatuses.has(cluster.status)) return false
      if (selectedProviders.size > 0 && !selectedProviders.has(cluster.provider)) return false
      return true
    })

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name)
          break
        case "status":
          cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
          break
        case "region":
          cmp = a.region.localeCompare(b.region)
          break
        case "nodeCount":
          cmp = a.nodeCount - b.nodeCount
          break
        case "lastSeen":
          cmp = (a.lastSeen ?? "0").localeCompare(b.lastSeen ?? "0")
          break
      }
      return sortDirection === "asc" ? cmp : -cmp
    })

    return result
  }, [search, sortField, sortDirection, selectedStatuses, selectedProviders])

  React.useEffect(() => {
    setPage(0)
  }, [search, selectedStatuses, selectedProviders, pageSize])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages - 1)
  const paged = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-card p-3 dark:ring-1 dark:ring-foreground/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, server URL, region..."
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

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ClusterViewMode)}>
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl bg-card dark:ring-1 dark:ring-foreground/10 gap-2">
          <p className="text-sm text-muted-foreground">No clusters match your filters</p>
          {(activeFilterCount > 0 || search) && (
            <Button variant="outline" size="sm" onClick={() => { clearAllFilters(); setSearch("") }}>
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {paged.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      ) : (
        <ClusterList
          clusters={paged}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

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

      <ClusterFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        activeFilterCount={activeFilterCount}
        onClearAll={clearAllFilters}
        selectedStatuses={selectedStatuses}
        selectedProviders={selectedProviders}
        onToggleStatus={(s) => toggleFilter(selectedStatuses, s, setSelectedStatuses)}
        onToggleProvider={(p) => toggleFilter(selectedProviders, p, setSelectedProviders)}
      />

      <ClusterSortDrawer
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

function FilterCheckbox({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
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

function ClusterFilterDrawer({
  open,
  onOpenChange,
  activeFilterCount,
  onClearAll,
  selectedStatuses,
  selectedProviders,
  onToggleStatus,
  onToggleProvider,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  onClearAll: () => void
  selectedStatuses: Set<ClusterStatus>
  selectedProviders: Set<ClusterProvider>
  onToggleStatus: (s: ClusterStatus) => void
  onToggleProvider: (p: ClusterProvider) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Narrow down clusters by status and provider.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-6 pb-6 flex-1 overflow-y-auto">
          <FilterGroup label="Status">
            {clusterStatuses.map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={selectedStatuses.has(s)}
                onToggle={() => onToggleStatus(s)}
              />
            ))}
          </FilterGroup>

          <div className="h-px bg-border" />

          <FilterGroup label="Provider">
            {clusterProviders.map((p) => (
              <FilterCheckbox
                key={p}
                label={p}
                checked={selectedProviders.has(p)}
                onToggle={() => onToggleProvider(p)}
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
          <Button variant="outline" size="sm" onClick={onClearAll} disabled={activeFilterCount === 0}>
            Clear all
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ClusterSortDrawer({
  open,
  onOpenChange,
  sortField,
  sortDirection,
  onSortFieldChange,
  onSortDirectionChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sortField: ClusterSortField
  sortDirection: SortDirection
  onSortFieldChange: (field: ClusterSortField) => void
  onSortDirectionChange: (dir: SortDirection) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" modal={false}>
      <DrawerContent className="sm:max-w-sm">
        <DrawerHeader className="px-6 pt-6">
          <DrawerTitle>Sort</DrawerTitle>
          <DrawerDescription>
            Choose how clusters are ordered.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-6 pb-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground px-2 pb-1">Sort by</span>
            {(Object.keys(sortFieldLabels) as ClusterSortField[]).map((field) => (
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
