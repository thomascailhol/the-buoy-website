"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Locale } from "@/middleware";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  locale: Locale;
  slug: string;
  perPage: number;
  previousLabel: string;
  nextLabel: string;
  pageLabel: string;
};

export function PaginationControls({
  currentPage,
  totalPages,
  locale,
  slug,
  perPage,
  previousLabel,
  nextLabel,
  pageLabel,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set("page", page.toString());
    }
    // Preserve per_page parameter
    if (perPage !== 20) {
      params.set("per_page", perPage.toString());
    }
    const queryString = params.toString();
    return `/${locale}/buoy/${slug}${queryString ? `?${queryString}` : ""}`;
  };

  // Generate page numbers to show (current page ± 2)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
      <div className="flex items-center gap-2">
        {previousPage ? (
          <Link
            href={getPageUrl(previousPage)}
            scroll={false}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {previousLabel}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-md cursor-not-allowed opacity-50">
            <ChevronLeft className="h-4 w-4" />
            {previousLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;
          return (
            <Link
              key={page}
              href={getPageUrl(page)}
              scroll={false}
              className={`inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 text-sm font-medium rounded-md transition-colors ${
                isCurrentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground bg-background border border-border hover:bg-muted"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {nextPage ? (
          <Link
            href={getPageUrl(nextPage)}
            scroll={false}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-md cursor-not-allowed opacity-50">
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
