"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { type Locale } from "@/middleware";

type PerPageSelectorProps = {
  currentPerPage: number;
  locale: Locale;
  slug: string;
  label: string;
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function PerPageSelector({
  currentPerPage,
  locale,
  slug,
  label,
}: PerPageSelectorProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (newPerPage: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 when changing per page
    if (newPerPage !== "20") {
      params.set("per_page", newPerPage);
    } else {
      params.delete("per_page"); // Remove if default
    }
    params.delete("page"); // Remove page param to go to page 1

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

    // Use router.push for smooth navigation without full page refresh
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="per-page-select"
        className="text-sm text-muted-foreground"
      >
        {label}:
      </label>
      <select
        id="per-page-select"
        value={currentPerPage}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {PER_PAGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
