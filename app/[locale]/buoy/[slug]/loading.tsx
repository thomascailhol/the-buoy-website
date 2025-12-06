import { ArrowLeft } from 'lucide-react';
import { ReadingsTableSkeleton } from './skeletons';

export default function BuoyDetailLoading() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="inline-flex items-center text-primary font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <header className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="container max-w-5xl mx-auto animate-pulse">
          <div className="mb-4">
            {/* Title skeleton */}
            <div className="h-10 md:h-12 lg:h-14 w-64 md:w-80 bg-muted rounded mb-3" />
            {/* Location skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-5 w-48 bg-muted rounded" />
            </div>
          </div>
          {/* Last update skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          {/* Source skeleton */}
          <div className="mt-2">
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        {/* Readings History Table Skeleton */}
        <div className="container max-w-5xl mx-auto px-4">
          <ReadingsTableSkeleton />
        </div>

        {/* Information Section Skeleton */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-muted/50 border rounded-xl p-6 mb-8 animate-pulse">
            <div className="h-6 w-48 bg-muted rounded mb-4" />
            <div className="space-y-4">
              <div>
                <div className="h-5 w-40 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded mt-1" />
              </div>
              <div>
                <div className="h-5 w-36 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section Skeleton */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-primary/5 rounded-xl p-8 text-center animate-pulse">
            <div className="h-7 w-48 bg-muted rounded mx-auto mb-4" />
            <div className="h-4 w-72 bg-muted rounded mx-auto mb-6" />
            <div className="h-10 w-40 bg-muted rounded mx-auto" />
          </div>
        </div>
      </section>
    </main>
  );
}

