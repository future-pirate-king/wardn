"use client"

import * as React from "react"
import { Button } from "@repo/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@repo/ui/dropdown-menu"
import {
  Pagination as UiPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@repo/ui/pagination"

const pageSizeOptions = [10, 20, 50]

function getPageRange(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  const pages: (number | "ellipsis")[] = []
  pages.push(0)

  if (current > 2) {
    pages.push("ellipsis")
  }

  const start = Math.max(1, current - 1)
  const end = Math.min(totalPages - 2, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < totalPages - 3) {
    pages.push("ellipsis")
  }

  pages.push(totalPages - 1)
  return pages
}

export function NumberedPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
  const start = page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalItems)
  const pageRange = getPageRange(page, totalPages)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Showing {start}–{end} of {totalItems}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="xs">
                {pageSize} / page
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-32">
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              {pageSizeOptions.map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {size} / page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UiPagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Prev"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(Math.max(0, page - 1))
              }}
              aria-disabled={page === 0}
              className={page === 0 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {pageRange.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(p)
                  }}
                  href="#"
                >
                  {p + 1}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              text="Next"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(Math.min(totalPages - 1, page + 1))
              }}
              aria-disabled={page >= totalPages - 1}
              className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </UiPagination>
    </div>
  )
}
