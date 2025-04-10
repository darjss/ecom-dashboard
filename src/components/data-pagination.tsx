"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Updated Props for Cursor Pagination
export interface CursorPaginationProps {
  // Renamed interface + updated props
  hasNextPage: boolean;
  hasPreviousPage: boolean; // Keep for potential future use
  onNextPage: () => void | Promise<void>;
  onPreviousPage: () => void | Promise<void>; // Keep for potential future use
  isLoading?: boolean;
  className?: string;
}

export function DataPagination({
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  isLoading = false,
  className = "",
}: CursorPaginationProps) {
  // Use renamed interface

  const handleNext = async () => {
    if (isLoading || !hasNextPage) return;
    await onNextPage();
  };

  const handlePrevious = async () => {
    // Basic implementation, relies on parent component managing previous cursors
    if (isLoading || !hasPreviousPage) return;
    await onPreviousPage();
  };

  // Removed page number calculation logic (getPageNumbers, pageNumbers, ellipses)

  return (
    <div className={` ${className}`}>
      {/* Removed total count text */}
      <Pagination className="justify-center">
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={
                !hasPreviousPage || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }
              aria-disabled={!hasPreviousPage || isLoading}
            />
          </PaginationItem>

          {/* Removed Page Numbers and Ellipses */}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              className={
                !hasNextPage || isLoading
                  ? "pointer-events-none opacity-50"
                  : ""
              }
              aria-disabled={!hasNextPage || isLoading}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
