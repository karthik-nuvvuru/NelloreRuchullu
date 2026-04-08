'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonMenuGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonOrderRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <SkeletonMenuGrid count={6} />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-6 h-fit space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
