export function ReadingsTableSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 w-6 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>

      {/* Table header skeleton */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex border-b border-border py-3 px-2 gap-4">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded flex-1 text-center" />
            <div className="h-4 w-16 bg-muted rounded flex-1 text-center" />
            <div className="h-4 w-16 bg-muted rounded flex-1 text-center" />
            <div className="h-4 w-16 bg-muted rounded flex-1 text-center" />
            <div className="h-4 w-16 bg-muted rounded flex-1 text-center" />
          </div>

          {/* Table rows skeleton */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex border-b border-border/50 py-3 px-2 gap-4"
              style={{ opacity: 1 - i * 0.1 }}
            >
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded flex-1 mx-auto" />
              <div className="h-4 w-12 bg-muted rounded flex-1 mx-auto" />
              <div className="h-4 w-12 bg-muted rounded flex-1 mx-auto" />
              <div className="h-4 w-16 bg-muted rounded flex-1 mx-auto" />
              <div className="h-4 w-12 bg-muted rounded flex-1 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for table rows only (used when header is already visible)
export function ReadingsTableRowsSkeleton({
  rowCount = 10,
}: {
  rowCount?: number;
}) {
  return (
    <tbody className="animate-pulse">
      {Array.from({ length: rowCount }).map((_, i) => (
        <tr key={i} className="border-b border-border/50">
          <td className="py-3 px-2">
            <div
              className="h-4 w-24 bg-muted rounded"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-8 w-16 bg-blue-200 rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-4 w-12 bg-muted rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-4 w-10 bg-muted rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-4 w-14 bg-muted rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-4 w-10 bg-muted rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
          <td className="py-3 px-2">
            <div
              className="h-4 w-12 bg-muted rounded mx-auto"
              style={{ opacity: 1 - i * 0.08 }}
            />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function NearbyBuoysSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 bg-muted rounded" />
        <div className="h-5 w-32 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-6 w-14 bg-background rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NearbySpotsSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 bg-muted rounded" />
        <div className="h-5 w-28 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-6 w-14 bg-background rounded-full flex-shrink-0 ml-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
